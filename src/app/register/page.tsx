"use client";

import React, { useState } from "react";
import Link from "next/link";
import { registerSendOtp, registerVerifyOtp, registerResendOtp } from "../../actions/auth";
import OtpForm from "../../components/OtpForm";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Điền form, Step 2: Điền OTP
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Gửi thông tin đăng ký để backend bắn OTP về mail
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await registerSendOtp(fullName, email, password);
    if (res.success) {
      setStep(2); // Chuyển sang giao diện nhập OTP công khai
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  // Xác thực mã OTP để hoàn tất đăng ký tài khoản
  const handleVerifyOtp = async (otpString: string) => {
    const res = await registerVerifyOtp(fullName, email, password, otpString);
    if (res.success) {
      router.push("/login?registered=true");
    }
    return res;
  };

  // Hàm gửi lại OTP
  const handleResendOtp = async () => {
    return await registerResendOtp(email);
  };

  if (step === 2) {
    return (
      <OtpForm 
        email={email} 
        onVerify={handleVerifyOtp} 
        onResend={handleResendOtp} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Tạo tài khoản mới</h2>
        <p className="text-sm text-slate-500 mt-1">Bắt đầu hành trình tiết kiệm cùng Monety.</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Họ và tên</label>
          <input
            type="text"
            placeholder="Le Ngoc Uyen"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Email</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Mật khẩu</label>
          <input
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-md shadow-emerald-100 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
        >
          {loading ? "Đang gửi OTP..." : "Đăng ký tài khoản"}
        </button>
      </form>

      <div className="text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-semibold text-emerald-600 hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}