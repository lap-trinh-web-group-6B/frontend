import React from "react";
import "./globals.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans text-slate-900">
      {/* Bên trái: Banner thương hiệu (Ẩn trên mobile) */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-tr from-emerald-600 to-teal-500 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <div className="text-2xl font-black tracking-wider flex items-center gap-2">
            <span className="bg-white text-emerald-600 px-3 py-1 rounded-xl shadow-md">M</span>
            MONETY
          </div>
        </div>
        
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Làm chủ dòng tiền,<br />Kiến tạo tương lai.
          </h1>
          <p className="text-emerald-100 font-light leading-relaxed">
            Hệ thống quản lý chi tiêu cá nhân thông minh giúp bạn theo dõi giao dịch, lập ngân sách hiệu quả và đạt được các mục tiêu tài chính bền vững.
          </p>
        </div>

        <div className="relative z-10 text-xs text-emerald-200/80">
          &copy; 2026 Monety. Hệ thống quản lý tài chính sinh viên.
        </div>
      </div>

      {/* Bên phải: Nội dung Form xử lý (Children) */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-12 md:p-20">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 p-8 sm:p-10 transition-all">
          {children}
        </div>
      </div>
    </div>
  );
}