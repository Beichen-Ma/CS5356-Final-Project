"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "./ui/button";
import { User, LogOut } from "lucide-react";

export function AuthNav() {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="flex items-center gap-4">
      {isAuthenticated ? (
        <>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium">{user?.name}</span>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button size="sm" asChild>
            <Link href="/">Sign In</Link>
          </Button>
        </>
      )}
    </div>
  );
}
