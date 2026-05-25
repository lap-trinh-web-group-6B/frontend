"use client";

import React, { useState, useEffect } from "react";
import { getStatisticsGeneral, getStatisticsExpenseToBalanceRatio } from "../../actions/auth";

export default function ReportsPage() {
  const [generalStats, setGeneralStats] = useState<any>(null);
  const [ratioStats, setRatioStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    try {
      const [genRes, ratioRes] = await Promise.all([
        getStatisticsGeneral(),
        getStatisticsExpenseToBalanceRatio()
      ]);

      if (genRes.success) setGeneralStats(genRes.data);
      if (ratioRes.success) setRatioStats(ratioRes.data);
      
      if (!genRes.success && !ratioRes.success) {
        setError("Không thể tải dữ liệu thống kê.");
      }
    } catch (e) {
      setError("Có lỗi xảy ra khi tải báo cáo.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Báo cáo tổng quan</h2>
        <p className="text-sm text-slate-500 mt-1">Phân tích tình hình tài chính của bạn trong tháng này.</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
            <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          </div>
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* General Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-emerald-800">Tổng thu</h3>
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {generalStats?.totalIncome?.toLocaleString() || 0} đ
              </p>
            </div>
            <div className="bg-red-50 border border-red-100 p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-red-800">Tổng chi</h3>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {generalStats?.totalExpense?.toLocaleString() || 0} đ
              </p>
            </div>
          </div>

          {/* Ratio Progress */}
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Tỷ lệ Chi tiêu / Tổng số dư</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-slate-600 bg-slate-100">
                    Chi tiêu
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-slate-600">
                    {ratioStats?.ratio?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-100">
                <div 
                  style={{ width: `${Math.min(100, ratioStats?.ratio || 0)}%` }} 
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    (ratioStats?.ratio || 0) > 80 ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                ></div>
              </div>
              <p className="text-xs text-slate-500 text-center">
                Bạn đã tiêu {(ratioStats?.ratio || 0).toFixed(1)}% so với ngân sách khả dụng.
              </p>
            </div>
          </div>

          {/* Empty State for Advanced Charts */}
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm text-center">
             <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
               </svg>
             </div>
             <h3 className="text-sm font-semibold text-slate-800">Biểu đồ phân tích chi tiết</h3>
             <p className="text-xs text-slate-500 mt-1">Cần tích hợp thư viện Chart (như Recharts/Chart.js) để xem biểu đồ xu hướng.</p>
          </div>
        </>
      )}
    </div>
  );
}
