"use server";

import { cookies } from "next/headers";

const getDomain = () =>
  ("http://localhost:4000/api").replace(/\/api$/, "");

// ==========================================
// 1. ĐĂNG NHẬP & ĐĂNG XUẤT (AUTHENTICATION)
// ==========================================

export async function login(email: string, password: string) {
  try {
    // Sửa payload body theo đúng file JSON: sử dụng email thay vì account
    const res = await fetch(`${getDomain()}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: errJson?.message || "Sai tài khoản hoặc mật khẩu" };
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

export async function logout() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (refreshToken) {
      // Gọi API Logout lên Backend để hủy Token trong DB nếu cần theo file JSON
      await fetch(`${getDomain()}/api/v1/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch((err) => console.error("Backend logout error:", err));
    }

    // Xóa cookies ở client
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    return { success: true };
  } catch (error) {
    console.error("Logout Error:", error);
    return { success: false, error: "Lỗi khi đăng xuất" };
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) return null;

    // Sửa endpoint theo file JSON: /api/v1/auth/refresh
    const res = await fetch(`${getDomain()}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const newAccessToken = json?.data?.access_token || json?.access_token;

    if (!newAccessToken) return null;

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

// ==========================================
// 2. LUỒNG ĐĂNG KÝ TÀI KHOẢN (REGISTER FLOW)
// ==========================================

// Bước 1: Gửi OTP kích hoạt đăng ký
export async function registerSendOtp(fullName: string, email: string, password: string) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/auth/register/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: errJson?.message || "Không thể gửi mã OTP" };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Register Send OTP Error:", error);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

// Bước 2: Xác thực mã OTP để hoàn tất tạo tài khoản
export async function registerVerifyOtp(fullName: string, email: string, password: string, otp: string) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/auth/register/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password, otp }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: errJson?.message || "Mã OTP không chính xác hoặc hết hạn" };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Register Verify OTP Error:", error);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

// Gửi lại mã OTP đăng ký nếu hết hạn
export async function registerResendOtp(email: string) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/auth/register/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: errJson?.message || "Gửi lại OTP thất bại" };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Register Resend OTP Error:", error);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

// ==========================================
// 3. LUỒNG QUÊN MẬT KHẨU (FORGOT PASSWORD FLOW)
// ==========================================

// Bước 1: Gửi yêu cầu OTP quên mật khẩu
export async function forgotPasswordSendOtp(email: string) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/auth/forgot-password/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: errJson?.message || "Email không tồn tại hoặc lỗi gửi OTP" };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Forgot Pass Send OTP Error:", error);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

// Gửi lại mã OTP quên mật khẩu
export async function forgotPasswordResendOtp(email: string) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/auth/forgot-password/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: errJson?.message || "Gửi lại OTP thất bại" };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Forgot Pass Resend OTP Error:", error);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

// Bước 2: Xác thực OTP quên mật khẩu (API này thường trả về một token để đổi mật khẩu)
export async function forgotPasswordVerifyOtp(email: string, otp: string) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/auth/forgot-password/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const errJson = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { success: false, error: errJson?.message || "Mã OTP hợp lệ không chính xác" };
    }

    // Backend thường sẽ trả về forgotPasswordToken trong object data
    return { success: true, forgotPasswordToken: errJson?.data?.forgotPasswordToken || errJson?.forgotPasswordToken || null, error: null };
  } catch (error) {
    console.error("Forgot Pass Verify OTP Error:", error);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

// Bước 3: Đặt lại mật khẩu mới bằng Token nhận được ở bước 2
export async function resetPassword(forgotPasswordToken: string, password: string, confirmPassword: string) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ forgotPasswordToken, password, confirmPassword }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: errJson?.message || "Đặt lại mật khẩu thất bại" };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Reset Password Error:", error);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}