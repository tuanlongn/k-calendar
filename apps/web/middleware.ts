import { NextRequest, NextResponse } from "next/server";
import { getServerSession, isAuthenticated } from "@/lib/session";

// Danh sách các route không cần xác thực
const publicRoutes = ["/auth/callback", "/api/auth/session"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua các route công khai
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Kiểm tra xác thực cho các API route
  if (pathname.startsWith("/api/")) {
    const session = await getServerSession();

    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: "Không được phép truy cập" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // Kiểm tra xác thực cho các route khác
  const isLoggedIn = await isAuthenticated();

  if (!isLoggedIn && !pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Áp dụng cho tất cả các route ngoại trừ các static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
