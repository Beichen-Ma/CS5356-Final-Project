"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      return !result?.error;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading",
        user: session?.user ?? null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
