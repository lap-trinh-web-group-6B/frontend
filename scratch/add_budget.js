const fs = require('fs');
const path = 'src/app/budgets/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Imports
code = code.replace(
  'import { getBudgets } from "../../actions/auth";',
  'import { getBudgets, getCategories, createBudget } from "../../actions/auth";'
);

// 2. State & Hooks
const stateReplacement = `  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState("");
  const [newBudgetAmount, setNewBudgetAmount] = useState("");
  const [newBudgetCategory, setNewBudgetCategory] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const res = await getCategories({ limit: 100 });
    if (res.success) {
      setCategories(res.data?.items || res.data || []);
    }
  }`;

code = code.replace(
  /  const \[budgets, setBudgets\] = useState<any\[\]>\(\[\]\);[\s\S]*?\}, \[\]\);/m,
  stateReplacement
);

// 3. handleAddBudget function
const handleAddBudgetReplacement = `    setLoading(false);
  }

  async function handleAddBudget(e: React.FormEvent) {
    e.preventDefault();
    if (!newBudgetName.trim()) {
      setModalError("Vui lòng nhập tên ngân sách");
      return;
    }
    
    setIsSubmitting(true);
    setModalError(null);
    try {
      const res = await createBudget({
        name: newBudgetName,
        amount: Number(newBudgetAmount) || 0,
        categoryId: newBudgetCategory ? Number(newBudgetCategory) : null
      });
      
      if (res.success) {
        setIsAddModalOpen(false);
        setNewBudgetName("");
        setNewBudgetAmount("");
        setNewBudgetCategory("");
        fetchBudgets();
      } else {
        setModalError(res.error || "Không thể tạo ngân sách mới");
      }
    } catch (err: any) {
      if (err?.message === 'NEXT_REDIRECT' || (err?.digest && err.digest.startsWith('NEXT_REDIRECT'))) throw err;
      setModalError("Có lỗi xảy ra khi tạo ngân sách");
    }
    setIsSubmitting(false);
  }

  return (`;

code = code.replace(
  /    setLoading\(false\);\n  }\n\n  return \(/m,
  handleAddBudgetReplacement
);

// 4. Button onClick
code = code.replace(
  /<button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-all text-sm flex items-center gap-2">/m,
  '<button onClick={() => setIsAddModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-all text-sm flex items-center gap-2">'
);

// 5. Modal UI
const modalUI = `          </div>
        )}
      </div>

      {/* Add Budget Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Thêm ngân sách mới</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddBudget} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                  {modalError}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Tên ngân sách</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Chi tiêu ăn uống tháng này"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                  value={newBudgetName}
                  onChange={(e) => setNewBudgetName(e.target.value)}
                />
              </div>

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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Danh mục áp dụng (Tùy chọn)</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                  value={newBudgetCategory}
                  onChange={(e) => setNewBudgetCategory(e.target.value)}
                >
                  <option value="">-- Tất cả danh mục --</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
    </div>
  );
}`;

code = code.replace(
  /          <\/div>\n        \)\}\n      <\/div>\n    <\/div>\n  \);\n\}/m,
  modalUI
);

fs.writeFileSync(path, code, 'utf8');
console.log("Budgets page updated successfully");
