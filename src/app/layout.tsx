import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { LoadingOverlay } from "@/components/LoadingOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notopy - AI-Powered Note Generation",
  description: "Transform any topic into beautiful, colorful notes with hand-drawn elements using AI",
  keywords: ["AI notes", "note generation", "study notes", "AI writing", "note taking"],
  authors: [{ name: "Notopy Team" }],
  creator: "Notopy",
  publisher: "Notopy",
  icons: {
    icon: [
      { url: '/icon', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "Notopy - AI-Powered Note Generation",
    description: "Transform any topic into beautiful, colorful notes with hand-drawn elements using AI",
    url: 'https://notopy.com',
    siteName: 'Notopy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Notopy - AI-Powered Note Generation",
    description: "Transform any topic into beautiful, colorful notes with hand-drawn elements using AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <UserProfileProvider>
            <LoadingOverlay>
              {children}
            </LoadingOverlay>
          </UserProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
