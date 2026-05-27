"use client";

import React, { useState, useEffect, useRef } from "react";
import { getNotifications, markNotificationRead, deleteAllNotifications } from "../actions/auth";

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    setLoading(true);
    const res = await getNotifications();
    if (res.success) {
      setNotifications(res.data?.items || res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleClearAll = async () => {
    await deleteAllNotifications();
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-colors relative ${
          isOpen ? "bg-emerald-100 text-emerald-700" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="font-bold text-slate-800">Thông báo</h3>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p className="text-sm">Không có thông báo nào.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 transition-colors ${
                      notif.isRead ? "bg-white" : "bg-emerald-50/50"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                          notif.isRead ? "bg-transparent" : "bg-emerald-500"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <p className={`text-sm ${notif.isRead ? "text-slate-600" : "text-slate-800 font-medium"}`}>
                          {notif.content || notif.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(notif.createdAt || Date.now()).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 flex-shrink-0"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
