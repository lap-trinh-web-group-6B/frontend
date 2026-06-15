"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBudgets, getCategories, createBudget, updateBudget, deleteBudget, logout, getUserProfile } from "../../actions/auth";
import { formatCurrency } from "../../utils/format";

export default function BudgetsPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<string>("current_month");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPastIntervalsDropdownOpen, setIsPastIntervalsDropdownOpen] = useState(false);
  const [pastSearchStart, setPastSearchStart] = useState("");
  const [pastSearchEnd, setPastSearchEnd] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [newBudgetAmount, setNewBudgetAmount] = useState("");
  const [newBudgetCategory, setNewBudgetCategory] = useState("");
  const [newBudgetStartDate, setNewBudgetStartDate] = useState("");
  const [newBudgetEndDate, setNewBudgetEndDate] = useState("");
  
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Premium State
  const [profile, setProfile] = useState<any>(null);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await getUserProfile();
      if (res.success) {
        setProfile(res.data);
      }
    } catch (e) {}
  }

  async function fetchCategories() {
    const res = await getCategories({ limit: 500 });
    if (res.success) {
      setCategories(res.data?.items || res.data || []);
    }
  }

  async function fetchBudgets() {
    setLoading(true);
    setError(null);
    const res = await getBudgets();
    if (res.success) {
      setBudgets(res.data?.items || res.data || []);
    } else {
      const errMsg = res.error || "Không thể tải danh sách ngân sách.";
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

  function openAddModal() {
    const activeBudgetsCount = budgets.filter((b) => b.status === "ACTIVE").length;
    if (profile?.type === "FREE" && activeBudgetsCount >= 3) {
      setPromoMessage("Tài khoản Miễn phí (FREE) chỉ được tạo tối đa 3 ngân sách hoạt động cùng lúc. Hãy nâng cấp lên PREMIUM để không giới hạn ngân sách và tối ưu hóa quản lý tài chính!");
      setIsPromoOpen(true);
      return;
    }
    setEditingId(null);
    setNewBudgetAmount("");
    setNewBudgetCategory("");
    
    // Default dates (first and last day of current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    // adjust timezone offset to avoid being off by a day in yyyy-mm-dd
    firstDay.setMinutes(firstDay.getMinutes() - firstDay.getTimezoneOffset());
    lastDay.setMinutes(lastDay.getMinutes() - lastDay.getTimezoneOffset());
    
    setNewBudgetStartDate(firstDay.toISOString().split("T")[0]);
    setNewBudgetEndDate(lastDay.toISOString().split("T")[0]);
    
    setSearchTerm("");
    setIsDropdownOpen(false);
    setModalError(null);
    setIsModalOpen(true);
  }

  function openEditModal(budget: any) {
    setEditingId(budget.id);
    setNewBudgetAmount(budget.amount_limit?.toString() || budget.amount?.toString() || "");
    setNewBudgetCategory(budget.category_id?.toString() || budget.categoryId?.toString() || "");
    
    if (budget.start_date) {
      setNewBudgetStartDate(new Date(budget.start_date).toISOString().split("T")[0]);
    }
    if (budget.end_date) {
      setNewBudgetEndDate(new Date(budget.end_date).toISOString().split("T")[0]);
    }
    
    setSearchTerm("");
    setIsDropdownOpen(false);
    setModalError(null);
    setIsModalOpen(true);
  }

  function openDeleteModal(budget: any) {
    setDeletingBudget(budget);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  }

  async function confirmDeleteBudget() {
    if (!deletingBudget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteBudget(deletingBudget.id);
      if (res.success) {
        setBudgets(budgets.filter((b) => b.id !== deletingBudget.id));
        setIsDeleteModalOpen(false);
      } else {
        setDeleteError(res.error || "Không thể xóa ngân sách.");
      }
    } catch (err) {
      setDeleteError("Lỗi kết nối khi xóa ngân sách.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newBudgetAmount || !newBudgetCategory || !newBudgetStartDate || !newBudgetEndDate) {
      setModalError("Vui lòng nhập đủ thông tin ngân sách");
      return;
    }
    
    // Kiểm tra ngày kết thúc không được trước ngày hiện tại (múi giờ địa phương)
    const todayStr = new Date().toISOString().split("T")[0];
    if (newBudgetEndDate < todayStr) {
      setModalError("Ngày kết thúc không thể trước ngày hiện tại");
      return;
    }

    // Kiểm tra ngày bắt đầu không lớn hơn ngày kết thúc
    if (newBudgetStartDate > newBudgetEndDate) {
      setModalError("Ngày bắt đầu không thể sau ngày kết thúc");
      return;
    }
    
    setIsSubmitting(true);
    setModalError(null);
    
    const payload: any = {
      name: "Ngân sách " + new Date().getTime(), // Fallback for old schema
      amount: Number(newBudgetAmount) || 0,      // Fallback
      categoryId: newBudgetCategory ? Number(newBudgetCategory) : null, // Fallback
      amount_limit: Number(newBudgetAmount) || 0,
      start_date: new Date(newBudgetStartDate + "T00:00:00").toISOString(),
      end_date: new Date(newBudgetEndDate + "T23:59:59.999").toISOString(),
    };
    if (newBudgetCategory) {
      payload.category_id = Number(newBudgetCategory);
    }

    try {
      let res;
      if (editingId) {
        res = await updateBudget(editingId, payload);
      } else {
        res = await createBudget(payload);
      }
      
      if (res.success) {
        setIsModalOpen(false);
        fetchBudgets();
      } else {
        setModalError(res.error || (editingId ? "Không thể cập nhật ngân sách" : "Không thể tạo ngân sách mới"));
      }
    } catch (err: any) {
      if (err?.message === 'NEXT_REDIRECT' || (err?.digest && err.digest.startsWith('NEXT_REDIRECT'))) throw err;
      setModalError("Có lỗi xảy ra khi lưu");
    }
    setIsSubmitting(false);
  }

  // Trích xuất các khoảng thời gian duy nhất
  const getIntervalString = (b: any) => {
    if (!b.start_date || !b.end_date) return "";
    const start = new Date(b.start_date).toLocaleDateString("vi-VN");
    const end = new Date(b.end_date).toLocaleDateString("vi-VN");
    return `${start} - ${end}`;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Trích xuất chu kỳ dạng object và phân loại
  const intervalsData = Array.from(
    new Set(
      budgets
        .map((b) => {
          if (!b.start_date || !b.end_date) return null;
          return JSON.stringify({
            start_date: b.start_date,
            end_date: b.end_date,
            string: getIntervalString(b)
          });
        })
        .filter((item) => item !== null)
    )
  ).map(json => JSON.parse(json!));

  // Sắp xếp chu kỳ từ mới nhất đến cũ nhất
  intervalsData.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  // Phân loại chu kỳ
  const activeIntervals = intervalsData.filter(i => new Date(i.end_date) >= today).map(i => i.string);
  const pastIntervalsData = intervalsData.filter(i => new Date(i.end_date) < today);
  const pastIntervals = pastIntervalsData.map(i => i.string);

  // Lọc chu kỳ quá khứ theo ngày nhập vào (bị bao bởi ngày nhập vào)
  const searchedPastIntervals = pastIntervalsData.filter(i => {
    const start = new Date(i.start_date);
    const end = new Date(i.end_date);
    
    if (pastSearchStart) {
      const searchStart = new Date(pastSearchStart);
      searchStart.setHours(0, 0, 0, 0);
      if (start < searchStart) return false;
    }
    if (pastSearchEnd) {
      const searchEnd = new Date(pastSearchEnd);
      searchEnd.setHours(23, 59, 59, 999);
      if (end > searchEnd) return false;
    }
    return true;
  }).map(i => i.string);

  const filteredBudgets = budgets.filter((b) => {
    if (selectedInterval === "all") return true;
    if (selectedInterval === "current_month") {
      // Lọc các ngân sách có bất kỳ ngày nào trùng vào tháng hiện tại
      const start = new Date(b.start_date);
      const end = new Date(b.end_date);
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      return start <= endOfMonth && end >= startOfMonth;
    }
    return getIntervalString(b) === selectedInterval;
  });

  const totalLimit = filteredBudgets.reduce((acc, b) => acc + Number(b.amount_limit || b.amount || 0), 0);
  const totalSpent = filteredBudgets.reduce((acc, b) => acc + (b.current_spent ?? b.final_spent_amount ?? 0), 0);
  const totalRemaining = totalLimit - totalSpent;
  const overallPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý ngân sách</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-slate-500">Theo dõi và kiểm soát chi tiêu hàng tháng.</p>
            {profile?.type === "FREE" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Gói Free: {budgets.filter((b) => b.status === "ACTIVE").length}/3 hoạt động
              </span>
            )}
            {profile?.type === "PREMIUM" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                Premium ({budgets.filter((b) => b.status === "ACTIVE").length} hoạt động)
              </span>
            )}
          </div>
        </div>
        <button onClick={openAddModal} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-all text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm ngân sách
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Bộ lọc khoảng thời gian */}
      {budgets.length > 0 && (
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Khoảng thời gian chi tiêu</label>
          <div className="flex flex-wrap gap-2 pb-2 items-center">
            {/* Tab: Tháng này (Mặc định) */}
            <button
              onClick={() => setSelectedInterval("current_month")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                selectedInterval === "current_month"
                  ? "bg-slate-800 text-white shadow-md shadow-slate-100"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tháng này
            </button>

            {/* Tab: Tất cả */}
            <button
              onClick={() => setSelectedInterval("all")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                selectedInterval === "all"
                  ? "bg-slate-800 text-white shadow-md shadow-slate-100"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tất cả
            </button>

            {/* Tab: Các chu kỳ đang hoạt động */}
            {activeIntervals.map((interval) => (
              <button
                key={interval}
                onClick={() => setSelectedInterval(interval)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  selectedInterval === interval
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {interval}
              </button>
            ))}

            {/* Dropdown: Các chu kỳ lịch sử đã kết thúc */}
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setIsPastIntervalsDropdownOpen(!isPastIntervalsDropdownOpen)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 select-none ${
                  pastIntervals.includes(selectedInterval)
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>
                  {pastIntervals.includes(selectedInterval) ? selectedInterval : "Chu kỳ đã qua ▾"}
                </span>
                <svg className={`w-4 h-4 transition-transform ${isPastIntervalsDropdownOpen ? 'rotate-180' : ''} ${pastIntervals.includes(selectedInterval) ? 'text-white' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isPastIntervalsDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsPastIntervalsDropdownOpen(false)}
                  />
                  <div className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-40 p-3 space-y-3 animate-in fade-in duration-100">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Chu kỳ đã kết thúc
                      </span>
                    </div>

                    {pastIntervals.length > 0 && (
                      <div className="p-2 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Tìm theo khoảng:</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-400 font-semibold block mb-0.5">Từ ngày</label>
                            <input
                              type="date"
                              className="w-full p-1 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100"
                              value={pastSearchStart}
                              onChange={(e) => setPastSearchStart(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-400 font-semibold block mb-0.5">Đến ngày</label>
                            <input
                              type="date"
                              className="w-full p-1 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100"
                              value={pastSearchEnd}
                              onChange={(e) => setPastSearchEnd(e.target.value)}
                            />
                          </div>
                        </div>
                        {(pastSearchStart || pastSearchEnd) && (
                          <div className="text-right pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setPastSearchStart("");
                                setPastSearchEnd("");
                              }}
                              className="text-[10px] text-red-500 hover:text-red-600 font-medium underline"
                            >
                              Xóa bộ lọc ngày
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
                      {pastIntervals.length > 0 ? (
                        searchedPastIntervals.length > 0 ? (
                          searchedPastIntervals.map((interval) => (
                            <div
                              key={interval}
                              onClick={() => {
                                setSelectedInterval(interval);
                                setIsPastIntervalsDropdownOpen(false);
                              }}
                              className={`px-3 py-2 text-sm cursor-pointer rounded-lg transition-colors flex items-center justify-between ${
                                selectedInterval === interval
                                  ? "bg-emerald-50 text-emerald-700 font-medium"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span>{interval}</span>
                              {selectedInterval === interval && (
                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-xs text-slate-400 text-center">
                            Không có chu kỳ nào khớp với khoảng ngày
                          </div>
                        )
                      ) : (
                        <div className="p-3 text-xs text-slate-400 text-center">
                          Không có chu kỳ quá khứ nào
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Card cho chu kỳ được chọn */}
      {budgets.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Tổng quan chu kỳ: {
                  selectedInterval === "all" ? "Tất cả khoảng thời gian" : 
                  selectedInterval === "current_month" ? "Tháng này" : 
                  selectedInterval
                }
              </span>
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md">
                {filteredBudgets.length} ngân sách
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
              <div>
                <p className="text-slate-400 text-xs font-medium">Tổng hạn mức</p>
                <p className="text-base sm:text-xl font-bold mt-1 text-white">{formatCurrency(totalLimit)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-medium">Tổng chi tiêu</p>
                <p className="text-base sm:text-xl font-bold mt-1 text-emerald-400">{formatCurrency(totalSpent)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-medium">Còn lại</p>
                <p className={`text-base sm:text-xl font-bold mt-1 ${totalRemaining < 0 ? 'text-red-400' : 'text-white'}`}>
                  {formatCurrency(totalRemaining)}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    overallPercentage > 100 ? 'bg-red-500' :
                    overallPercentage > 85 ? 'bg-amber-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, overallPercentage)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Đã dùng {overallPercentage.toFixed(1)}% hạn mức</span>
                <span>{totalRemaining < 0 ? `Vượt hạn mức ${formatCurrency(Math.abs(totalRemaining))}` : `Còn ${formatCurrency(totalRemaining)}`}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Không tìm thấy ngân sách nào</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            Không có ngân sách nào hoạt động trong khoảng thời gian được chọn. Hãy tạo mới hoặc thay đổi bộ lọc.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBudgets.map((budget: any) => {
            const limit = budget.amount_limit || budget.amount || 0;
            const spent = budget.current_spent ?? budget.final_spent_amount ?? 0;
            const catName = budget.categoryName || budget.category_name || categories.find(c => String(c.id) === String(budget.category_id || budget.categoryId))?.name || budget.categories?.name || "Tất cả danh mục";
            
            // Xác định trạng thái của ngân sách
            const isCompleted = budget.status === "COMPLETED";
            const isExpired = !isCompleted && new Date(budget.end_date) < new Date();

            return (
              <div key={budget.id} className="p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow group relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      {catName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 pr-16">{catName}</h4>
                      <p className="text-xs text-slate-500">
                        {budget.start_date ? new Date(budget.start_date).toLocaleDateString("vi-VN") : ""} 
                        {budget.end_date ? ` - ${new Date(budget.end_date).toLocaleDateString("vi-VN")}` : ""}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div>
                      {isCompleted ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          Đã chốt
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200">
                          Đã hết hạn
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Đang hoạt động
                        </span>
                      )}
                    </div>

                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 bg-white/80 backdrop-blur px-1.5 py-0.5 rounded-lg border border-slate-100 shadow-sm">
                      {!isCompleted && (
                        <button 
                          onClick={() => openEditModal(budget)}
                          className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); openDeleteModal(budget); }}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Xóa"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mb-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Hạn mức</p>
                    <p className="font-bold text-slate-800 text-lg">{formatCurrency(limit)}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Đã tiêu</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(spent)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        (spent / limit) > 0.9 ? 'bg-red-500' : 
                        (spent / limit) > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (spent / limit) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{((spent / (limit || 1)) * 100).toFixed(1)}%</span>
                    <span>
                      {limit - spent < 0 
                        ? `Vượt: ${formatCurrency(Math.abs(limit - spent))}` 
                        : `Còn lại: ${formatCurrency(limit - spent)}`
                      }
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? "Chỉnh sửa ngân sách" : "Thêm ngân sách mới"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                  {modalError}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Số tiền giới hạn</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm pr-12"
                    value={newBudgetAmount}
                    onChange={(e) => setNewBudgetAmount(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                    VNĐ
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Danh mục áp dụng</label>
                
                {/* Custom Trigger Button */}
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/50 transition-all text-sm flex items-center justify-between"
                >
                  <span className={newBudgetCategory ? "text-slate-800 font-medium" : "text-slate-400"}>
                    {newBudgetCategory 
                      ? categories.find(c => String(c.id) === String(newBudgetCategory))?.name || "Chọn danh mục"
                      : "Chọn danh mục"
                    }
                  </span>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Dropdown Menu Popup */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 space-y-2 animate-in fade-in duration-100">
                    <input
                      type="text"
                      placeholder="Tìm kiếm danh mục..."
                      autoFocus
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 focus:bg-white outline-none text-xs transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {categories
                        .filter(c => c.type === 'EXPENSE' && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((cat: any) => (
                          <div
                            key={cat.id}
                            onClick={() => {
                              setNewBudgetCategory(cat.id.toString());
                              setIsDropdownOpen(false);
                              setSearchTerm("");
                            }}
                            className={`px-3 py-2 text-sm cursor-pointer rounded-lg transition-colors flex items-center justify-between ${
                              String(cat.id) === String(newBudgetCategory)
                                ? "bg-emerald-50 text-emerald-700 font-medium"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span>{cat.name}</span>
                            {String(cat.id) === String(newBudgetCategory) && (
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        ))
                      }
                      {categories.filter(c => c.type === 'EXPENSE' && c.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                        <div className="p-3 text-xs text-slate-400 text-center">
                          Không tìm thấy danh mục chi tiêu nào
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Ngày bắt đầu</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                    value={newBudgetStartDate}
                    onChange={(e) => setNewBudgetStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Ngày kết thúc</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                    value={newBudgetEndDate}
                    onChange={(e) => setNewBudgetEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : "Lưu ngân sách"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                Xóa ngân sách
              </h3>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {deleteError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 animate-in fade-in duration-200">
                  {deleteError}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800">
                <svg className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <span className="font-semibold block">Dừng theo dõi hạn mức!</span>
                  <span className="block mt-0.5 text-xs text-blue-700">
                    Hệ thống sẽ ngừng theo dõi hạn mức chi tiêu cho danh mục này. Dữ liệu các giao dịch thực tế vẫn được giữ nguyên.
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Danh mục áp dụng:</span>
                  <span className="font-semibold text-slate-800">
                    {deletingBudget.categoryName || deletingBudget.category_name || categories.find(c => String(c.id) === String(deletingBudget.category_id || deletingBudget.categoryId))?.name || deletingBudget.categories?.name || "Tất cả danh mục"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hạn mức giới hạn:</span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(deletingBudget.amount_limit || deletingBudget.amount || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian hiệu lực:</span>
                  <span className="font-semibold text-slate-800">
                    {deletingBudget.start_date ? new Date(deletingBudget.start_date).toLocaleDateString("vi-VN") : ""} 
                    {deletingBudget.end_date ? ` - ${new Date(deletingBudget.end_date).toLocaleDateString("vi-VN")}` : ""}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDeleteBudget}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : "Xác nhận xóa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Promotion Modal */}
      {isPromoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                Nâng cấp Premium
              </h3>
              <button 
                onClick={() => setIsPromoOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-slate-600 text-sm leading-relaxed text-center font-medium">
                {promoMessage}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPromoOpen(false)}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Để sau
                </button>
                <Link
                  href="/premium"
                  className="flex-1 px-4 py-3 text-sm font-bold text-center text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl transition-colors shadow-md shadow-amber-100 flex items-center justify-center"
                >
                  Nâng cấp ngay ✨
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
