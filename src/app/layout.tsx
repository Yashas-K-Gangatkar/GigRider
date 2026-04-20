import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Delivro - Every Delivery. One App.",
  description: "The ultimate delivery aggregation super-app. Compare prices, save money, and earn rewards across all delivery platforms.",
  keywords: ["Delivro", "delivery", "food delivery", "groceries", "compare prices", "aggregation"],
  authors: [{ name: "Delivro Team" }],
  icons: {
    icon: "/delivro-logo.png",
  },
  openGraph: {
    title: "Delivro - Every Delivery. One App.",
    description: "Compare prices across all delivery platforms and save up to 40%",
    siteName: "Delivro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Delivro - Every Delivery. One App.",
    description: "Compare prices across all delivery platforms and save up to 40%",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0F0F0F] text-[#FAFAFA] overflow-x-hidden`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
