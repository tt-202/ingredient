export default function WelcomePage() {
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

          <div className="relative z-10 p-12 text-center">
            {/* Welcome Title */}
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent sm:text-7xl mb-8">
              Welcome to Ingredient Imposter
            </h1>

            {/* Welcome Description */}
            <p className="text-xl leading-8 text-gray-700 max-w-2xl mx-auto">
              Replace ingredients in recipes with other ingredients.
            </p>

          
          {/* Bottom decorative element */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white via-gray-100 to-gray-200"></div>
        </div>
      </div>
    </div>
  );
} 
