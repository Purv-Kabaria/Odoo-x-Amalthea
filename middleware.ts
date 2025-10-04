import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET env var is required for middleware");
}

async function verifyTokenEdge(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as any;
  } catch (e) {
    return null;
  }
}

const PUBLIC_PATHS = [
  "/",
  "/favicon.ico",
  "/_next",
  "/api/public",
  "/(auth)",
  "/(auth)/login",
  "/(auth)/signup",
];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p)))
    return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api/public")
  ) {
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyTokenEdge(token);

  if (!payload) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin")) {
    if (payload.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  const res = NextResponse.next();

  res.headers.set("x-user-id", payload.id || "");
  res.headers.set("x-user-role", payload.role || "");
  res.headers.set("x-user-email", payload.email || "");
  return res;
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico|api/public).*)"],
};
