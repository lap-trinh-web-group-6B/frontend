"use client";

import React, { useState } from "react";
import Link from "next/link";
import { login } from "../../actions/auth"; // Đường dẫn file Server Actions của bạn
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password);
    if (res.success) {
      router.push("/");
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Chào mừng trở lại!</h2>
        <p className="text-sm text-slate-500 mt-1">Vui lòng đăng nhập để quản lý chi tiêu của bạn.</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Email</label>
          <input
            type="email"
            required
            placeholder="example@gmail.com"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Mật khẩu</label>
            <Link href="/forgot-password" className="text-xs font-medium text-emerald-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <input
            type="password"
            required
            placeholder="••••••••"
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
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      <div className="text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-semibold text-emerald-600 hover:underline">
          Đăng ký miễn phí
        </Link>
      </div>
    </div>
  );
}