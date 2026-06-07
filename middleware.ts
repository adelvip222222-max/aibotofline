import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;

  // حماية صفحة /chat وكل الـ API routes
  if (pathname.startsWith("/chat") || pathname.startsWith("/api/history") || pathname.startsWith("/api/analytics")) {
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // لو المستخدم مسجل دخوله ودخل على /، نحوله على /chat
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/chat/:path*", "/api/history/:path*", "/api/analytics/:path*"],
};