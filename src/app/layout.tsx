import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";

import { Providers } from "@/app/providers";

import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Habit Partner",
  description: "Accountability de hábitos entre parceiros",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Habit Partner",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff5300",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
