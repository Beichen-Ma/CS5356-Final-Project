import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: [
    "/",
    "/trip-overview/:path*",
    "/trips",
    "/trips/:path*",
    "/auth",
    "/login",
    "/register",
  ],
};

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const isRootPath = req.nextUrl.pathname === "/";
  const isAuthPath =
    req.nextUrl.pathname === "/auth" ||
    req.nextUrl.pathname === "/login" ||
    req.nextUrl.pathname === "/register";
  const isProtectedPath =
    req.nextUrl.pathname === "/trips" ||
    req.nextUrl.pathname === "/trip-overview" ||
    req.nextUrl.pathname.startsWith("/trip-overview/");

  // Redirect /login or /register to root auth page
  if (
    req.nextUrl.pathname === "/login" ||
    req.nextUrl.pathname === "/register"
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = req.nextUrl.search; // Preserve any query parameters
    return NextResponse.redirect(url);
  }

  // Redirect /auth to root
  if (req.nextUrl.pathname === "/auth") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = req.nextUrl.search; // Preserve any query parameters
    return NextResponse.redirect(url);
  }

  // If user is authenticated and on the root page, redirect to /trips
  if (token && isRootPath) {
    const url = req.nextUrl.clone();
    url.pathname = "/trips";
    return NextResponse.redirect(url);
  }

  // If the user is not authenticated and trying to access a protected route
  if (!token && isProtectedPath) {
    // Redirect to the auth page with a return URL
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = `?from=${encodeURIComponent(req.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
