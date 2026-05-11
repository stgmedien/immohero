import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/konto", "/studio", "/admin"];

export default auth((req) => {
  const isProtected = PROTECTED_PREFIXES.some((p) => req.nextUrl.pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  if (!req.auth) {
    const callbackUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
  }

  const role = req.auth.user?.role;
  if (req.nextUrl.pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/studio", req.url));
  }
  if (
    req.nextUrl.pathname.startsWith("/studio") &&
    role !== "admin" &&
    role !== "photographer" &&
    role !== "drone_pilot" &&
    role !== "editor"
  ) {
    return NextResponse.redirect(new URL("/konto", req.url));
  }
  if (req.nextUrl.pathname.startsWith("/konto") && role !== "customer") {
    return NextResponse.redirect(new URL("/studio", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icon.svg|robots.txt|sitemap.xml).*)"],
};
