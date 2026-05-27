"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getUserProfile, getStatisticsGeneral, getTransactions } from "../actions/auth";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Chạy song song các request để tối ưu tốc độ
        const [profileRes, statsRes, transRes] = await Promise.all([
          getUserProfile(),
          getStatisticsGeneral(),
          getTransactions({ limit: 5 })
        ]);

        if (profileRes.success) setUser(profileRes.data);
        if (statsRes.success) setStats(statsRes.data);
        if (transRes.success) {
          // Xử lý cả 2 trường hợp data trả về mảng trực tiếp hoặc mảng trong .items
          setRecentTransactions(transRes.data?.items || transRes.data || []);
        }

      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const totalIncome = stats?.totalIncome || 0;
  const totalExpense = stats?.totalExpense || 0;
  // Nếu API không trả về field balance cụ thể thì dùng tổng thu trừ tổng chi
  const balance = stats?.balance ?? (totalIncome - totalExpense);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header: User Profile Greeting */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-100 to-teal-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              user?.fullName?.charAt(0).toUpperCase() || "U"
            )}
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Chào mừng trở lại,</p>
            <h1 className="text-xl font-bold text-slate-800">{user?.fullName || "Người dùng"}</h1>
          </div>
        </div>
        <Link href="/profile" className="hidden sm:flex text-sm text-emerald-600 font-medium hover:text-emerald-700 hover:underline">
          Tài khoản
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-emerald-100 text-sm font-medium mb-1">Số dư hiện tại</p>
            <h3 className="text-3xl font-bold">{balance.toLocaleString()} đ</h3>
          </div>
          <svg className="absolute right-0 bottom-0 text-emerald-500 w-32 h-32 transform translate-x-8 translate-y-8 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <p className="text-slate-500 text-sm font-medium">Tổng thu nhập</p>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">{totalIncome.toLocaleString()} đ</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
            </div>
            <p className="text-slate-500 text-sm font-medium">Tổng chi tiêu</p>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">{totalExpense.toLocaleString()} đ</h3>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Giao dịch gần đây</h2>
          <Link href="/transactions" className="text-sm text-emerald-600 font-medium hover:underline">
            Xem tất cả
          </Link>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>Chưa có giao dịch nào.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentTransactions.map((tx: any) => {
              const isExpense = tx.type === "EXPENSE";
              return (
                <div key={tx.id} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isExpense ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                      {isExpense ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{tx.note || tx.categoryName || "Giao dịch"}</p>
                      <p className="text-xs text-slate-500">{new Date(tx.createdAt || tx.transaction_date || Date.now()).toLocaleDateString("vi-VN")}</p>
                    </div>
                  </div>
                  <div className={`font-bold text-sm ${isExpense ? 'text-red-600' : 'text-emerald-600'}`}>
                    {isExpense ? "-" : "+"}{tx.amount?.toLocaleString()} đ
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
