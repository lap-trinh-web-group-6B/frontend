"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "../../actions/auth";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp!");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        currentPassword: oldPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      };
      const res = await changePassword(payload);
      
      if (res.success) {
        setSuccess(true);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Optional: redirect to profile after 1.5s
        setTimeout(() => {
          router.push("/profile");
        }, 1500);
      } else {
        setError(res.error || "Không thể đổi mật khẩu.");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi đổi mật khẩu.");
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Đổi mật khẩu</h2>
          <p className="text-sm text-slate-500">Cập nhật mật khẩu để bảo vệ tài khoản</p>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-100">
          Đổi mật khẩu thành công!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Mật khẩu hiện tại</label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Mật khẩu mới</label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
        >
          {loading ? "Đang xử lý..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}
