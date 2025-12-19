import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google"; // Premium fonts
import "./globals.css";

const inter = Inter({
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
        className={`${inter.variable} ${cormorant.variable} antialiased bg-black text-white selection:bg-white/20`}
      >
        {children}
      </body>
    </html>
  );
}
