import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "P.I.P",
  description: "Track away, phone and working time together, with daily totals and away and phone costs.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
