"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getWallets, createWallet, updateWallet, deleteWallet, getUserProfile } from "../../actions/auth";
import { formatCurrency } from "../../utils/format";

export default function WalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [walletName, setWalletName] = useState("");
  const [walletType, setWalletType] = useState("CASH");
  const [walletBalance, setWalletBalance] = useState("");
  const [walletCurrency, setWalletCurrency] = useState("VND");
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingWallet, setDeletingWallet] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Premium State
  const [profile, setProfile] = useState<any>(null);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");

  useEffect(() => {
    fetchWallets();
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await getUserProfile();
      if (res.success) {
        setProfile(res.data);
      }
    } catch (e) {}
  }

  async function fetchWallets() {
    setLoading(true);
    setError(null);
    try {
      const res = await getWallets();
      if (res.success) {
        setWallets(res.data?.items || res.data || []);
      } else {
        setError(res.error || "Không thể tải danh sách ví.");
      }
    } catch (e: any) {
      if (e?.message === 'NEXT_REDIRECT' || (e?.digest && e.digest.startsWith('NEXT_REDIRECT'))) throw e;
      setError("Có lỗi xảy ra khi tải danh sách ví.");
    }
    setLoading(false);
  }

  function openAddModal() {
    if (profile?.type === "FREE" && wallets.length >= 2) {
      setPromoMessage("Tài khoản Miễn phí (FREE) chỉ được tạo tối đa 2 ví. Hãy nâng cấp lên PREMIUM để không giới hạn nguồn tiền và tận hưởng trọn vẹn đặc quyền!");
      setIsPromoOpen(true);
      return;
    }
    setEditingId(null);
    setWalletName("");
    setWalletType("CASH");
    setWalletBalance("");
    setWalletCurrency("VND");
    setModalError(null);
    setIsModalOpen(true);
  }

  function openEditModal(wallet: any) {
    setEditingId(wallet.id);
    setWalletName(wallet.name || "");
    setWalletType(wallet.type || "CASH");
    setWalletBalance(wallet.balance?.toString() || "0");
    setWalletCurrency(wallet.currency || "VND");
    setModalError(null);
    setIsModalOpen(true);
  }

  function openDeleteModal(wallet: any) {
    setDeletingWallet(wallet);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  }

  async function confirmDeleteWallet() {
    if (!deletingWallet) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteWallet(deletingWallet.id);
      if (res.success) {
        setWallets(wallets.filter((w) => w.id !== deletingWallet.id));
        setIsDeleteModalOpen(false);
      } else {
        setDeleteError(res.error || "Không thể xóa ví.");
      }
    } catch (err) {
      setDeleteError("Lỗi khi xóa ví.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!walletName.trim()) {
      setModalError("Vui lòng nhập tên ví");
      return;
    }
    
    setIsSubmitting(true);
    setModalError(null);
    
    const payload = {
      name: walletName,
      type: walletType,
      balance: Number(walletBalance) || 0,
      currency: walletCurrency
    };

    try {
      let res;
      if (editingId) {
        res = await updateWallet(editingId, payload);
      } else {
        res = await createWallet(payload);
      }
      
      if (res.success) {
        setIsModalOpen(false);
        fetchWallets();
      } else {
        setModalError(res.error || (editingId ? "Không thể cập nhật ví" : "Không thể tạo ví mới"));
      }
    } catch (err: any) {
      if (err?.message === 'NEXT_REDIRECT' || (err?.digest && err.digest.startsWith('NEXT_REDIRECT'))) throw err;
      setModalError("Có lỗi xảy ra khi lưu.");
    }
    setIsSubmitting(false);
  }

  const totalBalance = wallets.reduce((acc, wallet) => acc + (Number(wallet.balance) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tài khoản & Ví</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-slate-500">Quản lý các nguồn tiền của bạn.</p>
            {profile?.type === "FREE" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Gói Free: {wallets.length}/2 ví
              </span>
            )}
            {profile?.type === "PREMIUM" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                Premium ({wallets.length} ví)
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-all text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm ví
        </button>
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-emerald-100 font-medium text-sm mb-1">Tổng số dư</h3>
        <p className="text-4xl font-bold">{formatCurrency(totalBalance)}</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-800 text-lg">Danh sách ví</h3>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />)}
          </div>
        ) : wallets.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border border-slate-100 rounded-2xl bg-slate-50">
            Chưa có ví nào được tạo.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wallets.map(wallet => {
              const type = wallet.type || 'CASH';
              let color = 'text-emerald-600';
              let bg = 'bg-emerald-50';
              if (type === 'BANK_ACCOUNT') { color = 'text-blue-600'; bg = 'bg-blue-50'; }
              if (type === 'E_WALLET') { color = 'text-pink-600'; bg = 'bg-pink-50'; }

              return (
                <div key={wallet.id} className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-200 transition-colors cursor-pointer group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
                      {type === 'CASH' && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                      {type === 'BANK_ACCOUNT' && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      )}
                      {type === 'E_WALLET' && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{wallet.name}</h4>
                      <p className="text-xs text-slate-500 uppercase">{type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{formatCurrency(wallet.balance)}</p>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                      <button 
                        onClick={() => openEditModal(wallet)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openDeleteModal(wallet); }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Wallet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? "Chỉnh sửa ví" : "Thêm ví mới"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                  {modalError}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Tên ví</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tiền mặt, Thẻ tín dụng..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Loại ví</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                  value={walletType}
                  onChange={(e) => setWalletType(e.target.value)}
                >
                  <option value="CASH">Tiền mặt</option>
                  <option value="BANK_ACCOUNT">Tài khoản ngân hàng</option>
                  <option value="E_WALLET">Ví điện tử</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Số dư</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm pr-12"
                    value={walletBalance}
                    onChange={(e) => setWalletBalance(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                    VNĐ
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                Xóa ví: {deletingWallet.name}
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
              
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 text-red-800">
                <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm">
                  <span className="font-semibold block">Hành động này không thể hoàn tác!</span>
                  <span className="block mt-0.5 text-xs text-red-700">
                    Toàn bộ các giao dịch và chuyển khoản liên quan đến ví này sẽ bị xóa vĩnh viễn khỏi hệ thống.
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tên ví:</span>
                  <span className="font-semibold text-slate-800">{deletingWallet.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Loại ví:</span>
                  <span className="font-semibold text-slate-800">
                    {deletingWallet.type === 'CASH' && "Tiền mặt"}
                    {deletingWallet.type === 'BANK_ACCOUNT' && "Tài khoản ngân hàng"}
                    {deletingWallet.type === 'E_WALLET' && "Ví điện tử"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số dư hiện tại:</span>
                  <span className="font-bold text-slate-800">{formatCurrency(deletingWallet.balance)}</span>
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
                  onClick={confirmDeleteWallet}
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
                {promoMessage}
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
