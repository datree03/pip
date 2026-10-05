import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "P.I.P",
  description: "Your chair called. Track Away and Phone time, calendar receipts, and the break bill.",
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
