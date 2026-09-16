import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "ikimina_super_secure_jwt_secret_key_2026_rwanda_saccomomo"
);

const COOKIE_NAME = "ikimina_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let session: { userId: number; name: string; role: "Admin" | "Member" } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      session = {
        userId: payload.userId as number,
        name: payload.name as string,
        role: payload.role as "Admin" | "Member",
      };
    } catch {
      session = null;
    }
  }

  // Protect Admin routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "Admin") {
      const memberUrl = new URL("/member", request.url);
      return NextResponse.redirect(memberUrl);
    }
  }

  // Protect Member routes
  if (pathname.startsWith("/member")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "Member") {
      const adminUrl = new URL("/admin", request.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  // Redirect authenticated users away from /login and /register
  if ((pathname === "/login" || pathname === "/register") && session) {
    const dest = session.role === "Admin" ? "/admin" : "/member";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/member/:path*",
    "/login",
    "/register",
  ],
};
