// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ Proper branding and favicon config
export const metadata: Metadata = {
  title: "PrepMint | Learn with XP, AI, and Rewards",
  description:
    "Gamified learning platform with quizzes, XP, streaks, and AI tutoring. Crack competitive exams with fun.",
  icons: {
    icon: "/favicon.ico", // Must be in /public
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png", // optional
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
