'use client';

import Link from 'next/link';
import { useState } from 'react';
import { forgetPassword } from '@/lib/auth-client';
import Image from 'next/image';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setError(null);

        try {
            const { error: resetError } = await forgetPassword({
                email,
                redirectTo: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/reset-password`,
            });

            if (resetError) {
                throw new Error(resetError.message);
            }

            setStatus('success');
        } catch (err) {
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Failed to send reset link');
        }
    };

    const content = status === 'success' ? (
        <div className="relative max-w-md w-full mx-4">
            {/* Glass morphism container */}
            <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-100/40 via-emerald-100/40 to-teal-100/40 animate-pulse"></div>

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-10 left-10 w-2 h-2 bg-green-200/70 rounded-full animate-bounce"></div>
                    <div className="absolute top-20 right-16 w-1 h-1 bg-emerald-200/80 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-16 left-20 w-1.5 h-1.5 bg-teal-200/60 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative z-10 p-8 text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">
                        Check Your Email
                    </h2>
                    <p className="text-gray-600">
                        We've sent a password reset link to <strong className="text-gray-800">{email}</strong>. Please check your inbox and follow the instructions.
                    </p>
                    <Link href="/login" className="inline-block text-gray-600 hover:text-gray-700 transition-colors font-medium">
                        ← Return to login
                    </Link>
                </div>

                {/* Bottom decorative element */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
            </div>
        </div>
    ) : (
        <div className="relative max-w-md w-full mx-4">
            {/* Glass morphism container */}
            <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-gray-100/40 to-gray-200/40 animate-pulse"></div>

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-10 left-10 w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
                    <div className="absolute top-20 right-16 w-1 h-1 bg-gray-200/80 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-16 left-20 w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative z-10 p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-white to-gray-100 rounded-full mb-4 shadow-lg overflow-hidden">
                            <Image
                                src="/icon.jpg"
                                alt="App Icon"
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-2">
                            Forgot Your Password?
                        </h2>
                        <p className="text-gray-700 text-lg">
                            Enter your email address below and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your email address"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-xl font-medium hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            {status === 'loading' ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Sending...
                                </div>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>

                        {status === 'error' && error && (
                            <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="text-center text-sm text-gray-600">
                            Remember your password?{' '}
                            <Link href="/login" className="text-gray-700 hover:text-gray-800 font-medium transition-colors">
                                Log in
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Bottom decorative element */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white via-gray-100 to-gray-200"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center py-7 px-4 sm:px-6 lg:px-8">
            {content}
        </div>
    );
} 