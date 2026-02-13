import type { Metadata } from "next";
import "./globals.css";

import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "ScrapCo Staff Admin",
  description: "Staff-only admin portal for ScrapCo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${display.variable} min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100`}
      >
        <ThemeProvider>
          <div className="bg-noise min-h-screen">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
