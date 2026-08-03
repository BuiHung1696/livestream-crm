import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PEAKCOM - Commerce Growth Agency",
  description: "PEAKCOM - Hệ thống CRM điều phối và quản lý Host Livestream, KOC, KOL & Booking chiến dịch",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`h-full bg-slate-50 ${inter.className}`}>
      <body className="h-full text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
