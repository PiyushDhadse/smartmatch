// app/middleware.js
import { NextResponse } from "next/server";

export async function middleware(req) {
  // Get token from Authorization header or cookies
  const token =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.cookies.get("auth_token")?.value;

  // Protected routes
  const protectedRoutes = ["/dashboard", "/profile", "/bookings", "/reviews"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route),
  );

  if (isProtectedRoute && !token) {
    // Redirect to login if accessing protected route without token
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in and tries to access auth pages, redirect to dashboard
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.includes(req.nextUrl.pathname);

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
