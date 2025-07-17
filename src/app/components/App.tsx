'use client';

import React, { useState, useEffect } from 'react';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

function App() {
    const router = useRouter();
    const [ingredientInput, setIngredientInput] = useState('');
    const [results, setResults] = useState<{ [ingredient: string]: any[] }>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [mounted, setMounted] = useState(false);
    const [searchHistory, setSearchHistory] = useState<{ ingredient: string; allergen?: string; date: string; userAllergies?: string[] }[]>([]);

    // Helper to get the localStorage key for the current user
    const getHistoryKey = (email?: string | null) => email ? `smartSwapSearchHistory:${email}` : '';

    useEffect(() => {
        setMounted(true);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    // Load user-specific search history when user changes
    useEffect(() => {
        if (user && user.email) {
            const history = localStorage.getItem(getHistoryKey(user.email));
            if (history) {
                setSearchHistory(JSON.parse(history));
            } else {
                setSearchHistory([]);
            }
        } else {
            setSearchHistory([]);
        }
    }, [user]);

    const findSubstitutes = async (ingredients: string[]) => {
        setLoading(true);
        setResults({});
        setError(null);

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
        if (!apiKey) {
            setError('Google API key is missing.');
            setLoading(false);
            return;
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const allResults: { [ingredient: string]: any[] } = {};

        for (const ingredient of ingredients) {
            const prompt = `For the ingredient '${ingredient}', suggest 1–3 suitable substitutes. For each suggestion, return:\n- 'substitute'\n- 'score' (0–100 relevance)\n- 'reason'\n- 'cuisine_context' (optional)\n- 'allergen_info' (e.g. dairy, nuts)\n- 'historical_notes' (brief food history). Return the output as a JSON array.`;

            const payload = {
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                substitute: { type: 'STRING' },
                                score: { type: 'NUMBER' },
                                reason: { type: 'STRING' },
                                cuisine_context: { type: 'STRING' },
                                allergen_info: { type: 'STRING' },
                                historical_notes: { type: 'STRING' },
                            },
                            required: ['substitute', 'score', 'reason'],
                        },
                    },
                },
            };

            try {
                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const data = await res.json();
                const jsonString = data?.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!jsonString) {
                    console.warn('Empty response:', JSON.stringify(data, null, 2));
                    throw new Error('Gemini response missing or empty.');
                }

                let parsed;
                try {
                    parsed = JSON.parse(jsonString);
                } catch (err) {
                    console.warn('Failed to parse Gemini response:', err);
                    throw new Error('Failed to parse Gemini response as JSON.');
                }

                allResults[ingredient] = parsed;

                // Save allergen_info from the first result in search history (if available)
                const allergen = Array.isArray(parsed) && parsed[0]?.allergen_info ? parsed[0].allergen_info : undefined;
                const now = new Date().toISOString();
                // Get user allergies from localStorage
                let userAllergies: string[] | undefined = undefined;
                if (user && user.email) {
                    const stored = localStorage.getItem(`userAllergies:${user.email}`);
                    if (stored) {
                        try {
                            userAllergies = JSON.parse(stored);
                        } catch { }
                    }
                }
                const newEntry = { ingredient, allergen, date: now, userAllergies };
                let updatedHistory = [newEntry, ...searchHistory.filter(h => h.ingredient !== ingredient)];
                updatedHistory = updatedHistory.slice(0, 10);
                setSearchHistory(updatedHistory);
                if (user && user.email) {
                    localStorage.setItem(getHistoryKey(user.email), JSON.stringify(updatedHistory));
                }
            } catch (err: any) {
                setError(`Error for ingredient "${ingredient}": ${err.message}`);
            }
        }

        setResults(allResults);
        setLoading(false);
    };

    const handleTextSearch = () => {
        const trimmed = ingredientInput.trim();
        if (trimmed) {
            findSubstitutes([trimmed]);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch {
            console.error('Logout failed');
        }
    };


    return (
        !mounted ? null : (
            <div
                className="min-h-screen flex flex-col items-center justify-start p-6 font-sans"
            >

                <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold text-gray-700">Smart Swap</h1>
                    </div>
                    {user ? (
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-gray-700">{user.email}</span>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-black hover:underline hover:text-gray-800 px-3 py-1 bg-transparent border-none shadow-none focus:outline-none"
                                style={{ background: 'none', border: 'none', boxShadow: 'none' }}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <button
                                onClick={() => router.push('/login')}
                                className="text-sm text-indigo-700 underline hover:text-indigo-900 px-3 py-1 bg-transparent border-none shadow-none focus:outline-none"
                                style={{ background: 'none', border: 'none', boxShadow: 'none' }}
                            >
                                Sign In
                            </button>
                        </div>
                    )}
                    {/* Search History */}
                    {/* User Allergies Display */}
                    {user && user.email && (() => {
                        const stored = localStorage.getItem(`userAllergies:${user.email}`);
                        if (stored) {
                            try {
                                const allergies = JSON.parse(stored);
                                if (Array.isArray(allergies) && allergies.length > 0) {
                                    return (
                                        <div className="w-full max-w-2xl mb-2">
                                            <div className="bg-blue-50 text-blue-800 rounded-lg px-4 py-2 font-semibold text-sm">
                                                User Allergies: {allergies.join(', ')}
                                            </div>
                                        </div>
                                    );
                                }
                            } catch { }
                        }
                        return null;
                    })()}
                    {searchHistory.length > 0 && (
                        <div className="w-full max-w-2xl mb-6">
                            <h2 className="text-lg font-semibold mb-2 text-gray-700">Search History</h2>
                            <ul className="bg-gray-50 rounded-lg shadow p-4 divide-y divide-gray-200">
                                {searchHistory.map((entry, idx) => (
                                    <li key={idx} className="py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                        <div>
                                            <span className="font-medium text-gray-900">{entry.ingredient}</span>
                                            {entry.allergen && (
                                                <span className="ml-2 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">Allergy: {entry.allergen}</span>
                                            )}
                                            {entry.userAllergies && entry.userAllergies.length > 0 && (
                                                <span className="ml-2 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">User Allergies: {entry.userAllergies.join(', ')}</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500">{new Date(entry.date).toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <label className="block text-sm font-semibold mb-2">Ingredient to Substitute:</label>
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={ingredientInput}
                            onChange={(e) => setIngredientInput(e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-4 py-2"
                            placeholder="e.g., Butter"
                            disabled={loading}
                        />
                        <button
                            onClick={handleTextSearch}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            disabled={loading || !ingredientInput.trim()}
                        >
                            Submit
                        </button>
                    </div>
                </div>

                {
                    loading && (
                        <div className="mt-6 text-gray-600">
                            <p>Finding substitutes...</p>
                        </div>
                    )
                }

                {
                    error && (
                        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded w-full max-w-xl">
                            {error}
                        </div>
                    )
                }

                {
                    !loading && Object.keys(results).length > 0 && (
                        <div className="mt-8 w-full max-w-3xl space-y-6">
                            {Object.entries(results).map(([ingredient, subs]) => (
                                <div key={ingredient} className="mb-4 p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                                    <h2 className="font-semibold mb-2">Substitutes for <span className="text-indigo-700">{ingredient}</span>:</h2>
                                    {Array.isArray(subs) && subs.map((item, subIdx) => (
                                        <div key={subIdx} className="mb-2 pl-2">
                                            <p><strong>{item.substitute}</strong> — Score: {item.score}/100</p>
                                            <p className="text-sm text-gray-700">{item.reason}</p>
                                            {item.cuisine_context && (
                                                <p className="text-sm text-gray-600">Cuisine: {item.cuisine_context}</p>
                                            )}
                                            {item.allergen_info && (
                                                <p className="text-sm text-red-600">Allergen Info: {item.allergen_info}</p>
                                            )}
                                            {item.historical_notes && (
                                                <p className="text-sm text-gray-600 italic">History: {item.historical_notes}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )
                }
            </div>
        )
    );
}

export default App;
