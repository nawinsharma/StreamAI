import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import UserProviderWrapper from "@/components/user-provider";
import { getUser } from "@/lib/get-user";
import HomeLayout from "@/components/layout/home-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Chat Assistant",
  description: "Modern AI chat interface with multimodal capabilities",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <HomeLayout>
        <ThemeProvider>
          <UserProviderWrapper initialUser={user}>
            {children}
            <Toaster position="top-right" richColors />
          </UserProviderWrapper>
        </ThemeProvider>
        </HomeLayout>
      </body>
    </html>
  );
}
