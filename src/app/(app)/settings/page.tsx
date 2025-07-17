'use client';

import { useState, useEffect } from 'react';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import SettingsForm from '../../components/SettingsForm';

export default function SettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState({
        diet: '',
        allergies: [],
        spice_tolerance: 3,
        sweetness_preference: 3,
        saltiness_preference: 3,
        acidity_sourness_preference: 3,
        health_consciousness: 3,
        budget_tolerance: 3,
    });
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

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
                        <div className="flex items-center gap-3">
                            {user && (
                                <span className="text-sm font-bold text-indigo-700">{user.email}</span>
                            )}
                            <button
                                onClick={handleLogout}
                                className="text-sm text-black hover:underline hover:text-gray-800 bg-transparent border-none shadow-none focus:outline-none"
                                style={{ background: 'none', border: 'none', boxShadow: 'none', textDecoration: 'underline' }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <SettingsForm initialSettings={settings} />
                <div className="mt-8 text-center">
                    <a
                        href="/login"
                        className="inline-flex items-center gap-1 text-indigo-700 hover:underline hover:text-indigo-900 text-sm font-medium transition-colors duration-200"
                    >
                        <span aria-hidden="true">&#8592;</span> Go back to login
                    </a>
                </div>
            </div>
        </div>
    );
} 