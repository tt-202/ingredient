'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface UserSettings {
    name: string;
    email: string;
    dietaryPreferences: string[];
    cookingLevel: string;
    preferredCuisine: string;
    notifications: boolean;
}

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<UserSettings>({
        name: '',
        email: '',
        dietaryPreferences: [],
        cookingLevel: 'intermediate',
        preferredCuisine: 'international',
        notifications: true
    });

    const dietaryOptions = [
        'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
        'Nut-Free', 'Low-Carb', 'Keto', 'Paleo'
    ];

    const cookingLevels = [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' }
    ];

    const cuisineOptions = [
        { value: 'international', label: 'International' },
        { value: 'italian', label: 'Italian' },
        { value: 'asian', label: 'Asian' },
        { value: 'mexican', label: 'Mexican' },
        { value: 'mediterranean', label: 'Mediterranean' },
        { value: 'american', label: 'American' }
    ];

    useEffect(() => {
        // Load saved settings from localStorage
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            // If user has already completed settings, redirect to smart-swap
            if (parsed.name && parsed.email) {
                router.push('/smart-swap');
                return;
            }
            setSettings(parsed);
        }
    }, [router]);

    const handleDietaryChange = (preference: string) => {
        setSettings(prev => ({
            ...prev,
            dietaryPreferences: prev.dietaryPreferences.includes(preference)
                ? prev.dietaryPreferences.filter(p => p !== preference)
                : [...prev.dietaryPreferences, preference]
        }));
    };

    const handleSave = async () => {
        setLoading(true);

        // Save settings to localStorage
        localStorage.setItem('userSettings', JSON.stringify(settings));

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setLoading(false);

        // Redirect to smart-swap
        router.push('/smart-swap');
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Personalize Your Experience</h2>

                    {/* Basic Information */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.name}
                                    onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.email}
                                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dietary Preferences */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dietary Preferences</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {dietaryOptions.map((option) => (
                                <label key={option} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={settings.dietaryPreferences.includes(option)}
                                        onChange={() => handleDietaryChange(option)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Cooking Level */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cooking Experience</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {cookingLevels.map((level) => (
                                <label key={level.value} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="cookingLevel"
                                        value={level.value}
                                        checked={settings.cookingLevel === level.value}
                                        onChange={(e) => setSettings(prev => ({ ...prev, cookingLevel: e.target.value }))}
                                        className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{level.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Preferred Cuisine */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Cuisine</h3>
                        <select
                            value={settings.preferredCuisine}
                            onChange={(e) => setSettings(prev => ({ ...prev, preferredCuisine: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {cuisineOptions.map((cuisine) => (
                                <option key={cuisine.value} value={cuisine.value}>
                                    {cuisine.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Notifications */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={settings.notifications}
                                onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                Receive notifications about new features and updates
                            </span>
                        </label>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {loading ? 'Saving...' : 'Save & Continue'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 