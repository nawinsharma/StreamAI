import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import UserProviderWrapper from "@/components/user-provider";
import { getUser } from "@/lib/get-user";
import HomeLayout from "@/components/layout/home-layout";
import { Analytics } from "@vercel/analytics/next"
import StructuredData from "@/components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StreamAI - Streaming AI Chat",
  description: "A streaming AI chat with personal long-term memory, RAG, different custom tools, persistent chat history with top class experience",
  keywords: [
    "streaming ai chat",
    "personal long-term memory",
    "rag",
    "custom tools",
    "persistent chat history",
    "streamai",
  ],
  authors: [{ name: "Nawin Kumar Sharma" }],
  metadataBase: new URL('https://streamai.nawin.xyz'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "StreamAI | Streaming AI Chat",
    description: "A streaming AI chat with personal long-term memory, RAG, different custom tools, persistent chat history with top class experience",
    url: 'https://streamai.nawin.xyz',
    siteName: 'StreamAI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'og image',
      },
    ],  
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "StreamAI | Streaming AI Chat",
    description: "A streaming AI chat with personal long-term memory, RAG, different custom tools, persistent chat history with top class experience",
    images: ['/og-image.png'],
    creator: '@nawinscript',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'technology',
  classification: 'portfolio',
  other: {
    'msapplication-TileColor': '#FF6B6B',
    'theme-color': '#FF6B6B',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'StreamAI',
    'application-name': 'StreamAI',
    'mobile-web-app-capable': 'yes',
  },
};



export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) { 
  const user = await getUser();

  return (
    <html lang="en" suppressHydrationWarning>
       <head>
          {/* Favicon Implementation - Comprehensive */}
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/site.webmanifest" />

          <meta name="msapplication-TileColor" content="#8b5cf6" />
          <meta name="msapplication-config" content="/browserconfig.xml" />

          {/* Additional SEO Meta Tags */}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
          <meta name="theme-color" content="#8b5cf6" />
          <meta name="color-scheme" content="light dark" />
          <meta property="og:logo" content="StreamAI" />

          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

          {/* DNS Prefetch for analytics and external services */}
          <link rel="dns-prefetch" href="//www.googletagmanager.com" />
          <link rel="dns-prefetch" href="//www.google-analytics.com" />

          {/* Structured Data for SEO */}
          <StructuredData type="website" />
          <StructuredData type="webapplication" />
          <StructuredData type="organization" />
        </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <UserProviderWrapper initialUser={user}>
            <HomeLayout>
              {children}
            </HomeLayout>
            <Analytics />
            <Toaster position="bottom-right" richColors />
          </UserProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
