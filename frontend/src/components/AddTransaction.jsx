import { useState, useEffect } from "react";
import { addTransaction, getTransactions } from "../api/transactions";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { ArrowLeft, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { detectAnomaly } from "../utils/smartEngine";

const categories = {
  income: ["Salary", "Freelance", "Investment", "Gift", "Other"],
  expense: ["Housing", "Food", "Transport", "Utilities", "Insurance", "Healthcare", "Saving", "Personal", "Entertainment", "Other"],
};

export default function AddTransaction() {
  const [type, setType] = useState("expense");
  const [form, setForm] = useState({
    amount: "",
    category: "",
    date: new Date().toISOString().split('T')[0],
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [autoCategorized, setAutoCategorized] = useState(false);

  const { currency } = useSettings();
  const navigate = useNavigate();

  // Keyword dictionary for smart auto-categorizer
  const keywordMap = {
    food: ['swiggy', 'zomato', 'mcdonald', 'kfc', 'starbucks', 'grocery', 'restaurant', 'pizza'],
    transport: ['uber', 'ola', 'petrol', 'gas', 'transit', 'flight', 'train', 'bus'],
    entertainment: ['netflix', 'spotify', 'movie', 'cinema', 'game', 'concert', 'club'],
    housing: ['rent', 'electricity', 'water', 'maintenance', 'furniture'],
    healthcare: ['pharmacy', 'doctor', 'hospital', 'medicine', 'clinic']
  };

  // Fetch history for anomaly detection
  useEffect(() => {
    getTransactions().then(res => setHistory(res.data)).catch(() => {});
  }, []);

  // Smart Categorizer
  useEffect(() => {
    if (!form.note || type !== "expense" || autoCategorized) return;
    
    const words = form.note.toLowerCase().split(' ');
    for (const [category, keywords] of Object.entries(keywordMap)) {
      if (words.some(word => keywords.includes(word))) {
        // Find the exact capitalized category name from our list
        const exactCat = categories.expense.find(c => c.toLowerCase() === category);
        if (exactCat && form.category !== exactCat) {
          setForm(prev => ({ ...prev, category: exactCat }));
          setAutoCategorized(true);
          toast("✨ Auto-categorized as " + exactCat, { icon: '✨', style: { background: '#059669', color: '#fff' } });
        }
        break;
      }
    }
  }, [form.note, type, autoCategorized]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) return;

    setLoading(true);
    try {
      // Anomaly Detection
      if (type === "expense") {
        const anomaly = detectAnomaly(history, Number(form.amount), form.category);
        if (anomaly) {
          toast(anomaly.message, { icon: '⚠️', duration: 6000, style: { background: '#d97706', color: '#fff' } });
        }
      }

      await addTransaction({
        title: form.note || form.category,
        amount: Number(form.amount),
        category: form.category,
        description: form.note || "No description",
        date: form.date,
        type,
        currency: currency,
      });

      toast.success("Transaction added!");
      navigate("/transactions");
    } catch {
      toast.error("Failed to add transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 transition-colors duration-200">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Entry</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Keep track of your finances</p>
          </div>

          <form onSubmit={handleAdd} className="p-6 md:p-8 space-y-6">
            {/* TYPE TOGGLE */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Transaction Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => { setType("expense"); setForm({ ...form, category: "" }); setAutoCategorized(false); }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                    type === "expense"
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 font-semibold shadow-sm"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <TrendingDown size={18} /> Expense
                </button>
                <button
                  type="button"
                  onClick={() => { setType("income"); setForm({ ...form, category: "" }); setAutoCategorized(false); }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                    type === "income"
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <TrendingUp size={18} /> Income
                </button>
              </div>
            </div>

            {/* AMOUNT & DATE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-medium">{currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "£"}</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 bg-transparent dark:text-white rounded-xl focus:ring-slate-900 dark:focus:ring-emerald-500 focus:border-slate-900 dark:focus:border-emerald-500 outline-none transition-colors text-lg font-medium"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-transparent dark:text-white rounded-xl focus:ring-slate-900 dark:focus:ring-emerald-500 focus:border-slate-900 dark:focus:border-emerald-500 outline-none transition-colors font-medium"
                />
              </div>
            </div>

            {/* CATEGORY */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories[type].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setForm({ ...form, category: c }); setAutoCategorized(true); }}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      form.category === c
                        ? "bg-slate-900 dark:bg-emerald-500 text-white border-slate-900 dark:border-emerald-500"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* NOTE */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Note (Optional)</label>
              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-transparent dark:text-white rounded-xl focus:ring-slate-900 dark:focus:ring-emerald-500 focus:border-slate-900 dark:focus:border-emerald-500 outline-none transition-colors"
                placeholder="What was this for?"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={loading || !form.amount || !form.category}
                className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-3.5 rounded-xl font-medium text-lg hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Save Transaction"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}