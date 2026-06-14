"use client";

import React, { useState, useEffect } from "react";
import { 
  getStatisticsGeneral, 
  getStatisticsExpenseToBalanceRatio,
  getStatisticsByCategory,
  getStatisticsTrend,
  getStatisticsIncomeVsExpense
} from "../../actions/auth";
import { formatCurrency } from "../../utils/format";

export default function ReportsPage() {
  const [generalStats, setGeneralStats] = useState<any>(null);
  const [ratioStats, setRatioStats] = useState<any>(null);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [trendStats, setTrendStats] = useState<any[]>([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    try {
      const [genRes, ratioRes, catRes, trendRes, incExpRes] = await Promise.all([
        getStatisticsGeneral(),
        getStatisticsExpenseToBalanceRatio(),
        getStatisticsByCategory(),
        getStatisticsTrend(),
        getStatisticsIncomeVsExpense()
      ]);

      if (genRes.success) setGeneralStats(genRes.data);
      if (ratioRes.success) setRatioStats(ratioRes.data);
      if (catRes.success) setCategoryStats(catRes.data || []);
      if (trendRes.success) setTrendStats(trendRes.data || []);
      if (incExpRes.success) setIncomeVsExpense(incExpRes.data);

      if (!genRes.success && !ratioRes.success) {
        console.warn("Could not load some statistics");
      }
    } catch (e) {
      setError("Có lỗi xảy ra khi tải báo cáo từ máy chủ.");
    }
    setLoading(false);
  }

  // Handle potential camelCase or snake_case from backend
  const totalIncome = generalStats?.totalIncome ?? generalStats?.total_income ?? 0;
  const totalExpense = generalStats?.totalExpense ?? generalStats?.total_expense ?? 0;
  const ratioBalance = ratioStats?.total_balance ?? 0;
  const ratioExpense = ratioStats?.total_expense ?? 0;
  const totalAvailable = ratioBalance + ratioExpense;
  const ratio = ratioStats?.ratio ?? (totalAvailable > 0 ? (ratioExpense / totalAvailable) * 100 : 0);

  // Ensure categoryStats is an array
  const safeCategoryStats = Array.isArray(categoryStats) ? categoryStats : (categoryStats as any)?.items || [];
  // Ensure trendStats is an array
  const safeTrendStats = Array.isArray(trendStats) ? trendStats : (trendStats as any)?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Báo cáo tổng quan</h2>
        <p className="text-sm text-slate-500 mt-1">Phân tích tình hình tài chính của bạn qua các API Thống kê.</p>
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
          <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* 1. General Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-emerald-800">Tổng thu</h3>
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="bg-red-50 border border-red-100 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-red-800">Tổng chi</h3>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>

          {/* 2. Ratio Progress */}
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Tỷ lệ Chi tiêu / Tổng tài sản (Expense to Balance Ratio)</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-slate-600 bg-slate-100">
                    Chi tiêu
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-slate-600">
                    {ratio?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-100">
                <div 
                  style={{ width: `${Math.min(100, ratio || 0)}%` }} 
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    (ratio || 0) > 80 ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                ></div>
              </div>
              <p className="text-xs text-slate-500 text-center">
                Bạn đã tiêu {(ratio || 0).toFixed(1)}% so với ngân sách khả dụng.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3. By Category */}
            <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Chi tiêu theo danh mục</h3>
              {safeCategoryStats.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Chưa có dữ liệu phân tích danh mục.</p>
              ) : (
                <div className="space-y-4">
                  {safeCategoryStats.map((item: any, idx: number) => {
                    const amount = item.amount ?? item.total_amount ?? 0;
                    const catName = item.category_name ?? item.name ?? item.categoryName ?? "Khác";
                    return (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                          <span className="text-sm font-medium text-slate-700">{catName}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{formatCurrency(amount)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Trend */}
            <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Xu hướng (Trend)</h3>
              {safeTrendStats.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Chưa có dữ liệu xu hướng.</p>
              ) : (
                <div className="space-y-4">
                  {safeTrendStats.map((item: any, idx: number) => {
                    const dateStr = item.date ?? item.month ?? item.period ?? `Kỳ ${idx+1}`;
                    const inc = item.income ?? item.total_income ?? 0;
                    const exp = item.expense ?? item.total_expense ?? 0;
                    return (
                      <div key={idx} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                        <span className="font-medium text-slate-600">{dateStr}</span>
                        <div className="text-right">
                          <div className="text-emerald-600">+{formatCurrency(inc)}</div>
                          <div className="text-red-600">-{formatCurrency(exp)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 5. Income vs Expense */}
          {incomeVsExpense && (
            <div className="mt-6 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Tương quan Thu / Chi (Income vs Expense)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <p className="text-xs text-slate-500 mb-1">Số lượng Thu</p>
                  <p className="text-lg font-semibold text-emerald-600">
                    {incomeVsExpense?.INCOME?.transaction_count || 0}
                  </p>
                </div>
                <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                  <p className="text-xs text-slate-500 mb-1">Số lượng Chi</p>
                  <p className="text-lg font-semibold text-red-600">
                    {incomeVsExpense?.EXPENSE?.transaction_count || 0}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <p className="text-xs text-slate-500 mb-1">Tổng tiền Thu</p>
                  <p className="text-lg font-semibold text-emerald-600">
                    {formatCurrency(incomeVsExpense?.INCOME?.total_amount || 0)}
                  </p>
                </div>
                <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                  <p className="text-xs text-slate-500 mb-1">Tổng tiền Chi</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(incomeVsExpense?.EXPENSE?.total_amount || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
