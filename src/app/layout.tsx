import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getTenantColorSchema } from "@/lib/actions/tenant";
import { getHtmlStyleColors } from "@/theme/colors";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Multi-tenant App",
  description: "Multi-tenant application with theme support",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const colorSchema = await getTenantColorSchema('test')
  const htmlStyleColors = getHtmlStyleColors(colorSchema)
  return (
    <html lang="en" 
    style={htmlStyleColors as React.CSSProperties}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
