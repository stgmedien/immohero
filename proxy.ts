import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/konto", "/studio"];

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));

  if (!isProtected) return NextResponse.next();

  if (!req.auth) {
    const callbackUrl = encodeURIComponent(path + req.nextUrl.search);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
  }

  const role = req.auth.user?.role;
  const isTeam =
    role === "admin" || role === "photographer" || role === "drone_pilot" || role === "editor";

  if (path.startsWith("/studio") && !isTeam) {
    return NextResponse.redirect(new URL("/konto", req.url));
  }
  if (path.startsWith("/konto") && role !== "customer") {
    return NextResponse.redirect(new URL("/studio/dashboard", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icon.svg|robots.txt|sitemap.xml|share|emails).*)",
  ],
};
