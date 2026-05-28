"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { logout, getNotifications } from "../actions/auth";

// --- AUTH LAYOUT ---
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans text-slate-900">
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-tr from-emerald-600 to-teal-500 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <div className="text-2xl font-black tracking-wider flex items-center gap-2">
            <span className="bg-white text-emerald-600 px-3 py-1 rounded-xl shadow-md">M</span>
            MONETY
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Làm chủ dòng tiền,<br />Kiến tạo tương lai.
          </h1>
          <p className="text-emerald-100 font-light leading-relaxed">
            Hệ thống quản lý chi tiêu cá nhân thông minh giúp bạn theo dõi giao dịch, lập ngân sách hiệu quả và đạt được các mục tiêu tài chính bền vững.
          </p>
        </div>

        <div className="relative z-10 text-xs text-emerald-200/80">
          &copy; 2026 Monety. Hệ thống quản lý tài chính sinh viên.
        </div>
      </div>

      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-12 md:p-20 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100 p-8 sm:p-10 transition-all">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- DASHBOARD LAYOUT ---
function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchNotifs() {
      try {
        const res = await getNotifications();
        if (res.success) {
          const items = res.data?.items || res.data || [];
          const unread = items.filter((n: any) => !n.isRead && !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch (e) {
        // ignore
      }
    }
    fetchNotifs();

    const handleUpdate = () => fetchNotifs();
    window.addEventListener('notifications_updated', handleUpdate);
    return () => window.removeEventListener('notifications_updated', handleUpdate);
  }, [pathname]);

  const menuItems = [
    { name: "Tổng quan", path: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { name: "Giao dịch", path: "/transactions", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { name: "Ví & Tài khoản", path: "/wallets", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { name: "Ngân sách", path: "/budgets", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { name: "Danh mục", path: "/categories", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
    { name: "Báo cáo", path: "/reports", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { name: "Thông báo", path: "/notifications", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link href="/" className="text-xl font-black tracking-wider flex items-center gap-2 text-emerald-600">
            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-lg shadow-sm">M</span>
            MONETY
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                  isActive 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d={item.icon} />
                </svg>
                {item.name}
                {item.path === "/notifications" && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              U
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-700 truncate">Tài khoản</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="text-lg font-black text-emerald-600 flex items-center gap-2">
              <span className="bg-emerald-600 text-white px-2 rounded shadow-sm">M</span>
              MONETY
            </Link>
          </div>
        </header>

        {/* MOBILE OVERLAY & MENU */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <aside className="w-64 h-full bg-white flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                <span className="font-black text-emerald-600">MENU</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                {menuItems.map((item) => (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.name}
                  </Link>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* MAIN PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

// --- MAIN WRAPPER ---
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const authPaths = ["/login", "/register", "/forgot-password"];
  const isAuth = authPaths.includes(pathname);

  if (isAuth) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
