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
  title: "GigRider - One App. Every Platform. More Earnings.",
  description: "The ultimate delivery partner aggregation app. Manage orders from Swiggy, Zomato, Uber Eats, DoorDash and more — all in one app. More earnings, less switching.",
  keywords: ["GigRider", "delivery rider", "delivery partner", "gig economy", "multi-platform", "Swiggy", "Zomato", "Uber Eats", "DoorDash"],
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0A0A0A] text-[#FAFAFA] overflow-x-hidden`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
