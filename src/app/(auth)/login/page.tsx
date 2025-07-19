import AuthForm from '@/app/components/AuthForm';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="relative max-w-md w-full mx-4">
      {/* Glass morphism container with gradient border */}
      <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-gray-100/40 to-gray-200/40 animate-pulse"></div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-20 right-16 w-1 h-1 bg-gray-200/80 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-16 left-20 w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-8 right-8 w-1 h-1 bg-gray-100/70 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 p-8">
          {/* Header with enhanced styling */}
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-700 text-lg font-medium">
              Sign in to your account
            </p>
            <div className="mt-2 text-gray-600 text-sm">
              Continue your culinary journey
            </div>
          </div>

          {/* Auth Form */}
          <AuthForm mode="login" />
        </div>

        {/* Bottom decorative element */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white via-gray-100 to-gray-200"></div>
      </div>

      {/* Additional floating elements */}
      <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-white to-gray-100 rounded-full opacity-40 animate-pulse"></div>
      <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
  );
} 