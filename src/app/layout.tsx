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
  title: "WaitlistPro - Viral Waitlist Builder",
  description: "Create viral waitlists with referral rewards, fraud detection, and launch day automation. See your viral coefficient in real-time.",
  keywords: ["waitlist", "viral marketing", "referral program", "pre-launch", "startup", "SaaS"],
  openGraph: {
    title: "WaitlistPro - Viral Waitlist Builder",
    description: "See if your waitlist is growing itself. K-factor tracking, fraud detection, and launch day tools.",
    type: "website",
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
