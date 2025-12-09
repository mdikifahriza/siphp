// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const PUBLIC_PATHS = ["/", "/login", "/api/auth/login"];

// Cek apakah path termasuk public
function isPublicPath(path: string) {
  return PUBLIC_PATHS.some((p) => path.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("session")?.value;

  // Jika route public
  if (isPublicPath(pathname)) {
    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET!);
        // User/admin sudah login → redirect ke dashboard
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } catch {
        // Token invalid → tetap di halaman public
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Route protected (dashboard / other pages)
  if (!token) {
    // Belum login → redirect ke login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    // Token valid → lanjut
    return NextResponse.next();
  } catch (err) {
    console.error("Invalid session:", err);
    // Hapus cookie jika token invalid
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set("session", "", { path: "/", expires: new Date(0) });
    return res;
  }
}

// Terapkan middleware untuk semua route kecuali asset dan static
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets).*)",
  ],
};