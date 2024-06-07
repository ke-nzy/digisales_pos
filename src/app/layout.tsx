import "~/styles/globals.css";

// import { GeistSans } from "geist/font/sans";
import { Inter as FontSans } from "next/font/google";

import type { Viewport } from "next";

import { cn } from "~/lib/utils";
import { ThemeProvider } from "~/providers/theme-provider";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

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
    <html lang="en">
      {/* <body> */}
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fontSans.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
