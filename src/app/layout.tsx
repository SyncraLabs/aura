import type { Metadata } from "next";
import { Space_Grotesk, Cormorant_Garamond } from "next/font/google"; // Space Grotesk has that 'ink trap' tech vibe
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Aura | AI Beauty Clinic",
  description: "Transform your look with advanced AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${cormorant.variable} antialiased bg-black text-white selection:bg-purple-500/30`}
      >
        {children}
      </body>
    </html>
  );
}
