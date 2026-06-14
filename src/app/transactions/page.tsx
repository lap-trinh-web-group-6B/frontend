"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getTransactions, deleteTransaction, getCategories } from "../../actions/auth";
import { formatCurrency } from "../../utils/format";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [txRes, catRes] = await Promise.all([
        getTransactions(),
        getCategories({ limit: 100 })
      ]);
      
      if (txRes.success) {
        setTransactions(txRes.data?.items || txRes.data || []);
      } else {
        setError(txRes.error || "Không thể tải danh sách giao dịch.");
      }

      if (catRes.success) {
        setCategories(catRes.data?.items || catRes.data || []);
      }
    } catch (e: any) {
      if (e?.message === 'NEXT_REDIRECT' || (e?.digest && e.digest.startsWith('NEXT_REDIRECT'))) throw e;
      setError("Có lỗi xảy ra khi tải dữ liệu.");
    }
    setLoading(false);
  }

  function openDeleteModal(tx: any) {
    setDeletingTransaction(tx);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  }

  async function confirmDeleteTransaction() {
    if (!deletingTransaction) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteTransaction(deletingTransaction.id);
      if (res.success) {
        setTransactions(transactions.filter((t) => t.id !== deletingTransaction.id));
        setIsDeleteModalOpen(false);
      } else {
        setDeleteError(res.error || "Xóa thất bại");
      }
    } catch (err) {
      setDeleteError("Lỗi kết nối khi xóa giao dịch.");
    } finally {
      setIsDeleting(false);
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
              // Because type is now on the category in DB, we check multiple possible payload keys.
              // If completely undefined, we default to EXPENSE (which is most common).
              const txType = t.type || t.categoryType || t.category_type || t.category?.type || categories.find(c => c.id === t.category_id)?.type;
              const isExpense = txType === "EXPENSE" || !txType;
              const catName = t.categoryName || categories.find(c => c.id === t.category_id)?.name || "Không có danh mục";
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
                      <h4 className="font-semibold text-slate-800 text-sm">{t.note || catName || "Giao dịch"}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(t.transaction_date || t.createdAt).toLocaleDateString("vi-VN")} • {catName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold text-sm ${isExpense ? 'text-red-600' : 'text-emerald-600'}`}>
                        {isExpense ? "-" : "+"}{formatCurrency(t.amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/transactions/edit/${t.id}`}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </Link>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openDeleteModal(t); }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                Xóa giao dịch
              </h3>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {deleteError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 animate-in fade-in duration-200">
                  {deleteError}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-amber-800">
                <svg className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <span className="font-semibold block">Hoàn trả số dư tự động!</span>
                  <span className="block mt-0.5 text-xs text-amber-700">
                    Số dư của ví liên quan sẽ tự động được hoàn trả hoặc khấu trừ tương ứng với số tiền của giao dịch này.
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Giao dịch / Ghi chú:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                    {deletingTransaction.note || categories.find(c => c.id === deletingTransaction.category_id)?.name || "Giao dịch"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ví thanh toán:</span>
                  <span className="font-semibold text-slate-800">
                    {deletingTransaction.wallets?.name || "Ví liên quan"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngày thực hiện:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(deletingTransaction.transaction_date || deletingTransaction.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                  <span className="text-slate-500 font-medium">Số tiền:</span>
                  <span className={`font-bold ${(deletingTransaction.type || deletingTransaction.categories?.type || categories.find(c => c.id === deletingTransaction.category_id)?.type) === "INCOME" ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(deletingTransaction.type || deletingTransaction.categories?.type || categories.find(c => c.id === deletingTransaction.category_id)?.type) === "INCOME" ? "+" : "-"}{formatCurrency(deletingTransaction.amount)}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDeleteTransaction}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : "Xác nhận xóa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
