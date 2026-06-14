"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserProfile, updateUserName, updateAvatar, logout } from "../../actions/auth";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Edit name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    setError(null);
    const res = await getUserProfile();
    if (res.success) {
      setProfile(res.data);
      setNewName(res.data?.fullName || "");
    } else {
      const errMsg = res.error || "Không thể tải thông tin người dùng";
      setError(errMsg);
      if (errMsg.toLowerCase().includes("hết hạn")) {
        setTimeout(async () => {
          await logout();
          router.push("/login");
        }, 1500);
      }
    }
    setLoading(false);
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  // Handle name update
  async function handleSaveName() {
    if (!newName.trim()) return;
    setSavingName(true);
    setError(null);
    setSuccess(null);

    const res = await updateUserName(newName.trim());
    if (res.success) {
      setProfile((prev: any) => ({ ...prev, fullName: newName.trim() }));
      setIsEditingName(false);
      setSuccess("Cập nhật họ tên thành công!");
      window.dispatchEvent(new Event("profile_updated"));
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(res.error || "Cập nhật họ tên thất bại");
    }
    setSavingName(false);
  }

  // Handle avatar upload
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Dung lượng ảnh không vượt quá 5MB");
      return;
    }

    setUploadingAvatar(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await updateAvatar(formData);
    if (res.success) {
      // Refresh profile to get new avatar URL
      await fetchProfile();
      setSuccess("Cập nhật ảnh đại diện thành công!");
      window.dispatchEvent(new Event("profile_updated"));
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(res.error || "Cập nhật avatar thất bại");
    }
    setUploadingAvatar(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Account type badge
  function renderTypeBadge(type: string) {
    const isPremium = type === "PREMIUM";
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${isPremium
          ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-200"
          : "bg-slate-100 text-slate-600"
          }`}
      >
        {isPremium && (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {isPremium ? "Premium" : "Miễn phí"}
      </span>
    );
  }

  // Status badge
  function renderStatusBadge(status: string) {
    const colors: Record<string, string> = {
      ACTIVATE: "bg-emerald-50 text-emerald-700 border-emerald-200",
      DISABLE: "bg-red-50 text-red-600 border-red-200",
      CANCEL: "bg-slate-100 text-slate-500 border-slate-200",
    };
    const labels: Record<string, string> = {
      ACTIVATE: "Đang hoạt động",
      DISABLE: "Đã vô hiệu",
      CANCEL: "Đã hủy",
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colors[status] || colors.ACTIVATE
          }`}
      >
        {status === "ACTIVATE" && (
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        )}
        {labels[status] || status}
      </span>
    );
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-40 bg-slate-200 rounded-lg" />
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-slate-200" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-36 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-10 bg-slate-200 rounded-xl" />
          <div className="h-10 bg-slate-200 rounded-xl" />
          <div className="h-10 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Hồ sơ cá nhân</h2>
        <p className="text-sm text-slate-500 mt-1">Quản lý thông tin cá nhân và cài đặt tài khoản.</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-sm text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      {profile && (
        <>
          {/* Avatar Section */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-200 shadow-md bg-slate-100">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-2xl font-bold">
                    {(profile.fullName || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-wait"
              >
                {uploadingAvatar ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-800 truncate">{profile.fullName || "Chưa đặt tên"}</h3>
                {renderTypeBadge(profile.type)}
              </div>
              <p className="text-sm text-slate-500 mt-0.5 truncate">{profile.email}</p>
              <div className="mt-1.5">
                {renderStatusBadge(profile.status)}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Info Fields */}
          <div className="space-y-4">
            {/* Full Name (editable) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Họ và tên
              </label>
              {isEditingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") {
                        setIsEditingName(false);
                        setNewName(profile.fullName || "");
                      }
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName || !newName.trim()}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    {savingName ? "..." : "Lưu"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNewName(profile.fullName || "");
                    }}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-xl transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-sm text-slate-800">{profile.fullName || "—"}</span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                  >
                    Chỉnh sửa
                  </button>
                </div>
              )}
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Email
              </label>
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-sm text-slate-800">{profile.email || "—"}</span>
                <span className="text-xs text-slate-400">Không thể thay đổi</span>
              </div>
            </div>

            {/* Account Type (read-only) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Loại tài khoản
              </label>
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                {renderTypeBadge(profile.type)}
                {profile.type !== "PREMIUM" && (
                  <Link
                    href="/premium"
                    className="text-xs font-medium text-amber-600 hover:text-amber-700 hover:underline transition-colors"
                  >
                    Nâng cấp Premium ✨
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Action Links */}
          <div className="space-y-3">
            <Link
              href="/change-password"
              className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-700">Đổi mật khẩu</span>
              </div>
              <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-between w-full px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 text-red-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-red-600">Đăng xuất</span>
              </div>
              <svg className="w-4 h-4 text-red-300 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
