// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { FirestoreProvider } from "@/context/FirestoreProvider";
import FirestoreErrorBoundary from "@/components/errors/FirestoreErrorBoundary";
import "./globals.css";

// Temporarily disabled Google Fonts due to network issues
// Using system fonts as fallback
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1a202c",
};

export const metadata: Metadata = {
  title: "PrepMint | AI-Powered Answer Sheet Evaluation for Institutions",
  description:
    "Automate answer sheet evaluation with AI. Save 90% of grading time, get instant results with 98% accuracy. Perfect for schools, colleges, and coaching institutes.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PrepMint",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <FirestoreErrorBoundary>
          <FirestoreProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </FirestoreProvider>
        </FirestoreErrorBoundary>
      </body>
    </html>
  );
}
