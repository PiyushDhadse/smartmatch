import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session if expired
  await supabase.auth.getSession();

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define protected routes
  const protectedRoutes = [
    "/dashboard",
    "/dashboard/customer",
    "/dashboard/provider",
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  // Define role-based routes
  const customerRoutes = ["/dashboard/customer"];
  const providerRoutes = ["/dashboard/provider"];
  const isCustomerRoute = customerRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );
  const isProviderRoute = providerRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  // If no session and trying to access protected route, redirect to login
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session) {
    // Get user role
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    const userRole = userData?.role || "customer";

    // Redirect based on role
    if (isCustomerRoute && userRole !== "customer") {
      return NextResponse.redirect(new URL("/dashboard/provider", request.url));
    }

    if (
      isProviderRoute &&
      userRole !== "provider" &&
      userRole !== "serviceProvider"
    ) {
      return NextResponse.redirect(new URL("/dashboard/customer", request.url));
    }

    // If logged in and trying to access auth pages, redirect to appropriate dashboard
    if (["/login", "/register"].includes(request.nextUrl.pathname)) {
      const redirectUrl =
        userRole === "provider" || userRole === "serviceProvider"
          ? "/dashboard/provider"
          : "/dashboard/customer";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/auth/callback"],
};
