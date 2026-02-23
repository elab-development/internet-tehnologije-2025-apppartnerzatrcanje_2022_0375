import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { MainNav } from "@/components/main-nav";

export const metadata: Metadata = {
  title: "Runly",
  description: "Pronađi partnera za trčanje po tempu, lokaciji i terminu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900 antialiased">
        <MainNav />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""}`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}