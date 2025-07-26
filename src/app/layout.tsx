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
  authors: [{ name: "Notopy Team", url: "https://notopy.com" }],
  creator: "Notopy",
  publisher: "Notopy",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
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
    images: [
      {
        url: 'https://notopy.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Notopy - AI-Powered Note Generation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Notopy - AI-Powered Note Generation",
    description: "Transform any topic into beautiful, colorful notes with hand-drawn elements using AI",
    images: ['https://notopy.com/og-image.png'],
  },
  metadataBase: new URL('https://notopy.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <meta name="theme-color" content="#000000" />
      </head>
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
