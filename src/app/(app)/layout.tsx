'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { UserCircle, Upload } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Header with glass morphism */}
      <header className="bg-white/30 backdrop-blur-xl border-b border-white/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
                Ingredient Imposter
              </Link>
              {!isPending && session?.user && (
                <>
                  <Link
                    href="/upload"
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors bg-white/40 px-3 py-2 rounded-lg border border-white/60 hover:bg-white/60"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-sm font-medium">Upload</span>
                  </Link>
                  <Link
                    href="/smart-swap"
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors bg-white/40 px-3 py-2 rounded-lg border border-white/60 hover:bg-white/60"
                  >
                    <span className="text-sm font-medium">Smart Swap</span>
                  </Link>
                </>
              )}
            </div>
            <Link
              href="/account"
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors bg-white/40 px-3 py-2 rounded-lg border border-white/60 hover:bg-white/60"
            >
              {isPending ? (
                <LoadingSpinner size="w-6 h-6" />
              ) : session?.user ? (
                <>
                  <span className="text-sm font-medium">{session?.user?.email}</span>
                  <UserCircle className="w-6 h-6" />
                </>
              ) : (
                <>
                  <span className="text-sm font-medium">Sign in</span>
                  <UserCircle className="w-6 h-6" />
                </>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex justify-center py-12 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer with glass morphism */}
      <footer className="bg-white/30 backdrop-blur-xl border-t border-white/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center sm:justify-center gap-4 sm:gap-12">
            <div className="text-gray-700">
              Need Help?&nbsp;
              <Link href="/contact" className="text-gray-800 font-medium transition-colors duration-300 hover:text-gray-600 underline">
                Contact Us
              </Link>
            </div>
            <div className="text-gray-700">© Ingredient Imposter {new Date().getFullYear()}</div>
          </div>
        </div>
      </footer>
    </div>
  );
} 