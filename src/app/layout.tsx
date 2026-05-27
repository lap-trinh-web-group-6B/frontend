import React from "react";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";

export const metadata = {
  title: "Monety - Quản lý chi tiêu",
  description: "Hệ thống quản lý tài chính cá nhân thông minh",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-slate-50 font-sans text-slate-900 antialiased min-h-screen">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}