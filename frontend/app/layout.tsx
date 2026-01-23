import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import ThirdWeb from "./ThirdwebProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "xMind - Pay-Per-Query AI Agent for Cronos",
  description: "Pay-Per-Query AI Agent for Cronos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThirdWeb>
      <html lang="en" className={figtree.variable}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <Toaster position="top-right" />
        </body>
      </html>
    </ThirdWeb>
  );
}
