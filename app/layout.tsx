import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: "Zomato Lite",
  description: "One restaurant, real reviews, nothing computed.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${fraunces.variable} font-sans antialiased`}
      >
        {/* A single terracotta ribbon across the top of every page. */}
        <div aria-hidden="true" className="h-1 w-full bg-accent" />
        {children}
      </body>
    </html>
  );
}
