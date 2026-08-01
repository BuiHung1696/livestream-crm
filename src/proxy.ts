import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/login";

  // Check if session token exists in cookies
  const authToken = request.cookies.get("crm_auth_token")?.value;

  // Protect all dashboard routes if not logged in
  if (!isPublicPath && !authToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to dashboard if logged-in user visits /login
  if (isPublicPath && authToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/talents/:path*",
    "/campaigns/:path*",
    "/schedule/:path*",
    "/brands/:path*",
    "/reports/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/login",
  ],
};
