"use client";

import React, { useState, useEffect } from "react";
import { getWallets } from "../../actions/auth";

export default function WalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWallets();
  }, []);

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
    } catch (e) {
      setError("Có lỗi xảy ra khi tải danh sách ví.");
    }
    setLoading(false);
  }

  const totalBalance = wallets.reduce((acc, wallet) => acc + (wallet.balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tài khoản & Ví</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý các nguồn tiền của bạn.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-all text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm ví
        </button>
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-emerald-100 font-medium text-sm mb-1">Tổng số dư</h3>
        <p className="text-4xl font-bold">{totalBalance.toLocaleString()} đ</p>
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
                  <div className="text-right">
                    <p className="font-bold text-slate-800">{wallet.balance?.toLocaleString() || 0} đ</p>
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
