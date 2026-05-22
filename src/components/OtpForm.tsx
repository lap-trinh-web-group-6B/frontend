"use client";

import React, { useState, useEffect } from "react";

interface OtpFormProps {
  email: string;
  onVerify: (otp: string) => Promise<{ success: boolean; error: string | null }>;
  onResend: () => Promise<{ success: boolean; error: string | null }>;
}

export default function OtpForm({ email, onVerify, onResend }: OtpFormProps) {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = countdown > 0 && setInterval(() => setCountdown(countdown - 1), 1000);
    return () => { if (timer) clearInterval(timer); };
  }, [countdown]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;
    const val = element.value;
    setOtp([...otp.map((d, idx) => (idx === index ? val : d))]);

    // Tự động chuyển ô tiếp theo
    if (val !== "" && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && e.currentTarget.previousSibling) {
      (e.currentTarget.previousSibling as HTMLInputElement).focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const otpString = otp.join("");
    
    if (otpString.length < 6) {
      setError("Vui lòng nhập đủ 6 chữ số.");
      setLoading(false);
      return;
    }

    const res = await onVerify(otpString);
    if (!res.success) {
      setError(res.error);
    }
    setLoading(false);
  };

  const handleResendClick = async () => {
    if (countdown > 0) return;
    setError(null);
    const res = await onResend();
    if (res.success) {
      setCountdown(60);
    } else {
      setError(res.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Xác thực mã OTP</h2>
        <p className="text-sm text-slate-500">
          Mã xác thực đã được gửi tới email <span className="font-medium text-slate-700">{email}</span>
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 text-center animate-shake">
          {error}
        </div>
      )}

      {/* 6 Ô nhập OTP */}
      <div className="flex justify-between gap-2 max-w-xs mx-auto">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            className="w-11 h-12 text-center text-xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "Đang xác thực..." : "Xác nhận"}
      </button>

      <div className="text-center text-sm">
        {countdown > 0 ? (
          <p className="text-slate-400">Gửi lại mã sau <span className="text-emerald-600 font-medium">{countdown}s</span></p>
        ) : (
          <button
            type="button"
            onClick={handleResendClick}
            className="text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-4"
          >
            Gửi lại mã OTP
          </button>
        )}
      </div>
    </form>
  );
}