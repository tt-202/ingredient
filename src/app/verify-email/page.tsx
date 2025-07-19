'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ClientWrapper from '../components/ClientWrapper';
import Image from 'next/image';

export default function VerifyEmailPage() {
    return (
        <ClientWrapper>
            <VerifyEmailContent />
        </ClientWrapper>
    );
}

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    return (
        <div className="min-h-screen flex items-center justify-center py-7 px-4 sm:px-6 lg:px-8">
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

                    <div className="relative z-10 p-8 text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-white to-gray-100 rounded-full mb-4 shadow-lg overflow-hidden">
                            <Image
                                src="/icon.jpg"
                                alt="App Icon"
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {error ? (
                            <>
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mb-4 shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800">
                                    Verification Failed
                                </h2>
                                <p className="text-gray-600">
                                    {error === 'invalid_token'
                                        ? 'The verification link is invalid or has expired. Please request a new verification email.'
                                        : 'An error occurred during email verification. Please try again.'}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800">
                                    Email Verified!
                                </h2>
                                <p className="text-gray-600">
                                    Your email has been successfully verified. You can now sign in to your account.
                                </p>
                            </>
                        )}

                        <Link href="/login" className="inline-block text-gray-600 hover:text-gray-700 transition-colors font-medium">
                            Sign in to your account
                        </Link>
                    </div>

                    {/* Bottom decorative element */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white via-gray-100 to-gray-200"></div>
                </div>
            </div>
        </div>
    );
} 