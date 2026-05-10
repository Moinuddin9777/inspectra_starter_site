import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: "Inspectra | Real-time Web Component Inspector",
  description: "Next-generation VS Code extension for real-time inspection, debugging, and analysis of modern web apps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`bg-rich-black overscroll-none ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
