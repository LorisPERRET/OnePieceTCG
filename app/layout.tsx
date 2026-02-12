import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TopNav } from "@/components/shared/top-nav";
import { Geist, Geist_Mono } from "next/font/google";
import { TopHeader } from "@/components/shared/top-header";
import { Footer } from "@/components/shared/footer";
import { AppSessionProvider } from "@/components/shared/session-provider";


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
  title: "OPTCG Collection Tracker",
  description: "Application web pour suivre et comparer une collection One Piece Card Game."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppSessionProvider>
          <div className="flex min-h-screen flex-col bg-gray-50">
            <TopHeader />
            <TopNav />
            <main className="container mx-auto flex flex-1 flex-col px-4 py-8">{children}</main>
            <Footer />
          </div>
        </AppSessionProvider>
      </body>
    </html>
  );
}
