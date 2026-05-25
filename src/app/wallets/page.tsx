"use client";

import React from "react";

export default function WalletsPage() {
  const wallets = [
    { id: 1, name: "Tiền mặt", balance: 2500000, type: "cash", color: "text-emerald-600", bg: "bg-emerald-50" },
    { id: 2, name: "Thẻ Vietcombank", balance: 15400000, type: "bank", color: "text-blue-600", bg: "bg-blue-50" },
    { id: 3, name: "Ví MoMo", balance: 850000, type: "ewallet", color: "text-pink-600", bg: "bg-pink-50" },
  ];

  const totalBalance = wallets.reduce((acc, wallet) => acc + wallet.balance, 0);

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

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-800 text-lg">Danh sách ví</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets.map(wallet => (
            <div key={wallet.id} className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-200 transition-colors cursor-pointer group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${wallet.bg} ${wallet.color}`}>
                  {wallet.type === 'cash' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )}
                  {wallet.type === 'bank' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  )}
                  {wallet.type === 'ewallet' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{wallet.name}</h4>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{wallet.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">{wallet.balance.toLocaleString()} đ</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-sm text-amber-800">
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>Giao diện hiện tại đang sử dụng dữ liệu giả (mock data). API Quản lý Ví chưa được tích hợp.</p>
      </div>
    </div>
  );
}
