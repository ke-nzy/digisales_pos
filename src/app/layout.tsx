import "~/styles/globals.css";
import "@fontsource/courier-prime";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "~/components/ui/sonner";
// import { Inter as FontSans } from "next/font/google";

import type { Viewport } from "next";

import Providers from "~/providers/providers";

// const fontSans = FontSans({
//   subsets: ["latin"],
//   variable: "--font-sans",
// });

export const metadata = {
  manifest: "/manifest.json",
  title: "DigiSales POS",
  description: "A DigiERP Point of Sale solution",
};

export const viewport: Viewport = {
  themeColor: "#c9184a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <html lang="en" className={`${GeistSans.variable}`}>
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        {/* <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fontSans.variable,
        )}
      > */}
        <Providers>{children}</Providers>
        <Toaster richColors />
      </body>
    </html>
  );
}
