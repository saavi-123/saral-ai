import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Which roles can access which route prefixes
const ROUTE_PERMISSIONS = {
  "/saral-ai": ["admin", "investigator"],
  "/geolocation": ["admin", "investigator"],
  "/email-security": ["admin", "corporate"],
  "/admin": ["admin"],
};

export async function middleware(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/login";
  const isPublicTrackingPage = pathname.startsWith("/g/");
  const isApiAuth = pathname.startsWith("/api/auth");
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

  // Not logged in at all
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const roleType = token.role_type || "investigator";

  // Check route-level role permissions
  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(roleType)) {
        // Redirect to dashboard with access denied signal
        return NextResponse.redirect(new URL("/?denied=1", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};