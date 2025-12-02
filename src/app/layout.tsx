import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { Just_Another_Hand } from "next/font/google";
import "./globals.css";

// Primary UI / Body Font: Rubik
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Logo Font: Just Another Hand
const justAnotherHand = Just_Another_Hand({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "SipLocal - Discover Coffee Shops & Cafes in Rio Grande Valley",
  description: "Find the best coffee shops and cafes in the Rio Grande Valley, South Texas. Browse ratings, reviews, and AI-generated summaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${rubik.variable} ${justAnotherHand.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
