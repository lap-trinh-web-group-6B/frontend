"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getTransactions, deleteTransaction } from "../../actions/auth";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setLoading(true);
    setError(null);
    const res = await getTransactions();
    if (res.success) {
      setTransactions(res.data || []);
    } else {
      setError(res.error || "Không thể tải danh sách giao dịch.");
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) return;
    const res = await deleteTransaction(id);
    if (res.success) {
      setTransactions(transactions.filter((t) => t.id !== id));
    } else {
      alert(res.error || "Xóa thất bại");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Giao dịch</h2>
          <p className="text-sm text-slate-500 mt-1">Lịch sử thu chi chi tiết của bạn.</p>
        </div>
        <Link 
          href="/transactions/create"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm giao dịch
        </Link>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Chưa có giao dịch</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto mb-6">
            Ghi chép lại các khoản thu chi để quản lý tài chính hiệu quả hơn.
          </p>
          <Link 
            href="/transactions/create"
            className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-5 rounded-xl transition-colors"
          >
            Thêm giao dịch đầu tiên
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {transactions.map((t: any) => {
              const isExpense = t.type === "EXPENSE";
              return (
                <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isExpense ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                      {isExpense ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{t.note || t.categoryName || "Giao dịch"}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(t.createdAt).toLocaleDateString("vi-VN")} • {t.categoryName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold text-sm ${isExpense ? 'text-red-600' : 'text-emerald-600'}`}>
                        {isExpense ? "-" : "+"}{t.amount?.toLocaleString()} đ
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
