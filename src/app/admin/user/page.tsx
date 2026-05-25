"use client";

import React from "react";

export default function AdminUserPage() {
  const users = [
    { id: 1, name: "Nguyễn Văn A", email: "nva@gmail.com", role: "USER", status: "ACTIVE", type: "PREMIUM" },
    { id: 2, name: "Trần Thị B", email: "ttb@gmail.com", role: "USER", status: "ACTIVE", type: "FREE" },
    { id: 3, name: "Lê Văn C", email: "lvc@gmail.com", role: "USER", status: "BANNED", type: "FREE" },
    { id: 4, name: "Admin", email: "admin@monety.com", role: "ADMIN", status: "ACTIVE", type: "PREMIUM" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Người dùng</h2>
          <p className="text-sm text-slate-500 mt-1">Xem danh sách và quản lý trạng thái tài khoản.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Tìm kiếm email..." 
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
          />
          <button className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-all text-sm">
            Tìm
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Người dùng</th>
                <th className="px-6 py-4 font-semibold">Loại TK</th>
                <th className="px-6 py-4 font-semibold">Vai trò</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500">#{user.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{user.name}</div>
                    <div className="text-slate-500 text-xs">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    {user.type === "PREMIUM" ? (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">Premium</span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">Free</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors mr-2">
                      Sửa
                    </button>
                    {user.status === 'ACTIVE' ? (
                      <button className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors">
                        Khóa
                      </button>
                    ) : (
                      <button className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 p-2 rounded-lg transition-colors">
                        Mở
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-sm text-amber-800">
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>Giao diện hiện tại đang sử dụng dữ liệu giả (mock data). Cần bổ sung API quản lý người dùng để tương tác thực tế.</p>
      </div>
    </div>
  );
}
