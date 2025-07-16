export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Welcome to Ingredient Imposter
        </h1>
        <p className="mt-8 text-lg leading-8 text-black-700">
          Replace ingredients in recipes with other ingredients.
        </p>
      </div>
    </div>
  );
} 
