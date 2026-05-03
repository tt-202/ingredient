'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function MealPrepPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [userSettings, setUserSettings] = useState<any>(null);
    const [mounted, setMounted] = useState(false);
    const [mealInput, setMealInput] = useState('');
    const [cookingSteps, setCookingSteps] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('userSettings');
        if (saved) {
            setUserSettings(JSON.parse(saved));
        }
    }, [mounted]);

    const preparationSteps = [
        {
            title: "Plan Your Meals",
            description: "Decide what you want to cook for the week ahead",
            tips: [
                "Check your pantry and fridge for existing ingredients",
                "Plan meals around your dietary restrictions",
                "Consider your schedule and cooking time available",
                "Make a shopping list based on your meal plan"
            ]
        },
        {
            title: "Gather Ingredients",
            description: "Ensure you have all necessary ingredients before starting",
            tips: [
                "Use our Smart Swap feature to find alternatives for missing ingredients",
                "Check ingredient freshness and expiration dates",
                "Measure ingredients before starting to cook",
                "Prepare any ingredients that need chopping or prepping"
            ]
        },
        {
            title: "Set Up Your Kitchen",
            description: "Organize your cooking space for efficiency",
            tips: [
                "Clear your counter space for food preparation",
                "Gather all necessary cooking tools and equipment",
                "Preheat your oven if needed",
                "Set up your cooking station with ingredients within reach"
            ]
        },
        {
            title: "Follow Safety Guidelines",
            description: "Ensure safe food handling and cooking practices",
            tips: [
                "Wash your hands thoroughly before cooking",
                "Clean all surfaces and cutting boards",
                "Keep raw and cooked foods separate",
                "Cook foods to proper internal temperatures"
            ]
        },
        {
            title: "Cook with Confidence",
            description: "Use your personalized settings to enhance your cooking",
            tips: [
                "Adjust seasoning based on your taste preferences",
                "Consider your spice tolerance when adding heat",
                "Modify recipes to match your dietary needs",
                "Use ingredients that align with your health goals"
            ]
        }
    ];

    const dietaryTips = {
        "Vegetarian": "Focus on protein-rich plant foods like beans, lentils, and quinoa",
        "Vegan": "Ensure adequate B12 and iron from fortified foods or supplements",
        "Gluten-Free": "Use certified gluten-free ingredients and check all labels",
        "Keto": "Focus on high-fat, low-carb ingredients and avoid grains",
        "Paleo": "Use whole, unprocessed foods and avoid grains and dairy"
    };

    const generateCookingInstructions = async () => {
        if (!mealInput.trim()) return;

        setLoading(true);
        setError(null);
        setCookingSteps([]);

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY?.trim();
        if (!apiKey) {
            setError('Google API key is missing.');
            setLoading(false);
            return;
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${encodeURIComponent(apiKey)}`;

        let dietaryContext = '';
        if (userSettings) {
            if (userSettings.diet) {
                dietaryContext += ` The user follows a ${userSettings.diet} diet.`;
            }
            if (userSettings.allergies && userSettings.allergies.length > 0) {
                dietaryContext += ` The user has allergies to: ${userSettings.allergies.join(', ')}.`;
            }
            dietaryContext += ` The user's spice tolerance is ${userSettings.spice_tolerance}/5, sweetness preference is ${userSettings.sweetness_preference}/5, and health consciousness is ${userSettings.health_consciousness}/5.`;
        }

        const prompt = `Create detailed step-by-step cooking instructions for "${mealInput}" like a professional chef would explain it.${dietaryContext}

        Return the response as a JSON array with objects containing:
        - step_number (number)
        - title (string) - brief step title
        - description (string) - detailed chef-like explanation
        - tips (string) - professional cooking tips
        - time_estimate (string) - estimated time for this step
        - difficulty (string) - "Easy", "Medium", or "Hard"

        Make it engaging and educational, as if teaching a cooking class. Include professional techniques, timing, and tips.`;

        const payload = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            step_number: { type: 'NUMBER' },
                            title: { type: 'STRING' },
                            description: { type: 'STRING' },
                            tips: { type: 'STRING' },
                            time_estimate: { type: 'STRING' },
                            difficulty: { type: 'STRING' }
                        },
                        required: ['step_number', 'title', 'description', 'tips', 'time_estimate', 'difficulty']
                    }
                }
            }
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
                throw new Error('No response from cooking assistant.');
            }

            let parsed;
            try {
                parsed = JSON.parse(jsonString);
            } catch {
                throw new Error('Failed to parse cooking instructions.');
            }

            setCookingSteps(parsed);
        } catch (err: any) {
            setError(`Error generating cooking instructions: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };



    return (
        !mounted ? null : (
            <div className="min-h-screen flex items-center justify-center py-7 px-4 sm:px-6 lg:px-8">
                <div className="relative w-full max-w-6xl mx-4">
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
                            <div className="flex justify-between items-center mb-8">
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
                                        Meal Preparation Guide
                                    </h1>
                                </div>
                                <div className="flex items-center gap-3">
                                    {user && (
                                        <button
                                            onClick={() => router.push('/login')}
                                            className="text-sm font-bold text-gray-700 bg-white/40 px-3 py-2 rounded-lg border border-white/60 hover:text-red-600 hover:underline transition-colors"
                                            title="Click to log out"
                                        >
                                            {user.email}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* User Settings Display */}
                            {userSettings && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Personalized Settings</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {userSettings.allergies && userSettings.allergies.length > 0 && (
                                            <div className="bg-red-50 text-red-800 rounded-lg px-4 py-3 font-semibold text-sm border border-red-200">
                                                <div className="font-bold mb-1">⚠️ Allergies to Avoid:</div>
                                                {userSettings.allergies.join(', ')}
                                            </div>
                                        )}
                                        <div className="bg-blue-50 text-blue-800 rounded-lg px-4 py-3 font-semibold text-sm border border-blue-200">
                                            <div className="font-bold mb-1">🍽️ Your Preferences:</div>
                                            <div>Diet: {userSettings.diet || 'None'}</div>
                                            <div>Spice Level: {userSettings.spice_tolerance}/5</div>
                                            <div>Health Focus: {userSettings.health_consciousness}/5</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cooking Instructions Input */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Get Chef-Level Cooking Instructions</h2>

                                <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 p-6">
                                    <div className="space-y-4">
                                        <label className="block text-sm font-semibold text-gray-700">What would you like to cook?</label>
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={mealInput}
                                                onChange={(e) => setMealInput(e.target.value)}
                                                className="flex-1 bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                                                placeholder="e.g., Chicken Tikka Masala, Vegetarian Pasta, Chocolate Cake"
                                                disabled={loading}
                                            />
                                            <button
                                                onClick={generateCookingInstructions}
                                                className="bg-gray-400 text-white px-6 py-3 rounded-xl hover:bg-gray-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                                disabled={loading || !mealInput.trim()}
                                            >
                                                {loading ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        Cooking...
                                                    </div>
                                                ) : (
                                                    'Get Instructions'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Loading State */}
                                {loading && (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center gap-2 text-gray-600">
                                            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                            Creating your personalized cooking instructions...
                                        </div>
                                    </div>
                                )}

                                {/* Error State */}
                                {error && (
                                    <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Cooking Instructions Results */}
                                {cookingSteps.length > 0 && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-semibold text-gray-800">Chef's Step-by-Step Instructions</h3>
                                        {cookingSteps.map((step, index) => (
                                            <div key={index} className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 p-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                        {step.step_number}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <h4 className="text-lg font-semibold text-gray-800">{step.title}</h4>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${step.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                                                step.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
                                                                {step.difficulty}
                                                            </span>
                                                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                                ⏱️ {step.time_estimate}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-700 mb-3 leading-relaxed">{step.description}</p>
                                                        {step.tips && (
                                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                                <div className="flex items-start gap-2">
                                                                    <span className="text-yellow-600 mt-1">💡</span>
                                                                    <span className="text-sm text-yellow-800 font-medium">Chef's Tip: {step.tips}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* General Preparation Steps */}
                            <div className="space-y-6 mt-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">General Meal Preparation Guide</h2>

                                {preparationSteps.map((step, index) => (
                                    <div key={index} className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h3>
                                                <p className="text-gray-600 mb-4">{step.description}</p>
                                                <div className="space-y-2">
                                                    {step.tips.map((tip, tipIndex) => (
                                                        <div key={tipIndex} className="flex items-start gap-2">
                                                            <span className="text-green-600 mt-1">✓</span>
                                                            <span className="text-sm text-gray-700">{tip}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Dietary Tips */}
                            {userSettings?.diet && dietaryTips[userSettings.diet as keyof typeof dietaryTips] && (
                                <div className="mt-8">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Special Tips for {userSettings.diet} Diet</h2>
                                    <div className="bg-green-50 text-green-800 rounded-lg px-6 py-4 border border-green-200">
                                        <p className="text-sm">{dietaryTips[userSettings.diet as keyof typeof dietaryTips]}</p>
                                    </div>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={() => router.push('/smart-swap')}
                                    className="bg-gray-400 text-white px-6 py-3 rounded-xl hover:bg-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Find Ingredient Substitutes
                                </button>
                            </div>
                        </div>

                        {/* Bottom decorative element */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white via-gray-100 to-gray-200"></div>
                    </div>
                </div>
            </div>
        )
    );
} 