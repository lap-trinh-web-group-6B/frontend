"use client";

import React from "react";

export default function SavingsGoalsPage() {
  const goals = [
    { id: 1, name: "Mua MacBook Pro", targetAmount: 45000000, currentAmount: 15000000, deadline: "2026-12-31" },
    { id: 2, name: "Du lịch Đà Lạt", targetAmount: 5000000, currentAmount: 4000000, deadline: "2026-06-15" },
    { id: 3, name: "Quỹ dự phòng khẩn cấp", targetAmount: 100000000, currentAmount: 20000000, deadline: "2027-01-01" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mục tiêu tiết kiệm</h2>
          <p className="text-sm text-slate-500 mt-1">Lên kế hoạch và theo dõi tiến độ tích lũy.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-all text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm mục tiêu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <div key={goal.id} className="p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{goal.name}</h4>
                    <p className="text-xs text-slate-500">Mục tiêu: {goal.targetAmount.toLocaleString()} đ</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Đã tích lũy</span>
                  <span className="font-semibold text-slate-800">{goal.currentAmount.toLocaleString()} đ</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="h-2.5 rounded-full bg-indigo-500"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{progress.toFixed(1)}%</span>
                  <span>Còn lại: {(goal.targetAmount - goal.currentAmount).toLocaleString()} đ</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-sm text-amber-800">
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>Giao diện hiện tại đang sử dụng dữ liệu giả (mock data). API Mục tiêu tiết kiệm chưa được tích hợp.</p>
      </div>
    </div>
  );
}
