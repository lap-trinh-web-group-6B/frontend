"use client";

import React, { useState, useEffect } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../actions/auth";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [name, setName] = useState("");
  const [type, setType] = useState("EXPENSE"); // EXPENSE or INCOME
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<any>(null);
  const [deleteMode, setDeleteMode] = useState<'delete_all' | 'merge'>('delete_all');
  const [targetCategoryId, setTargetCategoryId] = useState<number | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    setError(null);
    try {
      const res = await getCategories({ limit: 100 });
      if (res.success) {
        setCategories(res.data?.items || res.data || []);
      } else {
        setError(res.error || "Không thể tải danh mục.");
      }
    } catch (e: any) {
      if (e?.message === 'NEXT_REDIRECT' || (e?.digest && e.digest.startsWith('NEXT_REDIRECT'))) throw e;
      setError("Có lỗi xảy ra khi tải danh mục.");
    }
    setLoading(false);
  }

  function openAddModal() {
    setEditingId(null);
    setName("");
    setType("EXPENSE");
    setModalError(null);
    setIsModalOpen(true);
  }

  function openEditModal(cat: any) {
    setEditingId(cat.id);
    setName(cat.name || "");
    setType(cat.type || "EXPENSE");
    setModalError(null);
    setIsModalOpen(true);
  }

  function openDeleteModal(cat: any) {
    setDeletingCategory(cat);
    setDeleteMode('delete_all');
    setTargetCategoryId(undefined);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!deletingCategory) return;
    if (deleteMode === 'merge' && !targetCategoryId) {
      setDeleteError("Vui lòng chọn danh mục đích để gộp giao dịch.");
      return;
    }
    
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteCategory(deletingCategory.id, deleteMode, targetCategoryId);
      if (res.success) {
        setCategories(categories.filter((c) => c.id !== deletingCategory.id));
        setIsDeleteModalOpen(false);
      } else {
        setDeleteError(res.error || "Không thể xóa danh mục.");
      }
    } catch (err) {
      setDeleteError("Lỗi khi xóa danh mục.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setModalError("Vui lòng nhập tên danh mục");
      return;
    }
    
    setIsSubmitting(true);
    setModalError(null);

    try {
      let res;
      if (editingId) {
        res = await updateCategory(editingId, { name, type });
      } else {
        res = await createCategory(name, type);
      }
      
      if (res.success) {
        setIsModalOpen(false);
        fetchCategories();
      } else {
        setModalError(res.error || (editingId ? "Không thể cập nhật" : "Không thể tạo mới"));
      }
    } catch (err: any) {
      if (err?.message === 'NEXT_REDIRECT' || (err?.digest && err.digest.startsWith('NEXT_REDIRECT'))) throw err;
      setModalError("Có lỗi xảy ra khi lưu.");
    }
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Danh mục</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý các loại thu chi.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-all text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm danh mục
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="p-8 text-center text-slate-500 border border-slate-100 rounded-2xl bg-slate-50">
          Chưa có danh mục nào được tạo.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => {
            const isExpense = cat.type === 'EXPENSE';
            const color = isExpense ? 'text-red-500 bg-red-50' : 'text-emerald-500 bg-emerald-50';

            return (
              <div key={cat.id} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-200 transition-colors cursor-pointer group flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{cat.name}</h4>
                    <p className="text-xs text-slate-500 uppercase">{isExpense ? 'Khoản chi' : 'Khoản thu'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openDeleteModal(cat); }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Tên danh mục</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Ăn uống, Tiền lương..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Loại danh mục</label>
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setType('EXPENSE')}
                  >
                    Khoản chi
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setType('INCOME')}
                  >
                    Khoản thu
                  </button>
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
                  ) : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                Xóa danh mục: {deletingCategory.name}
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
              <p className="text-sm text-slate-500">
                Bạn đang thực hiện xóa danh mục tự tạo. Vui lòng chọn cách xử lý các giao dịch và ngân sách liên quan:
              </p>

              <div className="space-y-3">
                {/* Option 1: Delete All */}
                <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="deleteMode"
                    value="delete_all"
                    checked={deleteMode === 'delete_all'}
                    onChange={() => setDeleteMode('delete_all')}
                    className="mt-1 accent-emerald-600"
                  />
                  <div className="ml-2">
                    <span className="block text-sm font-semibold text-slate-700">Xóa vĩnh viễn danh mục</span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                      Xóa toàn bộ giao dịch thuộc danh mục này và hoàn lại tiền vào ví tương ứng. Xóa ngân sách liên quan.
                    </span>
                  </div>
                </label>

                {/* Option 2: Merge */}
                <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="deleteMode"
                    value="merge"
                    checked={deleteMode === 'merge'}
                    onChange={() => setDeleteMode('merge')}
                    className="mt-1 accent-emerald-600"
                  />
                  <div className="ml-2">
                    <span className="block text-sm font-semibold text-slate-700">Xóa và Gộp giao dịch</span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                      Giữ nguyên các giao dịch nhưng chuyển chúng sang một danh mục khác có cùng loại. Xóa ngân sách liên quan.
                    </span>
                  </div>
                </label>
              </div>

              {/* Target Category Select Dropdown */}
              {deleteMode === 'merge' && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Chọn danh mục đích để gộp vào
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition-all text-sm"
                    value={targetCategoryId || ""}
                    onChange={(e) => setTargetCategoryId(Number(e.target.value))}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories
                      .filter(c => c.id !== deletingCategory.id && c.type === deletingCategory.type)
                      .map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.user_id === null ? "Hệ thống" : "Tùy chỉnh"})
                        </option>
                      ))}
                  </select>
                </div>
              )}

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
                  disabled={isDeleting || (deleteMode === 'merge' && !targetCategoryId)}
                  onClick={confirmDelete}
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
    </div>
  );
}
