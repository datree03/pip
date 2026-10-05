import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sit Time — Shared Time Tracker",
  description: "Track away, phone and working time together, with daily totals and away cost.",
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
