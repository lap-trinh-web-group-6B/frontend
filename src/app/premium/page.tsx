"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserProfile, checkoutPremium, simulatePayment, refreshAccessToken } from "../../actions/auth";

export default function PremiumPage() {
  const router = useRouter();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [isLocalDev, setIsLocalDev] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 1. Load User Profile on mount
  useEffect(() => {
    fetchProfile();
    // Check if running on localhost for simulator button
    if (typeof window !== "undefined") {
      setIsLocalDev(
        window.location.hostname === "localhost" || 
        window.location.hostname === "127.0.0.1"
      );
    }
  }, []);

  async function fetchProfile() {
    setLoadingProfile(true);
    const res = await getUserProfile();
    if (res.success) {
      setProfile(res.data);
      if (res.data.type === "PREMIUM") {
        setPaymentSuccess(true);
      }
    }
    setLoadingProfile(false);
  }

  // 2. Polling for Premium activation
  useEffect(() => {
    if (!checkoutData || paymentSuccess) return;

    const interval = setInterval(async () => {
      const res = await getUserProfile();
      if (res.success && res.data.type === "PREMIUM") {
        clearInterval(interval);
        
        // Force refresh access token cookie on client to update payload to PREMIUM status
        try {
          await refreshAccessToken();
        } catch (e) {
          console.error("Failed to refresh token cookie in polling:", e);
        }

        setProfile(res.data);
        setPaymentSuccess(true);
        
        // Auto redirect after 4 seconds
        setTimeout(() => {
          router.push("/profile");
        }, 4000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [checkoutData, paymentSuccess]);

  // 2.5 Intercept tab close, back button, and link navigation during checkout
  useEffect(() => {
    if (!checkoutData || paymentSuccess) return;

    // A. Intercept browser tab close / reload / close browser window
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Phiên giao dịch nâng cấp tài khoản của bạn sẽ bị hủy nếu bạn rời đi. Bạn có chắc chắn muốn thoát?";
      return e.returnValue;
    };

    // B. Intercept browser back / forward buttons (popstate)
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      const confirmCancel = window.confirm(
        "Phiên giao dịch nâng cấp tài khoản của bạn sẽ bị hủy nếu bạn rời đi. Bạn có chắc chắn muốn thoát?"
      );
      if (confirmCancel) {
        router.push("/profile");
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };

    // C. Intercept client-side routing links (desktop sidebar, notifications, etc.)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor) {
        const confirmCancel = window.confirm(
          "Phiên giao dịch nâng cấp tài khoản của bạn sẽ bị hủy nếu bạn rời đi. Bạn có chắc chắn muốn thoát?"
        );
        if (!confirmCancel) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleAnchorClick, true); // capture phase

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [checkoutData, paymentSuccess, router]);

  // 3. Initiate checkout process
  async function handleCheckout() {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res = await checkoutPremium();
      if (res.success) {
        setCheckoutData(res.data);
      } else {
        setCheckoutError(res.error || "Không thể tạo đơn hàng thanh toán.");
      }
    } catch (err) {
      setCheckoutError("Lỗi kết nối khi tạo đơn hàng.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  // 4. Simulate payment (dev-only)
  async function handleSimulatePayment() {
    if (!checkoutData?.order?.orderCode) return;
    setSimulating(true);
    setSimMessage(null);
    try {
      const res = await simulatePayment(checkoutData.order.orderCode);
      if (res.success) {
        setSimMessage("⚡ Đã gửi webhook giả lập thành công! Đang đợi hệ thống kích hoạt...");
      } else {
        setSimMessage(`❌ Lỗi: ${res.error}`);
      }
    } catch (err) {
      setSimMessage("❌ Lỗi kết nối khi giả lập.");
    } finally {
      setSimulating(false);
    }
  }

  // Helper function to copy text to clipboard
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleBackClick = () => {
    if (checkoutData && !paymentSuccess) {
      const confirmCancel = window.confirm(
        "Phiên giao dịch nâng cấp tài khoản của bạn sẽ bị hủy nếu bạn rời đi. Bạn có chắc chắn muốn thoát?"
      );
      if (!confirmCancel) return;
    }
    router.push("/profile");
  };

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBackClick}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Nâng cấp tài khoản</h2>
          <p className="text-sm text-slate-500 mt-1">Trải nghiệm những đặc quyền cao cấp cùng Monety</p>
        </div>
      </div>

      {paymentSuccess ? (
        /* SUCCESS SCREEN */
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-8 text-center space-y-6 shadow-md relative overflow-hidden animate-fade-in">
          {/* Decorative Background Glow */}
          <div className="absolute -right-20 -top-20 w-48 h-48 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg shadow-amber-200 animate-bounce">
            ✨
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-2xl font-extrabold text-amber-800">Chúc mừng bạn!</h3>
            <p className="text-slate-700 font-medium">Tài khoản của bạn đã được nâng cấp lên hạng <span className="text-amber-600 font-bold">PREMIUM</span> thành công.</p>
            <p className="text-xs text-slate-500 pt-2">Hệ thống đang hoàn tất cài đặt. Bạn sẽ được tự động đưa về trang cá nhân sau vài giây...</p>
          </div>

          <div className="pt-4">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md shadow-amber-200 transition-all"
            >
              Về trang cá nhân
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        /* NORMAL CHECKOUT PAGE */
        <div className="space-y-8">
          {/* Features Comparison Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="text-amber-500 text-xl">💎</span> Đặc quyền nâng cấp Premium
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Ví không giới hạn</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Tạo bao nhiêu nguồn tiền tùy thích thay vì bị giới hạn chỉ 2 ví ở gói Miễn phí.</p>
                </div>
                <div className="text-amber-600 font-semibold text-xs mt-3 flex items-center gap-1">
                  Gói Free: Tối đa 2 ví
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Ngân sách không giới hạn</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Lập kế hoạch hạn mức chi tiêu cho mọi mục tiêu mà không bị khóa ở mốc 3 ngân sách.</p>
                </div>
                <div className="text-amber-600 font-semibold text-xs mt-3 flex items-center gap-1">
                  Gói Free: Tối đa 3 ngân sách
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Quét hóa đơn bằng AI</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Chụp hình hóa đơn và để công nghệ AI tự động nhận diện số tiền, ngày tháng, ghi chú.</p>
                </div>
                <div className="text-amber-600 font-semibold text-xs mt-3 flex items-center gap-1">
                  Gói Free: Khóa tính năng
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Phí dịch vụ trọn đời</p>
                <p className="text-2xl font-black text-amber-600 mt-0.5">2.000 VNĐ <span className="text-xs font-medium text-slate-500 line-through">99.000 VNĐ</span></p>
              </div>
              
              {!checkoutData && (
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-amber-200 transition-all flex items-center gap-2"
                >
                  {checkoutLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Nâng cấp Premium ngay"
                  )}
                </button>
              )}
            </div>
          </div>

          {checkoutError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium">
              {checkoutError}
            </div>
          )}

          {checkoutData && (
            /* PAYMENT QR AREA */
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
              <div className="text-center max-w-md mx-auto space-y-2">
                <h4 className="font-bold text-slate-800 text-base">Quét mã VietQR để thanh toán</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Sử dụng ứng dụng Mobile Banking của bất kỳ ngân hàng nào để quét mã QR bên dưới.</p>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-8 bg-slate-50 border border-slate-100 rounded-2xl p-6">
                {/* QR Image */}
                <div className="relative bg-white p-3 rounded-2xl shadow-sm border border-slate-200 w-52 h-52 flex items-center justify-center">
                  <img
                    src={checkoutData.qrUrl}
                    alt="VietQR Payment Code"
                    className="w-48 h-48 object-contain"
                  />
                  {/* Glowing border effect */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-amber-500/20 animate-pulse pointer-events-none" />
                </div>

                {/* Account Details & Manual Copy */}
                <div className="flex-1 w-full space-y-3.5">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    {/* Bank Info */}
                    <div className="flex justify-between items-center py-2 border-b border-slate-200">
                      <span className="text-slate-500 text-xs font-semibold uppercase">Ngân hàng</span>
                      <span className="font-bold text-slate-800 text-right">MBBank (Ngân hàng Quân Đội)</span>
                    </div>

                    {/* Account Number */}
                    <div className="flex justify-between items-center py-2 border-b border-slate-200">
                      <span className="text-slate-500 text-xs font-semibold uppercase">Số tài khoản</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">0345388317</span>
                        <button
                          onClick={() => handleCopy("0345388317", "account")}
                          className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors"
                          title="Sao chép số tài khoản"
                        >
                          {copiedField === "account" ? (
                            <span className="text-emerald-600 text-xs font-bold">✓</span>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex justify-between items-center py-2 border-b border-slate-200">
                      <span className="text-slate-500 text-xs font-semibold uppercase">Số tiền</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-600">2.000 VNĐ</span>
                        <button
                          onClick={() => handleCopy("2000", "amount")}
                          className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors"
                          title="Sao chép số tiền"
                        >
                          {copiedField === "amount" ? (
                            <span className="text-emerald-600 text-xs font-bold">✓</span>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Syntax Content */}
                    <div className="flex justify-between items-center py-2 border-b border-slate-200">
                      <span className="text-slate-500 text-xs font-semibold uppercase">Nội dung CK</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200 text-sm">
                          {checkoutData.transferContent}
                        </span>
                        <button
                          onClick={() => handleCopy(checkoutData.transferContent, "content")}
                          className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors"
                          title="Sao chép nội dung chuyển khoản"
                        >
                          {copiedField === "content" ? (
                            <span className="text-emerald-600 text-xs font-bold">✓</span>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Waiting status indicator */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider animate-pulse">
                  Hệ thống đang kiểm tra giao dịch chuyển khoản của bạn...
                </span>
              </div>
            </div>
          )}

          {/* LOCAL DEV SIMULATOR BUTTON (ONLY RENDER ON LOCALHOST) */}
          {isLocalDev && checkoutData && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-purple-800">
                <span className="text-xl">🛠️</span>
                <span className="font-bold text-sm uppercase tracking-wider">Môi trường phát triển - Lập trình viên</span>
              </div>
              <p className="text-xs text-slate-600">
                Khi chạy thử ở localhost, webhook từ cổng thanh toán thực tế không thể gọi về máy tính của bạn. Bạn có thể nhấn nút dưới đây để giả lập sự kiện thanh toán thành công chuyển từ ngân hàng về Sepay.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
                <button
                  onClick={handleSimulatePayment}
                  disabled={simulating}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-200 transition-all flex items-center gap-2"
                >
                  {simulating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Giả lập Thanh toán thành công ⚡"
                  )}
                </button>
                {simMessage && (
                  <span className="text-xs font-semibold text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                    {simMessage}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
