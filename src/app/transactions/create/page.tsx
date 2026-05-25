"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createTransaction, scanInvoice } from "../../../actions/auth";

export default function CreateTransactionPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState("EXPENSE"); // EXPENSE or INCOME
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Invoice scan states
  const [scanning, setScanning] = useState(false);
  const [invoiceText, setInvoiceText] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    setLoading(true);
    setError(null);
    
    const payload = {
      amount: Number(amount),
      note,
      type,
      categoryId: 1, // Defaulting to 1 for demo purposes, usually from a dropdown
    };

    const res = await createTransaction(payload);
    if (res.success) {
      router.push("/transactions");
    } else {
      setError(res.error || "Có lỗi xảy ra khi tạo giao dịch.");
    }
    setLoading(false);
  };

  const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setError(null);
    
    const res = await scanInvoice(file);
    if (res.success && res.data) {
      // Assuming the API returns amount and note from OCR
      if (res.data.amount) setAmount(res.data.amount.toString());
      if (res.data.note) setNote(res.data.note);
      setInvoiceText("Đã quét thông tin hóa đơn thành công!");
      setTimeout(() => setInvoiceText(null), 3000);
    } else {
      setError(res.error || "Không thể quét hóa đơn.");
    }
    setScanning(false);
    
    // reset input
    e.target.value = '';
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Thêm giao dịch</h2>
          <p className="text-sm text-slate-500">Ghi lại khoản thu/chi mới</p>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {invoiceText && (
        <div className="p-3 text-sm text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-100">
          {invoiceText}
        </div>
      )}

      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
        {/* Type Selector */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setType('EXPENSE')}
          >
            Khoản chi
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setType('INCOME')}
          >
            Khoản thu
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Số tiền (đ)</label>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                placeholder="0"
                className="w-full px-4 py-3 text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">VND</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Ghi chú</label>
            <input
              type="text"
              placeholder="Vd: Ăn trưa, Đổ xăng..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleInvoiceUpload}
                disabled={scanning}
              />
              <div className="flex flex-col items-center gap-2">
                {scanning ? (
                  <>
                    <svg className="w-6 h-6 text-emerald-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <span className="text-sm font-medium text-emerald-600">Đang quét hóa đơn...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-500">Chụp hoặc tải lên hóa đơn để điền tự động</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || scanning}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? "Đang lưu..." : "Lưu giao dịch"}
          </button>
        </form>
      </div>
    </div>
  );
}
