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

// ====================================================
// Additional API helpers (Categories, Budgets, Transactions, Statistics, Notifications, Payment, User)
// ----------------------------------------------------
// Helper to get Authorization header from cookies (server side)
async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---------------------------
// 4. CATEGORIES (CRUD)
// ---------------------------
export async function getCategories(params = {}) {
  try {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${getDomain()}/api/v1/categories${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Lấy danh sách danh mục thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json.data, error: null };
  } catch (e) {
    console.error("Get Categories Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function createCategory(name: string, type: string, iconFile?: File) {
  try {
    const form = new FormData();
    form.append("name", name);
    form.append("type", type);
    if (iconFile) form.append("icon", iconFile);
    const res = await fetch(`${getDomain()}/api/v1/categories`, {
      method: "POST",
      headers: { ...(await getAuthHeaders()) }, // NOTE: fetch will set correct multipart boundary automatically
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Tạo danh mục thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json, error: null };
  } catch (e) {
    console.error("Create Category Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function getCategory(id: number) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/categories/${id}`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Lấy danh mục thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json.data, error: null };
  } catch (e) {
    console.error("Get Category Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function updateCategory(id: number, fields: Record<string, any>) {
  try {
    const form = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) form.append(key, value as any);
    });
    const res = await fetch(`${getDomain()}/api/v1/categories/${id}`, {
      method: "PATCH",
      headers: { ...(await getAuthHeaders()) },
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Cập nhật danh mục thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json, error: null };
  } catch (e) {
    console.error("Update Category Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function deleteCategory(id: number) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/categories/${id}`, {
      method: "DELETE",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Xóa danh mục thất bại" };
    }
    return { success: true, error: null };
  } catch (e) {
    console.error("Delete Category Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

// ---------------------------
// 5. BUDGETS (CRUD)
// ---------------------------
export async function createBudget(payload: Record<string, any>) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/budgets`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Tạo ngân sách thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json, error: null };
  } catch (e) {
    console.error("Create Budget Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function getBudgets(params = {}) {
  try {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${getDomain()}/api/v1/budgets${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Lấy danh sách ngân sách thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json.data, error: null };
  } catch (e) {
    console.error("Get Budgets Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function getBudget(id: number) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/budgets/${id}`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Lấy ngân sách thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json.data, error: null };
  } catch (e) {
    console.error("Get Budget Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function updateBudget(id: number, payload: Record<string, any>) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/budgets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Cập nhật ngân sách thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json, error: null };
  } catch (e) {
    console.error("Update Budget Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function completeBudget(id: number) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/budgets/${id}/complete`, {
      method: "PATCH",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Hoàn thành ngân sách thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json, error: null };
  } catch (e) {
    console.error("Complete Budget Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

// ---------------------------
// 6. TRANSACTIONS (CRUD + Scan Invoice)
// ---------------------------
export async function getTransactions(params = {}) {
  try {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${getDomain()}/api/v1/transactions${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Lấy danh sách giao dịch thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json.data, error: null };
  } catch (e) {
    console.error("Get Transactions Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function createTransaction(payload: Record<string, any>, receiptFile?: File) {
  try {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, v as any);
    });
    if (receiptFile) form.append("receipt_image", receiptFile);
    const res = await fetch(`${getDomain()}/api/v1/transactions`, {
      method: "POST",
      headers: { ...(await getAuthHeaders()) },
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Tạo giao dịch thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json, error: null };
  } catch (e) {
    console.error("Create Transaction Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function getTransaction(id: number) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/transactions/${id}`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Lấy giao dịch thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json.data, error: null };
  } catch (e) {
    console.error("Get Transaction Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function updateTransaction(id: number, payload: Record<string, any>, receiptFile?: File) {
  try {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, v as any);
    });
    if (receiptFile) form.append("receipt_image", receiptFile);
    const res = await fetch(`${getDomain()}/api/v1/transactions/${id}`, {
      method: "PATCH",
      headers: { ...(await getAuthHeaders()) },
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Cập nhật giao dịch thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json, error: null };
  } catch (e) {
    console.error("Update Transaction Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function deleteTransaction(id: number) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/transactions/${id}`, {
      method: "DELETE",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Xóa giao dịch thất bại" };
    }
    return { success: true, error: null };
  } catch (e) {
    console.error("Delete Transaction Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}
// chỗ nào
export async function scanInvoice(imageFile: File) {
  try {
    const form = new FormData();
    form.append("image", imageFile);
    const res = await fetch(`${getDomain()}/api/v1/transactions/scan-invoice`, {
      method: "POST",
      headers: { ...(await getAuthHeaders()) },
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Quét hóa đơn thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json, error: null };
  } catch (e) {
    console.error("Scan Invoice Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

// ---------------------------
// 7. STATISTICS
// ---------------------------
export async function getStatisticsGeneral(params = {}) {
  try {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${getDomain()}/api/v1/statistics/general${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Lấy thống kê chung thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json.data, error: null };
  } catch (e) {
    console.error("Statistics General Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function getStatisticsByCategory(params = {}) {
  try {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${getDomain()}/api/v1/statistics/by-category${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Lấy thống kê theo danh mục thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json.data, error: null };
  } catch (e) {
    console.error("Statistics By Category Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function getStatisticsTrend(params = {}) {
  try {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${getDomain()}/api/v1/statistics/trend${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Lấy thống kê xu hướng thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json.data, error: null };
  } catch (e) {
    console.error("Statistics Trend Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function getStatisticsExpenseToBalanceRatio(params = {}) {
  try {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${getDomain()}/api/v1/statistics/expense-to-balance-ratio${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Lấy tỷ lệ chi/đối số bế dư thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json.data, error: null };
  } catch (e) {
    console.error("Statistics Expense/Balance Ratio Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function getStatisticsIncomeVsExpense(params = {}) {
  try {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${getDomain()}/api/v1/statistics/income-vs-expense${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Lấy thống kê thu/chi thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json.data, error: null };
  } catch (e) {
    console.error("Statistics Income vs Expense Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

// ---------------------------
// 8. NOTIFICATIONS
// ---------------------------
export async function getNotifications() {
  try {
    const res = await fetch(`${getDomain()}/api/v1/notifications`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Lấy thông báo thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json.data, error: null };
  } catch (e) {
    console.error("Get Notifications Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function deleteAllNotifications() {
  try {
    const res = await fetch(`${getDomain()}/api/v1/notifications`, {
      method: "DELETE",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Xóa toàn bộ thông báo thất bại" };
    }
    return { success: true, error: null };
  } catch (e) {
    console.error("Delete All Notifications Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function getNotification(id: number) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/notifications/${id}`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Lấy thông báo thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json.data, error: null };
  } catch (e) {
    console.error("Get Notification Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function deleteNotification(id: number) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/notifications/${id}`, {
      method: "DELETE",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Xóa thông báo thất bại" };
    }
    return { success: true, error: null };
  } catch (e) {
    console.error("Delete Notification Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function markNotificationRead(id: number) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/notifications/${id}/read`, {
      method: "PATCH",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Đánh dấu đã đọc thất bại" };
    }
    return { success: true, error: null };
  } catch (e) {
    console.error("Mark Notification Read Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

// ---------------------------
// 9. PAYMENT
// ---------------------------
export async function checkoutPremium() {
  try {
    const res = await fetch(`${getDomain()}/api/payment/checkout`, {
      method: "POST",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Thanh toán thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json.data, error: null };
  } catch (e) {
    console.error("Checkout Premium Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

// ---------------------------
// 10. USER PROFILE & SETTINGS
// ---------------------------
export async function getUserProfile() {
  try {
    const res = await fetch(`${getDomain()}/api/v1/user/profile`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Lấy thông tin người dùng thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json.data, error: null };
  } catch (e) {
    console.error("Get User Profile Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function updateAvatar(formData: FormData) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/user/update-avatar`, {
      method: "PATCH",
      headers: { ...(await getAuthHeaders()) },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Cập nhật avatar thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json, error: null };
  } catch (e) {
    console.error("Update Avatar Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function updateUserName(fullName: string) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/user/update-name`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      body: JSON.stringify({ fullName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Cập nhật họ tên thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json, error: null };
  } catch (e) {
    console.error("Update User Name Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function updateUserStatus(status: string) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/user/update-status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Cập nhật trạng thái thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json, error: null };
  } catch (e) {
    console.error("Update User Status Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function changePassword(payload: Record<string, any>) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/user/change-password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Đổi mật khẩu thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json, error: null };
  } catch (e) {
    console.error("Change Password Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

// ---------------------------
// 11. WALLETS (CRUD)
// ---------------------------
export async function getWallets(params = {}) {
  try {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${getDomain()}/api/v1/wallets${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Lấy danh sách ví thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json.data, error: null };
  } catch (e) {
    console.error("Get Wallets Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function createWallet(payload: Record<string, any>) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/wallets`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Tạo ví thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json, error: null };
  } catch (e) {
    console.error("Create Wallet Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function getWallet(id: number) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/wallets/${id}`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Lấy ví thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json.data, error: null };
  } catch (e) {
    console.error("Get Wallet Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function updateWallet(id: number, payload: Record<string, any>) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/wallets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Cập nhật ví thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json, error: null };
  } catch (e) {
    console.error("Update Wallet Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function deleteWallet(id: number) {
  try {
    const res = await fetch(`${getDomain()}/api/v1/wallets/${id}`, {
      method: "DELETE",
      headers: { ...(await getAuthHeaders()) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Xóa ví thất bại" };
    }
    return { success: true, error: null };
  } catch (e) {
    console.error("Delete Wallet Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

// ---------------------------
// 12. WEBHOOK
// ---------------------------
export async function sepayWebhook(payload: Record<string, any>) {
  try {
    const res = await fetch(`${getDomain()}/api/webhook/sepay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || "Xử lý Webhook thất bại" };
    }
    const json = await res.json();
    return { success: true, data: json, error: null };
  } catch (e) {
    console.error("Sepay Webhook Error:", e);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

// End of additional API helpers
