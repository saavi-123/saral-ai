import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/login";
  const isPublicTrackingPage = pathname.startsWith("/g/");
  const isApiAuth = pathname.startsWith("/api/auth");

  // Public API routes — called by Cloudflare Worker, must never require auth
  const isPublicApi =
    pathname.startsWith("/api/geolocation/capture") ||
    pathname.startsWith("/api/geolocation/upload") ||
    pathname.startsWith("/api/tracking/session");

  if (isLoginPage || isPublicTrackingPage || isApiAuth || isPublicApi) {
    if (isLoginPage && token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};