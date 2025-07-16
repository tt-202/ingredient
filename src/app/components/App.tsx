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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    const findSubstitutes = async (ingredients: string[]) => {
        setLoading(true);
        setResults({});
        setError(null);

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
        console.log('API Key present:', !!apiKey);
        console.log('API Key length:', apiKey?.length);

        if (!apiKey) {
            setError('Google API key is missing. Please set NEXT_PUBLIC_GOOGLE_API_KEY environment variable.');
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
                console.log(`Making API request for ingredient: ${ingredient}`);
                console.log('API URL:', apiUrl);
                console.log('Payload:', JSON.stringify(payload, null, 2));

                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                console.log('Response status:', res.status);
                console.log('Response headers:', Object.fromEntries(res.headers.entries()));

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error(`API Error (${res.status}):`, errorText);
                    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
                }

                const data = await res.json();
                console.log('Full API Response:', JSON.stringify(data, null, 2));

                const jsonString = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                console.log('Extracted JSON string:', jsonString);

                if (!jsonString) {
                    console.error('Empty response from Gemini:', data);
                    console.error('Response structure:', {
                        hasCandidates: !!data?.candidates,
                        candidatesLength: data?.candidates?.length,
                        hasContent: !!data?.candidates?.[0]?.content,
                        hasParts: !!data?.candidates?.[0]?.content?.parts,
                        partsLength: data?.candidates?.[0]?.content?.parts?.length,
                        hasText: !!data?.candidates?.[0]?.content?.parts?.[0]?.text
                    });

                    // Try a simpler approach without structured output
                    console.log('Trying fallback approach...');
                    const fallbackPayload = {
                        contents: [{
                            role: 'user',
                            parts: [{
                                text: `For the ingredient '${ingredient}', suggest 1-3 suitable substitutes. Return as JSON array with objects containing: substitute, score (0-100), reason, cuisine_context, allergen_info, historical_notes.`
                            }]
                        }]
                    };

                    const fallbackRes = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(fallbackPayload),
                    });

                    if (!fallbackRes.ok) {
                        throw new Error(`Fallback API request failed: ${fallbackRes.status}`);
                    }

                    const fallbackData = await fallbackRes.json();
                    console.log('Fallback response:', fallbackData);

                    const fallbackText = fallbackData?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!fallbackText) {
                        throw new Error('Gemini response missing or empty. Please check your API key and try again.');
                    }

                    try {
                        const fallbackParsed = JSON.parse(fallbackText);
                        if (Array.isArray(fallbackParsed)) {
                            allResults[ingredient] = fallbackParsed;
                            continue;
                        }
                    } catch (fallbackErr) {
                        console.error('Fallback parsing failed:', fallbackErr);
                    }

                    throw new Error('Gemini response missing or empty. Please check your API key and try again.');
                }

                let parsed;
                try {
                    parsed = JSON.parse(jsonString);
                } catch (err) {
                    console.error('Failed to parse Gemini response:', err);
                    console.error('Raw response:', jsonString);
                    throw new Error('Failed to parse Gemini response as JSON. Please try again.');
                }

                if (!Array.isArray(parsed)) {
                    console.error('Parsed response is not an array:', parsed);
                    throw new Error('Expected array response from Gemini API.');
                }

                console.log('Successfully parsed response:', parsed);
                allResults[ingredient] = parsed;
            } catch (err: any) {
                console.error(`Error for ingredient "${ingredient}":`, err);
                setError(`Error for ingredient "${ingredient}": ${err.message}`);
                break; // Stop processing other ingredients if one fails
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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-6 font-sans">
            <div className="flex justify-between items-center w-full max-w-2xl mb-4">
                <h1 className="text-4xl font-bold text-indigo-700">Smart Swap</h1>
                <div className="flex items-center gap-3">
                    {user && (
                        <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded border">
                            {user.email}
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="text-sm bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-2xl">
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

            {loading && (
                <div className="mt-6 text-gray-600">
                    <p>Finding substitutes...</p>
                </div>
            )}

            {error && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded w-full max-w-xl">
                    {error}
                </div>
            )}

            {!loading && Object.keys(results).length > 0 && (
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
            )}
        </div>
    );
}

export default App;