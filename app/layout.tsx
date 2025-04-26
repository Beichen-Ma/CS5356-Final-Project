import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TripProvider } from "@/context/trip-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trip Planner",
  description: "Plan your trips with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <TripProvider>{children}</TripProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
