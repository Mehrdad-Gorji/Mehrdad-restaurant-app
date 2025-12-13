import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { i18n, type Locale } from "@/i18n-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Palmas Pizzeria",
  description: "Best Pizza in Town",
};

// Force dynamic rendering to get fresh settings from DB
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

import { CartProvider } from "@/context/cart-context";
import { LayoutProvider } from "@/context/layout-context";
import Footer from "@/components/footer";
import Header from "@/components/header";

import DynamicStyle from "@/components/dynamic-style";
import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from 'next/cache';

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;

  // Disable caching to get fresh settings on every request
  noStore();

  // Fetch settings safely
  let settings = null;
  try {
    // @ts-ignore
    settings = await prisma.siteSettings.findFirst();
  } catch (e) {
    console.error("Failed to fetch site settings", e);
  }

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <DynamicStyle settings={JSON.parse(JSON.stringify(settings))} />
        <LayoutProvider>
          <CartProvider>
            <Header lang={lang as Locale} />
            {children}
          </CartProvider>
        </LayoutProvider>
        <Footer lang={lang as Locale} />
      </body>
    </html>
  );
}
