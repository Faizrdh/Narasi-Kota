import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/articles",
  "/categories",
  "/users",
  "/profile",
  "/workflow",
  "/statistik",
  "/pelamar",   // ← BARU
];

const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAuthRoute  = authRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/articles/:path*",
    "/categories/:path*",
    "/users/:path*",
    "/profile/:path*",
    "/workflow/:path*",
    "/statistik/:path*",
    "/pelamar/:path*",   // ← BARU
    "/login",
    
  ],
};