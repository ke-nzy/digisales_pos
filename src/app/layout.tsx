import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

export const metadata = {
  manifest: "/manifest.json",
  title: "DigiSales POS",
  description: "A DigiERP Point of Sale solution",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
