import { NextRequest, NextResponse } from "next/server";

// Các path không cần xác thực
const PUBLIC_PATHS = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua các route API nội bộ và static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Nếu đang ở trang login thì không cần kiểm tra
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    // Nếu đã có access_token và vào trang login → chuyển về trang chủ
    const accessToken = request.cookies.get("access_token")?.value;
    if (accessToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Có access_token rồi → cho đi thẳng
  if (accessToken) {
    return NextResponse.next();
  }

  // Không có access_token → thử dùng refresh_token để lấy cái mới
  if (refreshToken) {
    try {
      const DOMAIN = (process.env.API_URL || "http://localhost:8000/api").replace(/\/api$/, "");

      const res = await fetch(`${DOMAIN}/user/get_access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (res.ok) {
        const json = await res.json();
        const newAccessToken = json?.data?.access_token || json?.access_token;

        if (newAccessToken) {
          // Set cookie mới và cho vào trang
          const response = NextResponse.next();
          response.cookies.set("access_token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "lax",
          });
          return response;
        }
      }
    } catch (err) {
      console.error("[Middleware] Refresh token error:", err);
    }
  }

  // Không có token nào hợp lệ → redirect về login
  const loginUrl = new URL("/login", request.url);
  // Lưu lại trang hiện tại để sau khi login xong redirect về
  loginUrl.searchParams.set("redirect", pathname);

  const response = NextResponse.redirect(loginUrl);
  // Xoá cookie hỏng (nếu có)
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
