"use client";

import React, { useState } from "react";
import Link from "next/link";
import { forgotPasswordSendOtp, forgotPasswordVerifyOtp, forgotPasswordResendOtp, resetPassword } from "../../actions/auth";
import OtpForm from "../../components/OtpForm";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1); 
  const [email, setEmail] = useState("");
  const [fpToken, setFpToken] = useState(""); // Lưu token do verify OTP trả về
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // BƯỚC 1: Tìm email gửi OTP
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await forgotPasswordSendOtp(email);
    if (res.success) {
      setStep(2);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  // BƯỚC 2: Xác minh OTP lấy Token đổi mật khẩu
  const handleVerifyOtp = async (otpString: string) => {
    const res = await forgotPasswordVerifyOtp(email, otpString);
    if (res.success && res.forgotPasswordToken) {
      setFpToken(res.forgotPasswordToken); // Giữ Token cực kì quan trọng này
      setStep(3); // Đẩy sang màn hình cấu hình Pass mới
    }
    return res;
  };

  // BƯỚC 3: Submit mật khẩu mới kèm token xác minh
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    setLoading(true);
    setError(null);
    
    const res = await resetPassword(fpToken, password, confirmPassword);
    if (res.success) {
      router.push("/login?resetSuccess=true");
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  // Giao diện Bước 2: Điền OTP
  if (step === 2) {
    return (
      <OtpForm 
        email={email} 
        onVerify={handleVerifyOtp} 
        onResend={() => forgotPasswordResendOtp(email)} 
      />
    );
  }

  // Giao diện Bước 3: Đặt lại mật khẩu mới
  if (step === 3) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Đặt lại mật khẩu</h2>
          <p className="text-sm text-slate-500 mt-1">Vui lòng thiết lập mật khẩu bảo mật mới.</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">{error}</div>
        )}

        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Mật khẩu mới</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Xác nhận mật khẩu</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md"
          >
            {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </button>
        </form>
      </div>
    );
  }

  // Giao diện Bước 1: Điền Email
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Khôi phục mật khẩu</h2>
        <p className="text-sm text-slate-500 mt-1">Nhập email tài khoản Monety của bạn để nhận mã OTP khôi phục.</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Địa chỉ Email</label>
          <input
            type="email"
            placeholder="username@gmail.com"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
        >
          {loading ? "Đang kiểm tra..." : "Tiếp tục"}
        </button>
      </form>

      <div className="text-center text-sm">
        <Link href="/login" className="font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
          &larr; Quay lại Đăng nhập
        </Link>
      </div>
    </div>
  );
}
