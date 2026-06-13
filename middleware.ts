import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function getAuthSecret() {
  return process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
}

function isAdminLike(token: any) {
  const role = String(token?.role || "").toLowerCase();
  const code = String(token?.studentId || token?.sub || "");
  const adminCodes = (process.env.ADMIN_STUDENT_CODES || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return ["admin", "owner", "developer", "super_admin"].includes(role) || adminCodes.includes(code);
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: getAuthSecret() });
  const { pathname } = req.nextUrl;

  const protectedUserPath =
    pathname.startsWith("/chat") ||
    pathname.startsWith("/api/history") ||
    pathname.startsWith("/api/analytics");

  const protectedAdminPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/developer") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/developer");

  if (protectedUserPath || protectedAdminPath) {
    if (!token) return NextResponse.redirect(new URL("/", req.url));
  }

  if (protectedAdminPath && !isAdminLike(token)) {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/chat/:path*",
    "/admin/:path*",
    "/developer/:path*",
    "/api/history/:path*",
    "/api/analytics/:path*",
    "/api/admin/:path*",
    "/api/developer/:path*",
  ],
};
