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
  title: "Ask Lenny – AI Research Assistant for Lenny's Podcast",
  description:
    "Search and explore insights from Lenny's Podcast with AI-powered answers backed by real quotes and citations.",
  openGraph: {
    title: "Ask Lenny – AI Research Assistant",
    description:
      "Ask questions and get answers sourced directly from Lenny's Podcast transcripts.",
    url: "https://ask-lenny.vercel.app",
    siteName: "Ask Lenny",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ask Lenny – AI Research Assistant",
    description:
      "Ask questions and get answers sourced from Lenny's Podcast with citations.",
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
