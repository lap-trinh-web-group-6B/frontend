"use client";

import React, { useState, useEffect } from "react";
import { getPaymentConfig, updatePaymentConfig } from "../../../actions/auth";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    premiumPrice: "2000",
    bankName: "VietinBank",
    bankBin: "970405",
    bankAccount: "3910205185595",
    bankOwnerName: "NGUYEN VAN A"
  });

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await getPaymentConfig();
        if (res.success && res.data) {
          setFormData({
            premiumPrice: String(res.data.premiumPrice || "2000"),
            bankName: res.data.bankName || "",
            bankBin: res.data.bankBin || "",
            bankAccount: res.data.bankAccount || "",
            bankOwnerName: res.data.bankOwnerName || ""
          });
        }
      } catch (e) {
        console.error("Failed to load config:", e);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Validate
      if (Number(formData.premiumPrice) < 1000) {
        throw new Error("Giá gói Premium không hợp lệ (tối thiểu 1000 VNĐ)");
      }
      if (!/^[0-9]{6}$/.test(formData.bankBin)) {
        throw new Error("Mã BIN ngân hàng phải gồm 6 chữ số");
      }

      const payload = {
        premium_price: formData.premiumPrice,
        bank_name: formData.bankName,
        bank_bin: formData.bankBin,
        bank_account: formData.bankAccount,
        bank_owner_name: formData.bankOwnerName.toUpperCase()
      };

      const res = await updatePaymentConfig(payload);
      if (res.success) {
        setMessage({ type: 'success', text: 'Đã cập nhật cấu hình hệ thống thành công!' });
        
        // Cập nhật lại form với dữ liệu mới (đã format)
        setFormData(prev => ({
          ...prev,
          bankOwnerName: formData.bankOwnerName.toUpperCase()
        }));
      } else {
        setMessage({ type: 'error', text: res.error || 'Lỗi khi lưu cấu hình' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ' });
    } finally {
      setSaving(false);
      
      // Auto-hide message
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Đang tải cấu hình...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Cấu hình Hệ thống</h2>
        <p className="text-sm text-slate-500 mt-1">Cấu hình giá bán gói Premium và thông tin tài khoản nhận thanh toán Webhook VietQR.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section: Gói Premium */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-amber-500 text-xl">✨</span> Cấu hình Gói Premium
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Đặt mức giá bán trọn đời của tài khoản Premium.</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="premiumPrice" className="block text-sm font-bold text-slate-700 mb-1">Giá bán gói PREMIUM (VNĐ)</label>
              <div className="relative rounded-md max-w-xs">
                <input 
                  type="number" 
                  name="premiumPrice" 
                  id="premiumPrice" 
                  required 
                  min="1000"
                  value={formData.premiumPrice}
                  onChange={handleChange}
                  className="border border-slate-300 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-bold text-amber-600 transition-all"
                  placeholder="Ví dụ: 2000" 
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 text-sm font-semibold">VND</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">Số tiền tối thiểu là 1,000 VNĐ. Giá trị này sẽ được hiển thị khi người dùng nâng cấp gói.</p>
            </div>
          </div>
        </div>

        {/* Section: Thông tin Thanh toán Webhook */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-emerald-500 text-xl">🏦</span> Thông tin tài khoản nhận tiền (VietQR Webhook)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Cấu hình tài khoản ngân hàng để tạo mã QR thanh toán tự động và đối soát với Webhook Sepay.</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ngân hàng */}
            <div>
              <label htmlFor="bankName" className="block text-sm font-bold text-slate-700 mb-1">Tên ngân hàng</label>
              <input 
                type="text" 
                name="bankName" 
                id="bankName" 
                required
                value={formData.bankName}
                onChange={handleChange}
                className="border border-slate-300 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 transition-all"
                placeholder="Ví dụ: MBBank, VietinBank" 
              />
              <p className="text-xs text-slate-400 mt-1">Tên hiển thị của ngân hàng trên màn hình thanh toán.</p>
            </div>

            {/* Mã BIN ngân hàng */}
            <div>
              <label htmlFor="bankBin" className="block text-sm font-bold text-slate-700 mb-1">Mã BIN ngân hàng</label>
              <input 
                type="text" 
                name="bankBin" 
                id="bankBin" 
                required 
                pattern="[0-9]{6}"
                value={formData.bankBin}
                onChange={handleChange}
                className="border border-slate-300 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-slate-800 transition-all"
                placeholder="Mã BIN 6 chữ số (Ví dụ: MBBank là 970422)" 
              />
              <p className="text-xs text-slate-400 mt-1">Mã BIN 6 chữ số của ngân hàng để hệ thống tự động tạo link ảnh VietQR.</p>
            </div>

            {/* Số tài khoản */}
            <div>
              <label htmlFor="bankAccount" className="block text-sm font-bold text-slate-700 mb-1">Số tài khoản ngân hàng</label>
              <input 
                type="text" 
                name="bankAccount" 
                id="bankAccount" 
                required
                value={formData.bankAccount}
                onChange={handleChange}
                className="border border-slate-300 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-800 transition-all"
                placeholder="Ví dụ: 0345388317" 
              />
              <p className="text-xs text-slate-400 mt-1">Số tài khoản nhận tiền chính xác để tạo mã QR.</p>
            </div>

            {/* Tên chủ tài khoản */}
            <div>
              <label htmlFor="bankOwnerName" className="block text-sm font-bold text-slate-700 mb-1">Tên chủ tài khoản (viết hoa không dấu)</label>
              <input 
                type="text" 
                name="bankOwnerName" 
                id="bankOwnerName" 
                required
                value={formData.bankOwnerName}
                onChange={handleChange}
                className="border border-slate-300 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase font-bold text-slate-800 transition-all"
                placeholder="Ví dụ: NGUYEN VAN A" 
              />
              <p className="text-xs text-slate-400 mt-1">Tên người thụ hưởng hiển thị trên màn hình thanh toán.</p>
            </div>
          </div>
        </div>

        {/* Cấu hình bảo mật Webhook (Chỉ đọc) */}
        <div className="bg-slate-50 rounded-3xl shadow-sm border border-slate-200 overflow-hidden opacity-80">
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <span className="text-purple-500 text-xl">🔒</span> Cấu hình bảo mật Webhook Sepay
            </h3>
            <div className="flex items-start gap-4 p-4 bg-purple-50/50 border border-purple-100 rounded-xl text-purple-800 text-sm">
              <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <p className="font-semibold mb-1">Khóa bảo mật (API Key) cho Webhook hiện được thiết lập trong biến môi trường của server.</p>
                <p className="opacity-90">Để thay đổi API Key xác thực cho Webhook, vui lòng truy cập trực tiếp vào file <code>.env</code> trên máy chủ và cập nhật biến <code>SEPAY_WEBHOOK_KEY</code>. Thao tác này nhằm đảm bảo an toàn tuyệt đối cho hệ thống tự động cộng Premium.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit & Trạng thái */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button 
            type="submit" 
            disabled={saving}
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-sm rounded-xl shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-slate-900/20 flex items-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            )}
            <span>Lưu cấu hình</span>
          </button>
        </div>
      </form>
    </div>
  );
}
