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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://siplocal.site'),
  title: "SipLocal - Discover Coffee Shops & Cafes in Rio Grande Valley",
  description: "Find the best coffee shops and cafes in the Rio Grande Valley, South Texas. Browse ratings, reviews, and AI-generated summaries.",
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "SipLocal - Discover Coffee Shops & Cafes in Rio Grande Valley",
    description: "Find the best coffee shops and cafes in the Rio Grande Valley, South Texas. Browse ratings, reviews, and AI-generated summaries.",
    type: "website",
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'SipLocal - Coffee Shop Discovery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "SipLocal - Discover Coffee Shops & Cafes",
    description: "Find the best coffee shops and cafes in the Rio Grande Valley, South Texas.",
    images: ['/logo.png'],
  },
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
