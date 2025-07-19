'use client';

import { useState, useEffect } from 'react';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import SettingsForm from '../../components/SettingsForm';
import Image from 'next/image';

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
                                    Settings
                                </h1>
                            </div>
                            <div className="flex items-center gap-3">
                                {user && (
                                    <span className="text-sm font-bold text-gray-700 bg-white/40 px-3 py-2 rounded-lg border border-white/60">
                                        {user.email}
                                    </span>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="space-y-6">
                            <SettingsForm initialSettings={settings} />

                            <div className="text-center pt-6">
                                <a
                                    href="/login"
                                    className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-700 transition-colors text-sm font-medium"
                                >
                                    <span aria-hidden="true">&#8592;</span> Go back to login
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom decorative element */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white via-gray-100 to-gray-200"></div>
                </div>
            </div>
        </div>
    );
} 