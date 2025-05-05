"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarRange, Globe, MapPin, Plus, Users } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { signIn } from "next-auth/react";
import NextImage from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NewTripModal } from "@/components/new-trip-modal";
import { useTrips } from "@/context/trip-context";
import { AuthNav } from "@/components/auth-nav";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { registerUser } from "@/app/actions/user-actions";

export default function AuthPage() {
  // Shared state
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login specific states
  const [loginStep, setLoginStep] = useState(1); // Step 1: Email entry, Step 2: Password entry

  // Register specific states
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Get the return URL if any
  const returnUrl = searchParams.get("from") || "/trips";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/trips");
    }
  }, [isAuthenticated, router]);

  const handleContinueLogin = () => {
    if (loginStep === 1) {
      // Validate email format
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }
      // Move to password step
      setLoginStep(2);
    } else {
      // Handle login
      handleLogin();
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password");
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        router.push("/trips");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerUser({
        name,
        email,
        password,
      });

      if (!result.success) {
        setError(result.message);
      } else {
        // Switch to login mode after successful registration
        toast({
          title: "Registration successful",
          description: "Your account has been created. Please log in.",
        });
        setMode("login");
        setLoginStep(1);
      }
    } catch (err) {
      setError("An error occurred during registration");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (mode === "login") {
        handleContinueLogin();
      }
    }
  };

  // Reset states when switching modes
  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setError(null);
    if (newMode === "login") {
      setLoginStep(1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <NextImage
            src="/logo.png"
            alt="Travel App Logo"
            width={48}
            height={48}
            className="mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold mb-2">
            {mode === "login" ? "Welcome back!" : "Create your account"}
          </h1>
          <p className="text-gray-500 text-sm">
            👋 Welcome to Travel Planner,{" "}
            {mode === "login"
              ? "please log in to continue."
              : "let's begin your journey"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Toggle between login and register */}
          <div className="flex mb-6 border rounded-md overflow-hidden">
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                mode === "login"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-50 text-gray-600"
              }`}
              onClick={() => switchMode("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                mode === "register"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-50 text-gray-600"
              }`}
              onClick={() => switchMode("register")}
            >
              Register
            </button>
          </div>

          {/* Google Auth Button */}
          <button
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2.5 px-4 text-gray-700 font-medium mb-4 hover:bg-gray-50 transition-colors"
            onClick={() => signIn("google", { callbackUrl: "/trips" })}
          >
            <svg
              width="18"
              height="18"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Login Form */}
          {mode === "login" && (
            <>
              {/* Email Step */}
              {loginStep === 1 && (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email address
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      className="w-full"
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                  </div>

                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2"
                    onClick={handleContinueLogin}
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Password Step */}
              {loginStep === 2 && (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-1.5 mr-2">
                      <span className="block w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">{email}</span>
                    <button
                      className="ml-auto text-blue-500 text-sm"
                      onClick={() => setLoginStep(1)}
                    >
                      Edit
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full"
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                  </div>

                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2"
                    onClick={handleContinueLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>

                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">
                      Forgot your password?{" "}
                      <Link
                        href="/forgot-password"
                        className="text-blue-500 font-medium"
                      >
                        Reset it
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Registration Form */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          )}
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-blue-500">
              Terms of Service
            </Link>
            {" & "}
            <Link href="/privacy" className="text-blue-500">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
