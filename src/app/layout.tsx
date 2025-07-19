import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ingredient App - Smart Ingredient Substitution",
  description: "Find perfect ingredient substitutes for your recipes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundImage: "url('/icon.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        {/* Dim overlay for better readability */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(1px)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
        {/* Content above overlay */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            minHeight: '100vh',
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
