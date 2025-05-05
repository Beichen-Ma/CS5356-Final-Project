"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";

export default function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </NextAuthSessionProvider>
  );
}
