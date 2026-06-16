"use client";

import React from "react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Tổng người dùng", value: "1,245", trend: "+12%", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Giao dịch hôm nay", value: "342", trend: "+5%", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Doanh thu Premium", value: "12,500K", trend: "+8%", color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">Tổng quan hệ thống quản lý chi tiêu.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 mb-2">{stat.label}</h3>
            <div className="flex items-end gap-3">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-1">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800">Người dùng mới</h3>
            <Link href="/admin/user" className="text-xs font-medium text-blue-600 hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                  U{i}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">User {i}</h4>
                  <p className="text-xs text-slate-500">user{i}@example.com</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Hoạt động hệ thống</h3>
          <div className="space-y-4">
             <div className="flex gap-3">
               <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500"></div>
               <div>
                 <p className="text-sm text-slate-800">Hệ thống gửi thông báo thành công tới 500 users.</p>
                 <p className="text-xs text-slate-500 mt-0.5">10 phút trước</p>
               </div>
             </div>
             <div className="flex gap-3">
               <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500"></div>
               <div>
                 <p className="text-sm text-slate-800">Backup cơ sở dữ liệu hoàn tất.</p>
                 <p className="text-xs text-slate-500 mt-0.5">1 giờ trước</p>
               </div>
             </div>
          </div>
        </div>
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800">Cấu hình Hệ thống</h3>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-purple-800">Cấu hình Webhook & Thanh toán</h4>
              <p className="text-xs text-purple-600 mt-1">Quản lý giá gói Premium, thông tin ngân hàng và cấu hình Sepay VietQR.</p>
            </div>
            <Link 
              href="/admin/premium" 
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            >
              Cài đặt
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-sm text-amber-800">
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>Dashboard admin hiện tại hiển thị dữ liệu giả (mock data). API quản trị viên chưa được cung cấp.</p>
      </div>
    </div>
  );
}
