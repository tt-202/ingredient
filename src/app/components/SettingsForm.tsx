'use client';

import { useState, useTransition, useEffect } from 'react';

// Simple utility function for conditional classes
function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

// Mock data - replace with your actual data
const dietOptions = ['Vegetarian', 'Vegan', 'Paleo', 'Keto', 'Gluten-Free', 'None'];
const allergyOptions = [
    'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Sesame', 'Mustard',
    'Celery', 'Lupin', 'Molluscs', 'Sulphites', 'Corn', 'Avocado', 'Banana', 'Kiwi', 'Citrus', 'Garlic'
];

type Settings = {
    diet: string;
    allergies: string[];
    spice_tolerance: number;
    sweetness_preference: number;
    saltiness_preference: number;
    acidity_sourness_preference: number;
    health_consciousness: number;
    budget_tolerance: number;
};

export default function SettingsForm({ initialSettings }: { initialSettings: Settings }) {
    const [settings, setSettings] = useState(initialSettings);
    const [isPending, startTransition] = useTransition();
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setIsDirty(JSON.stringify(settings) !== JSON.stringify(initialSettings));
    }, [settings, initialSettings]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        startTransition(async () => {
            // Save settings to localStorage
            localStorage.setItem('userSettings', JSON.stringify(settings));
            setIsDirty(false);
            // Redirect to smart-swap
            window.location.href = '/smart-swap';
        });
    };

    return (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
                    <div>
                        <h2 className="text-base font-semibold leading-7 text-gray-900">Dietary Information</h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">Help us tailor recipes to your needs.</p>
                    </div>

                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                        <div className="sm:col-span-4">
                            <label htmlFor="diet" className="block text-sm font-medium leading-6 text-gray-900">
                                Dietary Restriction
                            </label>
                            <div className="mt-2">
                                <select
                                    value={settings.diet}
                                    onChange={(e) => setSettings(prev => ({ ...prev, diet: e.target.value }))}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Select a diet...</option>
                                    {dietOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="allergies" className="block text-sm font-medium leading-6 text-gray-900">
                                Allergies
                            </label>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 mb-2">Select all that apply:</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                    {allergyOptions.map(allergy => (
                                        <button
                                            type="button"
                                            key={allergy}
                                            onClick={() => {
                                                setSettings(prev => {
                                                    const newAllergies = prev.allergies.includes(allergy)
                                                        ? prev.allergies.filter(a => a !== allergy)
                                                        : [...prev.allergies, allergy];
                                                    return { ...prev, allergies: newAllergies };
                                                });
                                            }}
                                            className={cn(
                                                "text-sm py-1.5 px-3 rounded-full border transition-colors",
                                                settings.allergies.includes(allergy)
                                                    ? "bg-gray-900 text-white border-gray-900"
                                                    : "bg-gray-100 hover:bg-gray-200 border-gray-400 text-gray-800"
                                            )}
                                        >
                                            {allergy}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-t border-gray-900/10 pt-10 md:grid-cols-3">
                    <div>
                        <h2 className="text-base font-semibold leading-7 text-gray-900">Flavor & Lifestyle Preferences</h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">Adjust these sliders to match your taste.</p>
                    </div>

                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                        {[
                            { key: 'spice_tolerance', label: 'Spice Tolerance', minLabel: 'Mild', maxLabel: 'Very Spicy' },
                            { key: 'sweetness_preference', label: 'Sweetness', minLabel: 'Not Sweet', maxLabel: 'Very Sweet' },
                            { key: 'saltiness_preference', label: 'Saltiness', minLabel: 'Low Salt', maxLabel: 'Salty' },
                            { key: 'acidity_sourness_preference', label: 'Acidity / Sourness', minLabel: 'Mild', maxLabel: 'Very Sour' },
                            { key: 'health_consciousness', label: 'Healthiness', minLabel: 'Indulgent', maxLabel: 'Lean' },
                            { key: 'budget_tolerance', label: 'Budget', minLabel: 'Cheap', maxLabel: 'Expensive' },
                        ].map(({ key, label, minLabel, maxLabel }) => (
                            <div key={key} className="sm:col-span-6">
                                <label htmlFor={key} className="block text-sm font-medium leading-6 text-gray-900">{label}</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    step="1"
                                    value={settings[key as keyof Settings] as number}
                                    onChange={(e) => setSettings(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                    id={key}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{minLabel}</span>
                                    <span>{maxLabel}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                        type="button"
                        className="text-sm font-semibold leading-6 text-gray-900"
                        onClick={() => setSettings(initialSettings)}
                        disabled={!isDirty || isPending}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!isDirty || isPending}
                        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}