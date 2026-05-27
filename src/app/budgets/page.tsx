"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getBudgets } from "../../actions/auth";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  async function fetchBudgets() {
    setLoading(true);
    setError(null);
    const res = await getBudgets();
    if (res.success) {
      setBudgets(res.data?.items || res.data || []);
    } else {
      setError(res.error || "Không thể tải danh sách ngân sách.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý ngân sách</h2>
          <p className="text-sm text-slate-500 mt-1">Theo dõi và kiểm soát chi tiêu hàng tháng.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-all text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm ngân sách
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Chưa có ngân sách nào</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            Tạo ngân sách đầu tiên để bắt đầu theo dõi chi tiêu của bạn một cách thông minh hơn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget: any) => (
            <div key={budget.id} className="p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{budget.name || "Ngân sách"}</h4>
                    <p className="text-xs text-slate-500">{budget.categoryName || "Tất cả danh mục"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ngân sách</p>
                  <p className="font-bold text-slate-800">{budget.amount?.toLocaleString()} đ</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Đã tiêu</span>
                  <span className="font-semibold text-slate-800">{budget.spent?.toLocaleString() || 0} đ</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full ${
                      (budget.spent / budget.amount) > 0.9 ? 'bg-red-500' : 
                      (budget.spent / budget.amount) > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, ((budget.spent || 0) / budget.amount) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{((budget.spent || 0) / budget.amount * 100).toFixed(1)}%</span>
                  <span>Còn lại: {(budget.amount - (budget.spent || 0)).toLocaleString()} đ</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
