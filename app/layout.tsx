import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TripProvider } from "@/context/trip-context";
import SessionProvider from "@/components/session-provider";
import { ToastProvider } from "@/components/ui/use-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Travel Trip Planner",
  description: "Plan your dream vacation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <ToastProvider>
            <TripProvider>{children}</TripProvider>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
