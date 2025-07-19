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
          minHeight: '100vh',
        }}
      >
        {children}
      </body>
    </html>
  );
}
