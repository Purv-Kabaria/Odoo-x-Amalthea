import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/favicon.ico",
  "/_next",
  "/api/public",
  "/login",
  "/signup",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api/public") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico")
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

  let payload;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload: tokenPayload } = await jwtVerify(token, secret);
    payload = tokenPayload as { id: string; role: string; email: string; organization: string };
  } catch (error) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin")) {
    if (payload.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  if (pathname.startsWith("/manager")) {
    if (payload.role !== "manager" && payload.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  if (pathname === "/expenseSubmission" || 
      pathname.startsWith("/expenseSubmission/") ||
      pathname.includes("/expenseSubmission")) {
    if (payload.role === "manager") {
      const managerDashboardUrl = new URL("/manager/dashboard", req.url);
      return NextResponse.redirect(managerDashboardUrl);
    }
  }

  const res = NextResponse.next();

  res.headers.set("x-user-id", payload.id || "");
  res.headers.set("x-user-role", payload.role || "");
  res.headers.set("x-user-email", payload.email || "");
  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/expenseSubmission",
    "/expenseSubmission/:path*",
  ],
};
