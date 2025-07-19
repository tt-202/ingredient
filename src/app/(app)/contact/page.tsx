'use client';

import { useState, useEffect } from 'react';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface TeamMember {
    name: string;
    role: string;
    description: string;
    avatar: string;
    color: string;
}

const teamMembers: TeamMember[] = [
    {
        name: "Connor Hellman",
        role: "Frontend/Backend Developer",
        description: "Specializes in React, Next.js, and modern UI/UX design. Creates responsive and accessible user interfaces.",
        avatar: "👨‍💻",
        color: "bg-blue-500"
    },
    {
        name: "Brianna-Marie Garabato",
        role: "Database Develooper",
        description: "Expert in MongoDB. Handles database management and data integration.",
        avatar: "👩‍💻",
        color: "bg-green-500"
    },
    {
        name: "Ezra Stone",
        role: "Project Manager",
        description: "Leads project planning, coordinates team efforts, and ensures timely delivery of features.",
        avatar: "👨‍💼",
        color: "bg-purple-500"
    },
    {
        name: "Shophia Kropivniskaia",
        role: "API Developer",
        description: "Expert in API development and integartion. Handles API development and search Gemini API.",
        avatar: "👩‍🎨",
        color: "bg-pink-500"
    },
    {
        name: "Tuyen Tran",
        role: "Frontend/Backend Developer",
        description: "Specializes in React. Creates the frontend and backend of the app.",
        avatar: "👨‍🔧",
        color: "bg-orange-500"
    }
];

export default function ContactPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

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
            <div className="relative w-full max-w-7xl mx-4">
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

                        {/* Introduction */}
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-4">
                                Meet Our Team
                            </h2>
                            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                                We're a passionate team dedicated to creating innovative solutions.
                                Each member brings unique expertise to deliver exceptional results.
                            </p>
                        </div>

                        {/* Team Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {teamMembers.map((member, index) => (
                                <div
                                    key={index}
                                    className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-105"
                                >
                                    {/* Avatar and Role Badge */}
                                    <div className={`${member.color} p-6 text-center`}>
                                        <div className="text-4xl mb-3">{member.avatar}</div>
                                        <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 text-sm font-medium text-white">
                                            {member.role}
                                        </div>
                                    </div>

                                    {/* Member Info */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            {member.name}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {member.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 p-8">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-6 text-center">
                                Get In Touch
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Contact Details */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                        Contact Information
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <span className="text-gray-500 mr-3">📧</span>
                                            <span className="text-gray-700">group19@ucf.edu</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-gray-500 mr-3">📱</span>
                                            <span className="text-gray-700">+1 (407) 823-2000</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-gray-500 mr-3">📍</span>
                                            <span className="text-gray-700">UCF Orlando, FL</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Office Hours */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                        Office Hours
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Monday - Friday</span>
                                            <span className="text-gray-800 font-medium">9:00 AM - 6:00 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Saturday</span>
                                            <span className="text-gray-800 font-medium">10:00 AM - 4:00 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Sunday</span>
                                            <span className="text-gray-800 font-medium">Closed</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Back to Login */}
                        <div className="text-center mt-8">
                            <button
                                onClick={() => router.push('/login')}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                            >
                                ← Back to Login
                            </button>
                        </div>
                    </div>

                    {/* Bottom decorative element */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white via-gray-100 to-gray-200"></div>
                </div>
            </div>
        </div>
    );
} 
