import type { Metadata } from "next";
import { Playfair_Display, Lora, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GigRider - One App. Every Platform. More Earnings.",
  description: "The distinguished delivery partner aggregation app. Manage orders from multiple platforms — all in one app. More earnings, less switching.",
  keywords: ["GigRider", "delivery rider", "delivery partner", "gig economy", "multi-platform"],
  authors: [{ name: "GigRider Team" }],
  icons: {
    icon: "/gigrider-logo.png",
  },
  openGraph: {
    title: "GigRider - One App. Every Platform. More Earnings.",
    description: "Manage all your delivery platform orders in one unified app. No more switching between apps.",
    siteName: "GigRider",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GigRider - One App. Every Platform. More Earnings.",
    description: "Manage all your delivery platform orders in one unified app. No more switching between apps.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${lora.variable} ${geistMono.variable} antialiased bg-[#FAF7F2] text-[#2C2C2C] overflow-x-hidden`}
        style={{ fontFamily: 'var(--font-lora), serif' }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
