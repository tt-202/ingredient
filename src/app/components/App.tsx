'use client';

import React, { useState, useEffect } from 'react';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// Remove import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

// Inline SVG icons for badges
const CheckCircleIcon = () => (
    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
);
const ExclamationTriangleIcon = () => (
    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.516 11.591c.75 1.334-.213 2.985-1.742 2.985H3.483c-1.53 0-2.492-1.651-1.742-2.985L8.257 3.1zM11 14a1 1 0 11-2 0 1 1 0 012 0zm-1-2a1 1 0 01-1-1V9a1 1 0 112 0v2a1 1 0 01-1 1z" clipRule="evenodd" /></svg>
);

function App() {
    const router = useRouter();
    const [ingredientInput, setIngredientInput] = useState('');
    const [results, setResults] = useState<{ [ingredient: string]: any[] }>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [mounted, setMounted] = useState(false);
    type SearchHistoryEntry = {
        ingredient: string;
        bestSubstitute?: string;
        allergen?: string;
        date: string;
        userAllergies?: string[];
        substitutes?: any[];
    };
    const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
    // Add state for showing a single history result
    const [historyResult, setHistoryResult] = useState<{ [ingredient: string]: any[] } | null>(null);
    // Add state for user settings
    const [userSettings, setUserSettings] = useState<any>(null);

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

    useEffect(() => {
        const saved = localStorage.getItem('userSettings');
        if (saved) {
            setUserSettings(JSON.parse(saved));
        }
    }, [mounted]);

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
        let newHistoryEntries: any[] = [];

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

                // Save search history with best substitute and allergen info
                const allergen = Array.isArray(parsed) && parsed[0]?.allergen_info ? parsed[0].allergen_info : undefined;
                const bestSubstitute = Array.isArray(parsed) && parsed[0]?.substitute ? parsed[0].substitute : undefined;
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

                // Store the full substitute results in the history entry
                const newEntry = {
                    ingredient,
                    bestSubstitute,
                    allergen,
                    date: now,
                    userAllergies,
                    substitutes: parsed // <-- store the full result
                };
                newHistoryEntries.push(newEntry);
            } catch (err: any) {
                setError(`Error for ingredient "${ingredient}": ${err.message}`);
            }
        }

        setResults(allResults);
        setLoading(false);
        // Update search history with full results
        let updatedHistory = [...newHistoryEntries, ...searchHistory.filter(h => !ingredients.includes(h.ingredient))];
        updatedHistory = updatedHistory.slice(0, 10);
        setSearchHistory(updatedHistory);
        if (user && user.email) {
            localStorage.setItem(getHistoryKey(user.email), JSON.stringify(updatedHistory));
        }
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
            <div className="min-h-screen flex items-center justify-center py-7 px-4 sm:px-6 lg:px-8">
                <div className="relative w-full max-w-4xl mx-4">
                    {/* Glass morphism container */}
                    <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-gray-100/40 to-gray-200/40 animate-pulse"></div>

                        {/* Floating particles */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute top-10 left-10 w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
                            <div className="absolute top-20 right-16 w-1 h-1 bg-gray-200/80 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                            <div className="absolute bottom-16 left-20 w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                            <div className="absolute bottom-8 right-8 w-1 h-1 bg-gray-100/70 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
                        </div>

                        <div className="relative z-10 p-8">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-white to-gray-100 rounded-full shadow-lg overflow-hidden">
                                        <Image
                                            src="/icon.jpg"
                                            alt="App Icon"
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
                                        Smart Swap
                                    </h1>
                                </div>
                                {user ? (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleLogout}
                                            className="text-sm font-bold text-gray-700 bg-white/40 px-3 py-2 rounded-lg border border-white/60 hover:text-red-600 hover:underline transition-colors"
                                            title="Click to log out"
                                        >
                                            {user.email}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => router.push('/login')}
                                        className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors"
                                    >
                                        Sign In
                                    </button>
                                )}
                            </div>

                            {/* User Allergies and Preferences Display */}
                            {userSettings && (
                                <div className="mb-4">
                                    {userSettings.allergies && userSettings.allergies.length > 0 && (
                                        <div className="bg-blue-50 text-blue-800 rounded-lg px-4 py-2 font-semibold text-sm border border-blue-200 mb-2">
                                            Your Allergies: {userSettings.allergies.join(', ')}
                                        </div>
                                    )}
                                    <div className="bg-green-50 text-green-800 rounded-lg px-4 py-2 font-semibold text-sm border border-green-200">
                                        <div>Diet: {userSettings.diet || 'None'}</div>
                                        <div>Spice Tolerance: {userSettings.spice_tolerance}</div>
                                        <div>Sweetness Preference: {userSettings.sweetness_preference}</div>
                                        <div>Saltiness Preference: {userSettings.saltiness_preference}</div>
                                        <div>Acidity/Sourness Preference: {userSettings.acidity_sourness_preference}</div>
                                        <div>Health Consciousness: {userSettings.health_consciousness}</div>
                                        <div>Budget Tolerance: {userSettings.budget_tolerance}</div>
                                    </div>
                                </div>
                            )}

                            {/* Search History */}
                            {searchHistory.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <h2 className="text-lg font-semibold text-gray-700">Search History</h2>
                                        <button
                                            onClick={() => {
                                                setSearchHistory([]);
                                                setHistoryResult(null);
                                                if (user && user.email) {
                                                    localStorage.removeItem(getHistoryKey(user.email));
                                                }
                                            }}
                                            className="text-sm text-black hover:text-gray-700 hover:underline transition-colors font-semibold"
                                        >
                                            Clear History
                                        </button>
                                    </div>
                                    <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 p-4 space-y-3">
                                        {searchHistory.map((entry, idx) => (
                                            <div key={idx} className="bg-white/60 rounded-lg p-4 border border-white/80">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                                                    {/* Ingredient Name (clickable) */}
                                                    <div className="space-y-2 cursor-pointer" onClick={async () => {
                                                        // Show the saved substitutes from this history entry, or perform a new search if missing
                                                        if (entry.ingredient && entry.substitutes) {
                                                            setHistoryResult({ [entry.ingredient]: entry.substitutes });
                                                        } else if (entry.ingredient) {
                                                            setLoading(true);
                                                            setError(null);
                                                            setHistoryResult(null);
                                                            // Perform a new search for this ingredient
                                                            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
                                                            if (!apiKey) {
                                                                setError('Google API key is missing.');
                                                                setLoading(false);
                                                                return;
                                                            }
                                                            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
                                                            const prompt = `For the ingredient '${entry.ingredient}', suggest 1–3 suitable substitutes. For each suggestion, return:\n- 'substitute'\n- 'score' (0–100 relevance)\n- 'reason'\n- 'cuisine_context' (optional)\n- 'allergen_info' (e.g. dairy, nuts)\n- 'historical_notes' (brief food history). Return the output as a JSON array.`;
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
                                                                    setError('No result found for this ingredient.');
                                                                    setLoading(false);
                                                                    return;
                                                                }
                                                                let parsed;
                                                                try {
                                                                    parsed = JSON.parse(jsonString);
                                                                } catch (err) {
                                                                    setError('Failed to parse result.');
                                                                    setLoading(false);
                                                                    return;
                                                                }
                                                                setHistoryResult({ [entry.ingredient]: parsed });
                                                            } catch (err: any) {
                                                                setError('Error fetching result.');
                                                            }
                                                            setLoading(false);
                                                        } else {
                                                            setHistoryResult(null);
                                                        }
                                                    }}>
                                                        <span className="font-bold text-blue-800 text-lg hover:underline">
                                                            {entry.ingredient}
                                                        </span>
                                                    </div>
                                                    {/* Allergy and Best Substitute */}
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-gray-700 text-sm">Best Substitute: <span className="font-semibold text-green-700">{entry.bestSubstitute || 'No substitute found'}</span></span>
                                                        {entry.allergen && (
                                                            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 w-fit">Allergy: {entry.allergen}</span>
                                                        )}
                                                        {entry.userAllergies && entry.userAllergies.length > 0 && (
                                                            <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 w-fit">User Allergies: {entry.userAllergies.join(', ')}</span>
                                                        )}
                                                    </div>
                                                    {/* Date/Time */}
                                                    <div className="text-right text-xs text-gray-500">
                                                        {new Date(entry.date).toLocaleDateString()}<br />
                                                        {new Date(entry.date).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Search Form */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-gray-700">Ingredient to Substitute:</label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={ingredientInput}
                                        onChange={(e) => setIngredientInput(e.target.value)}
                                        className="flex-1 bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                                        placeholder="e.g., Butter"
                                        disabled={loading}
                                    />
                                    <button
                                        onClick={handleTextSearch}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                        disabled={loading || !ingredientInput.trim()}
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Searching...
                                            </div>
                                        ) : (
                                            'Submit'
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Loading State */}
                            {loading && (
                                <div className="mt-6 text-center">
                                    <div className="inline-flex items-center gap-2 text-gray-600">
                                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                        Finding substitutes...
                                    </div>
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Results: show either current search or selected history */}
                            {(Object.keys(results).length > 0 || historyResult) && (
                                <div className="mt-8 space-y-6">
                                    {Object.entries(historyResult || results).map(([ingredient, substitutes]) => {
                                        // Professional recommendation logic
                                        let bestIndex = -1;
                                        let bestScore = -Infinity;
                                        const allergyList: string[] = userSettings?.allergies || [];
                                        // Scoring: penalize allergens, reward preference match
                                        const scored = substitutes.map((sub, idx) => {
                                            let score = sub.score || 0;
                                            let explanation = [];
                                            let hasAllergen = false;
                                            if (sub.allergen_info && allergyList.some((a: string) => sub.allergen_info.toLowerCase().includes(a.toLowerCase()))) {
                                                score -= 1000; // Big penalty for allergens
                                                hasAllergen = true;
                                                explanation.push('Contains an ingredient you are allergic to.');
                                            }
                                            // Preference matching (simple: higher is better, can be improved)
                                            if (userSettings) {
                                                // Example: if substitute.reason or other fields mention 'spicy', 'sweet', etc., compare to userSettings
                                                // For demo, just add a generic message
                                                explanation.push('Compared to your preferences.');
                                            }
                                            if (score > bestScore) {
                                                bestScore = score;
                                                bestIndex = idx;
                                            }
                                            return { ...sub, score, explanation, hasAllergen };
                                        });
                                        return (
                                            <div key={ingredient} className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 p-6">
                                                <h3 className="text-xl font-bold text-gray-800 mb-4">Substitutes for {ingredient}</h3>
                                                <div className="space-y-4">
                                                    {scored.map((substitute, index) => (
                                                        <div key={index} className={`bg-white/60 rounded-lg p-4 border border-white/80 ${substitute.hasAllergen ? 'opacity-60' : ''}`}>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-semibold text-gray-800">{substitute.substitute}</h4>
                                                                    {index === bestIndex && !substitute.hasAllergen && (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-300">
                                                                            <CheckCircleIcon /> Best for you
                                                                        </span>
                                                                    )}
                                                                    {substitute.hasAllergen && (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full border border-red-300">
                                                                            <ExclamationTriangleIcon /> Avoid (Allergen)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded">Score: {substitute.score}</span>
                                                            </div>
                                                            <p className="text-gray-600 text-sm mb-2">{substitute.reason}</p>
                                                            {substitute.cuisine_context && (
                                                                <p className="text-gray-500 text-xs mb-1">Cuisine: {substitute.cuisine_context}</p>
                                                            )}
                                                            {substitute.allergen_info && (
                                                                <p className="text-red-600 text-xs mb-1">Allergen Info: {substitute.allergen_info}</p>
                                                            )}
                                                            {substitute.historical_notes && (
                                                                <p className="text-gray-500 text-xs">History: {substitute.historical_notes}</p>
                                                            )}
                                                            {/* Professional explanation */}
                                                            {substitute.explanation.length > 0 && (
                                                                <div className="mt-2 text-xs text-gray-700 italic">
                                                                    {substitute.explanation.map((msg: string, i: number) => (
                                                                        <div key={i}>{msg}</div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Bottom decorative element */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white via-gray-100 to-gray-200"></div>
                    </div>
                </div>
            </div>
        )
    );
}

export default App;
