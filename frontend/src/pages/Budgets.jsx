import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useSettings } from "../context/SettingsContext";
import { ArrowLeft, PieChart, Plus, Trash2, AlertTriangle } from "lucide-react";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: "", limit: "", month: new Date().toISOString().slice(0, 7) }); // YYYY-MM
  
  const navigate = useNavigate();
  const { formatCurrency } = useSettings();

  const categories = ["Housing", "Food", "Transport", "Utilities", "Insurance", "Healthcare", "Personal", "Entertainment", "Other"];

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const month = new Date().toISOString().slice(0, 7);
      const res = await API.get(`/api/budgets?month=${month}`);
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleAddBudget = async (e) => {
    e.preventDefault();
    try {
      await API.post("/api/budgets", { ...form, limit: Number(form.limit) });
      setShowModal(false);
      setForm({ ...form, category: "", limit: "" });
      fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this budget?")) return;
    try {
      await API.delete(`/api/budgets/${id}`);
      fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 md:p-10 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <PieChart size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Category Budgets</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Keep your spending in check</p>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Add Budget
          </button>
        </div>

        {/* LIST */}
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 mb-4">You haven't set any budgets for this month.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map((b) => {
              const percentage = Math.min((b.spent / b.limit) * 100, 100).toFixed(1);
              const isOver = b.spent > b.limit;
              return (
                <div key={b._id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative group">
                  <button onClick={() => handleDelete(b._id)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{b.category}</h3>
                    {isOver && <AlertTriangle size={18} className="text-rose-500" />}
                  </div>
                  
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className={`text-2xl font-bold ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                        {formatCurrency(b.spent)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">of {formatCurrency(b.limit)} limit</p>
                    </div>
                    <span className={`text-sm font-semibold ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {percentage}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                    <div className={`h-3 rounded-full transition-all ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Set Category Budget</h2>
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select required className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:border-emerald-500" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monthly Limit</label>
                <input required type="number" className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent dark:text-white outline-none focus:border-emerald-500" value={form.limit} onChange={e => setForm({...form, limit: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors">Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
