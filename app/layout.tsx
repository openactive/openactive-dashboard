import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { Header } from "./components/Header";
import { Footer, PreFooterCTA } from "./components/Footer";
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
  title: "OpenActive Data Intelligence Platform",
  description:
    "Explore the scale, quality, and coverage of open data about physical activity opportunities across the UK.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-oa-grey-50">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <PreFooterCTA />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
