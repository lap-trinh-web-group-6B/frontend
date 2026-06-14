import { NextRequest, NextResponse } from "next/server";

// Cấu hình toàn bộ các URL không cần đăng nhập cho ứng dụng Monety
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bỏ qua các route hệ thống, API nội bộ của Next.js và asset tĩnh (.png, .jpg, .svg...)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Helper function to decode and parse JWT payload safely
  function parseJwt(token: string) {
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      // Add necessary base64 padding to prevent atob() from throwing in Edge Runtime
      const pad = (4 - (base64.length % 4)) % 4;
      const paddedBase64 = base64 + "=".repeat(pad);
      const jsonPayload = decodeURIComponent(
        atob(paddedBase64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("[Middleware] JWT parsing error:", e);
      return null;
    }
  }

  const payload = accessToken ? parseJwt(accessToken) : null;
  const isAccessTokenExpired = payload && payload.exp ? payload.exp * 1000 < Date.now() : true;
  const hasValidAccessToken = accessToken && !isAccessTokenExpired;

  // 2. XỬ LÝ NHÓM CÁC TRANG PUBLIC (Login, Register, Forgot Password)
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (isPublicPath) {
    // Nếu ĐÃ ĐĂNG NHẬP (có token hợp lệ) mà cố vào trang login/register -> Đẩy bay về /
    if (hasValidAccessToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 3. XỬ LÝ NHÓM CÁC TRANG PRIVATE (Dashboard, Transactions, Wallets...)
  
  // Trường hợp 3.1: Đã có access_token hợp lệ -> Cho phép truy cập bình thường
  if (hasValidAccessToken) {
    return NextResponse.next();
  }

  // Trường hợp 3.2: Mất access_token nhưng VẪN CÒN refresh_token -> Tiến hành cấp lại tự động
  if (refreshToken) {
    try {
      // Đồng bộ Domain theo cấu trúc cổng API backend Monety của bạn
      const DOMAIN = (process.env.API_URL || "http://localhost:3001/api").replace(/\/api$/, "");

      // Gọi API refresh token
      const res = await fetch(`${DOMAIN}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshToken }), // SỬA: Key là 'refreshToken'
      });

      if (res.ok) {
        const json = await res.json();
        // Hỗ trợ cả 2 định dạng trả về accessToken hoặc access_token
        const newAccessToken = json?.data?.accessToken || json?.data?.access_token || json?.accessToken || json?.access_token;

        if (newAccessToken) {
          const response = NextResponse.next();
          // Cập nhật lại Access Token mới vào Cookie của Client để dùng cho các request sau
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
      console.error("[Middleware Auth Error] Không thể tự động làm mới session:", err);
    }
  }

  // Trường hợp 3.3: Cả 2 token đều không hợp lệ hoặc hết hạn -> Ép về trang Login
  const loginUrl = new URL("/login", request.url);
  // Đính kèm trang họ định vào hụt để sau khi đăng nhập xong, client chuyển hướng quay lại đúng chỗ đó
  loginUrl.searchParams.set("redirect", pathname);

  const response = NextResponse.redirect(loginUrl);
  
  // Dọn dẹp sạch sẽ đống cookie rác/hỏng để tránh lặp vô hạn (Loop Redirect)
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  return response;
}

// Cấu hình matcher để Middleware chỉ quét các route thực tế, tối ưu hiệu năng ứng dụng
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};