import React from "react";
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

export const metadata: Metadata = {
  title: "Repo Explainer — AI-powered GitHub repository analysis",
  description:
    "Paste any public GitHub repository URL and get an AI-generated architecture diagram, code explanations, and onboarding guide in minutes.",
  keywords: ["github", "repository", "code analysis", "architecture", "AI", "Gemini", "developer tool"],
  openGraph: {
    title: "Repo Explainer",
    description: "AI-powered GitHub repository analysis — architecture diagrams, code explanations, onboarding guides.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full bg-surface-base text-content-primary antialiased">
        {children}
      </body>
    </html>
  );
}
