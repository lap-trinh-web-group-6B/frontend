"use server";

import { cookies } from "next/headers";

const getDomain = () =>
  ("http://localhost:4000/api").replace(/\/api$/, "");

export async function login(account: string, password: string) {
  try {
    const res = await fetch(`${getDomain()}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account, password }),
    });

    if (!res.ok) {
      return { success: false, error: "Sai tài khoản hoặc mật khẩu" };
    }

    const json = await res.json();
    const data = json.data;

    if (!data || !data.access_token) {
      return { success: false, error: "Phản hồi từ server không hợp lệ" };
    }

    const cookieStore = await cookies();

    // Lưu Access Token vào HTTPOnly Cookie
    cookieStore.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    // Lưu Refresh Token vào HTTPOnly Cookie
    if (data.refresh_token) {
      cookieStore.set("refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
      });
    }

    return { success: true, user: data.user, error: null };
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) return null;

    const res = await fetch(`${getDomain()}/user/get_access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const newAccessToken = json?.data?.access_token || json?.access_token;

    if (!newAccessToken) return null;

    // Set token mới vào cookie
    cookieStore.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return newAccessToken;
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return null;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

export async function register(
  account: string,
  password: string,
  email: string,
  first_name: string,
  last_name: string
) {
  try {
    const res = await fetch(`${getDomain()}/user/create_user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account, password, email, first_name, last_name }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: errJson?.message || "Đăng ký thất bại, vui lòng thử lại" };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Register Error:", error);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function changePassword(old_password: string, new_password: string) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return { success: false, error: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại" };
    }

    const res = await fetch(`${getDomain()}/user/change_pass`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ old_password, new_password }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: errJson?.message || "Mật khẩu cũ không đúng hoặc có lỗi xảy ra" };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Change Password Error:", error);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

