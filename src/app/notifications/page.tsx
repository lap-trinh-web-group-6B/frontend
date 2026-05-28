"use client";

import React, { useState, useEffect } from "react";
import { getNotifications, deleteNotification, deleteAllNotifications, markNotificationRead } from "../../actions/auth";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    setError(null);
    try {
      const res = await getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
      } else {
        setError(res.error || "Không thể tải thông báo.");
      }
    } catch (e: any) {
      if (e?.message === 'NEXT_REDIRECT' || (e?.digest && e.digest.startsWith('NEXT_REDIRECT'))) throw e;
      setError("Có lỗi xảy ra khi tải thông báo.");
    }
    setLoading(false);
  }

  async function handleMarkRead(id: number) {
    await markNotificationRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true, is_read: true } : n));
    window.dispatchEvent(new Event('notifications_updated'));
  }

  async function handleDelete(id: number) {
    const res = await deleteNotification(id);
    if (res.success) {
      setNotifications(notifications.filter(n => n.id !== id));
      window.dispatchEvent(new Event('notifications_updated'));
    }
  }

  async function handleDeleteAll() {
    if (!confirm("Xóa tất cả thông báo?")) return;
    const res = await deleteAllNotifications();
    if (res.success) {
      setNotifications([]);
      window.dispatchEvent(new Event('notifications_updated'));
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead && !n.is_read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Thông báo</h2>
          <p className="text-sm text-slate-500 mt-1">Cập nhật tình hình tài chính của bạn.</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="text-sm font-medium text-red-500 hover:text-red-700 hover:underline transition-colors"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border border-slate-100 rounded-2xl bg-slate-50">
          <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </div>
          <p>Không có thông báo nào.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
          {notifications.map((n: any) => (
            <div key={n.id} className={`p-4 transition-colors flex gap-4 ${(!n.isRead && !n.is_read) ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}>
              <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${(!n.isRead && !n.is_read) ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm ${(!n.isRead && !n.is_read) ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>{n.title || "Thông báo mới"}</h4>
                <p className="text-sm text-slate-600 mt-1">{n.message || n.content}</p>
                <p className="text-xs text-slate-400 mt-2">{new Date(n.createdAt || n.created_at).toLocaleString("vi-VN")}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                {(!n.isRead && !n.is_read) && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1.5 rounded cursor-pointer transition-colors border border-transparent hover:border-emerald-200"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
