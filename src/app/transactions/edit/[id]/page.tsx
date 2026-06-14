"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  getTransaction, 
  updateTransaction,
  getWallets,
  getCategories,
  scanInvoice,
  getUserProfile
} from "../../../../actions/auth";

export default function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const transactionId = Number(resolvedParams.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Data
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [walletId, setWalletId] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  
  // Lists
  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Scanner
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Premium State
  const [profile, setProfile] = useState<any>(null);
  const [isPromoOpen, setIsPromoOpen] = useState(false);

  useEffect(() => {
    fetchData();
    fetchProfile();
  }, [transactionId]);

  async function fetchProfile() {
    try {
      const res = await getUserProfile();
      if (res.success) {
        setProfile(res.data);
      }
    } catch (e) {}
  }

  async function fetchData() {
    setLoading(true);
    try {
      const [wRes, cRes, tRes] = await Promise.all([
        getWallets(),
        getCategories({ limit: 100 }),
        getTransaction(transactionId)
      ]);

      if (wRes.success) setWallets(wRes.data?.items || wRes.data || []);
      if (cRes.success) setCategories(cRes.data?.items || cRes.data || []);
      
      if (tRes.success && tRes.data) {
        const t = tRes.data;
        setAmount(t.amount?.toString() || "");
        if (t.transaction_date) {
          const d = new Date(t.transaction_date);
          setDate(d.toISOString().slice(0, 16)); // format for datetime-local
        }
        setNote(t.note || "");
        setType(t.type || "EXPENSE");
        setWalletId(t.wallet_id || "");
        setCategoryId(t.category_id || "");
      } else {
        setError("Không tìm thấy giao dịch");
      }
    } catch (e: any) {
      if (e?.message === 'NEXT_REDIRECT' || (e?.digest && e.digest.startsWith('NEXT_REDIRECT'))) throw e;
      setError("Lỗi kết nối");
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!walletId || !categoryId || !amount) {
      setError("Vui lòng điền đủ thông tin ví, danh mục và số tiền");
      return;
    }
    
    setSaving(true);
    setError(null);
    try {
      const payload = {
        amount: Number(amount),
        transaction_date: new Date(date).toISOString(),
        note,
        wallet_id: Number(walletId),
        category_id: Number(categoryId)
      };
      
      const res = await updateTransaction(transactionId, payload);
      if (res.success) {
        router.push("/transactions");
      } else {
        setError(res.error || "Không thể cập nhật giao dịch");
      }
    } catch (err: any) {
      if (err?.message === 'NEXT_REDIRECT' || (err?.digest && err.digest.startsWith('NEXT_REDIRECT'))) throw err;
      setError("Có lỗi xảy ra khi lưu");
    }
    setSaving(false);
  }

  async function handleScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setError(null);
    
    try {
      const res = await scanInvoice(file);
      if (res.success && res.data) {
        if (res.data.amount) setAmount(res.data.amount.toString());
        if (res.data.date) {
          try {
            const d = new Date(res.data.date);
            if (!isNaN(d.getTime())) setDate(d.toISOString().slice(0, 16));
          } catch(e) {}
        }
        if (res.data.note) setNote(res.data.note);
      } else {
        setError(res.error || "Không thể nhận diện hóa đơn");
      }
    } catch (err) {
      setError("Lỗi kết nối khi quét");
    }
    setScanning(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Đang tải dữ liệu giao dịch...</div>;
  }

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push("/transactions")}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sửa giao dịch</h2>
          <p className="text-sm text-slate-500 mt-1">Cập nhật thông tin giao dịch</p>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="font-medium text-sm flex items-center gap-1.5">
              Quét hóa đơn để tự điền
              {profile?.type === "FREE" && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  🔒 Premium
                </span>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (profile?.type === "FREE") {
                setIsPromoOpen(true);
              } else {
                fileInputRef.current?.click();
              }
            }}
            disabled={scanning}
            className="px-4 py-2 bg-white text-emerald-600 font-medium text-sm rounded-lg border border-emerald-200 shadow-sm hover:bg-emerald-50 transition-colors disabled:opacity-50"
          >
            {scanning ? "Đang quét..." : "Tải ảnh lên"}
          </button>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleScan} />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Loại giao dịch</label>
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => { setType('EXPENSE'); setCategoryId(""); }}
              >
                Khoản chi
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => { setType('INCOME'); setCategoryId(""); }}
              >
                Khoản thu
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Số tiền</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm font-medium pr-12"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">VNĐ</div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Thời gian</label>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Ví / Tài khoản</label>
              <select
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                value={walletId}
                onChange={(e) => setWalletId(Number(e.target.value))}
              >
                <option value="" disabled>Chọn ví...</option>
                {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Danh mục</label>
              <select
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
              >
                <option value="" disabled>Chọn danh mục...</option>
                {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Ghi chú (Tùy chọn)</label>
            <input
              type="text"
              placeholder="VD: Ăn sáng, Đổ xăng..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>

      {/* Premium Promotion Modal */}
      {isPromoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                Nâng cấp Premium
              </h3>
              <button 
                onClick={() => setIsPromoOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-slate-600 text-sm leading-relaxed text-center font-medium">
                Tính năng tự động nhận diện quét ảnh hóa đơn bằng AI chỉ khả dụng đối với tài khoản PREMIUM. Hãy nâng cấp ngay để trải nghiệm sự tiện lợi này cùng nhiều tính năng vượt trội khác!
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPromoOpen(false)}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Để sau
                </button>
                <Link
                  href="/premium"
                  className="flex-1 px-4 py-3 text-sm font-bold text-center text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl transition-colors shadow-md shadow-amber-100 flex items-center justify-center"
                >
                  Nâng cấp ngay ✨
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
