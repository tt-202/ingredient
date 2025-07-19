'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
    User
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

type AuthMode = 'login' | 'signup';

interface AuthFormProps {
    mode: AuthMode;
}

export default function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [verificationSent, setVerificationSent] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    const handleGoogleSignIn = async () => {
        setStatus('loading');
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
            router.push('/settings');
        } catch (err: any) {
            console.error('Google Sign-in Error:', err);
            setError(err.message || 'Google sign-in failed');
        } finally {
            setStatus('idle');
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setValidationError(null);
        setStatus('loading');

        try {
            if (mode === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
                router.push('/settings');
            } else {
                if (password !== confirmPassword) {
                    setValidationError('Passwords do not match');
                    setStatus('idle');
                    return;
                }

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await sendEmailVerification(userCredential.user);
                setVerificationSent(true);
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            if (err.code === 'auth/email-already-in-use') {
                setValidationError('This email is already registered.');
            } else if (err.code === 'auth/invalid-email') {
                setValidationError('Invalid email address.');
            } else if (err.code === 'auth/weak-password') {
                setValidationError('Password is too weak. Must be at least 6 characters.');
            } else {
                setError(err.message || 'Authentication error');
            }
        } finally {
            setStatus('idle');
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    if (verificationSent) {
        return (
            <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Verification Email Sent!</h2>
                <p className="text-gray-600">
                    A verification link has been sent to <strong className="text-gray-800">{email}</strong>. Please check your inbox.
                </p>
                <Link href="/login" className="inline-block text-gray-600 hover:text-gray-700 transition-colors text-sm">
                    ← Return to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* User Email Display */}
            {user && (
                <div className="flex justify-between items-center p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/60">
                    <div className="text-sm text-gray-700 bg-white/40 px-3 py-2 rounded-lg border border-white/60">
                        {user.email}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        Logout
                    </button>
                </div>
            )}

            {/* Google Sign In Button */}
            <button
                onClick={handleGoogleSignIn}
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-3 bg-white/40 backdrop-blur-sm text-gray-700 border border-white/60 rounded-xl px-6 py-4 hover:bg-white/50 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                </svg>
                <span className="font-medium">
                    {status === 'loading' ? 'Processing...' : 'Continue with Google'}
                </span>
            </button>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/60" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-gray-600 font-medium">Or continue with email</span>
                </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-5">
                {mode === 'signup' && (
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your password"
                        required
                        minLength={6}
                    />
                </div>

                {mode === 'signup' && (
                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                            placeholder="Confirm your password"
                            required
                        />
                    </div>
                )}

                {mode === 'login' && (
                    <div className="text-sm text-right">
                        <Link href="/forgot-password" className="text-gray-600 hover:text-gray-700 transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                )}

                {validationError && (
                    <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
                        {validationError}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-xl font-medium hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                        </div>
                    ) : (
                        mode === 'login' ? 'Sign In' : 'Sign Up'
                    )}
                </button>

                {error && (
                    <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="text-center text-sm text-gray-600">
                    {mode === 'login' ? (
                        <>
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-gray-700 hover:text-gray-800 font-medium transition-colors">
                                Sign up
                            </Link>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <Link href="/login" className="text-gray-700 hover:text-gray-800 font-medium transition-colors">
                                Sign in
                            </Link>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}
