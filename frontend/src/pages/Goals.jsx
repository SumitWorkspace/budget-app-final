import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { addTransaction } from "../api/transactions";
import { useSettings } from "../context/SettingsContext";
import { ArrowLeft, Target, Plus, Trash2 } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import toast from "react-hot-toast";

export default function Goals() {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [addFundsGoal, setAddFundsGoal] = useState(null);
  const [form, setForm] = useState({ title: "", targetAmount: "", deadline: "" });
  const [fundsAmount, setFundsAmount] = useState("");
  
  const navigate = useNavigate();
  const { formatCurrency } = useSettings();

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/goals");
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await API.post("/api/goals", { ...form, targetAmount: Number(form.targetAmount) });
      setShowModal(false);
      setForm({ title: "", targetAmount: "", deadline: "" });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    try {
      await API.delete(`/api/goals/${id}`);
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    if (!addFundsGoal || !fundsAmount) return;
    
    try {
      const addedAmount = Number(fundsAmount);
      const newAmount = addFundsGoal.currentAmount + addedAmount;
      
      // 1. Update the Goal amount
      await API.put(`/api/goals/${addFundsGoal._id}`, { currentAmount: newAmount });
      
      // 2. Automatically create an Expense transaction to deduct from total balance
      await addTransaction({
        title: `Added to: ${addFundsGoal.title}`,
        amount: addedAmount,
        category: "Saving",
        description: "Automated savings contribution",
        date: new Date().toISOString().split('T')[0],
        type: "expense",
        currency: formatCurrency(0).replace(/[^a-zA-Z]/g, '') || "INR" // Fallback to ensure safety
      });

      // Check for Goal Celebration
      if (newAmount >= addFundsGoal.targetAmount && addFundsGoal.currentAmount < addFundsGoal.targetAmount) {
        setShowConfetti(true);
        toast("🎉 Goal Conquered! Incredible discipline!", { icon: '🏆', duration: 8000, style: { background: '#4f46e5', color: '#fff' } });
        setTimeout(() => setShowConfetti(false), 10000); // Stop confetti after 10s
      } else {
        toast.success("Funds added successfully!");
      }

      setAddFundsGoal(null);
      setFundsAmount("");
      fetchGoals();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add funds.");
    }
  };

  return (
    <div className="p-6 md:p-10 transition-colors duration-200">
      {showConfetti && <Confetti width={width} height={height} recycle={true} numberOfPieces={500} gravity={0.15} />}
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Target size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Savings Goals</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Track progress towards your dreams</p>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Add Goal
          </button>
        </div>

        {/* LIST */}
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading goals...</div>
        ) : goals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 mb-4">You haven't set any savings goals yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((g) => {
              const percentage = Math.min((g.currentAmount / g.targetAmount) * 100, 100).toFixed(1);
              const daysLeft = Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={g._id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative group">
                  <button onClick={() => handleDelete(g._id)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{g.title}</h3>
                  
                  <div className="flex justify-between items-start mb-4 pr-6">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Target: {new Date(g.deadline).toLocaleDateString()}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      daysLeft < 0 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 
                      daysLeft <= 7 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 
                      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : daysLeft === 0 ? "Due today" : `${daysLeft} days left`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(g.currentAmount)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">of {formatCurrency(g.targetAmount)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{percentage}%</span>
                      <button 
                        onClick={() => setAddFundsGoal(g)}
                        className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors font-medium"
                      >
                        + Add Funds
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                    <div className="bg-indigo-500 h-3 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create New Goal</h2>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Goal Title</label>
                <input required type="text" className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent dark:text-white outline-none focus:border-indigo-500" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Amount</label>
                <input required type="number" className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent dark:text-white outline-none focus:border-indigo-500" value={form.targetAmount} onChange={e => setForm({...form, targetAmount: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
                <input required type="date" className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent dark:text-white outline-none focus:border-indigo-500" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors">Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ADD FUNDS MODAL */}
      {addFundsGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-xl border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Add Funds to Goal</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{addFundsGoal.title}</p>
            <form onSubmit={handleAddFunds} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount to Add</label>
                <input required type="number" step="0.01" className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent dark:text-white outline-none focus:border-indigo-500" value={fundsAmount} onChange={e => setFundsAmount(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setAddFundsGoal(null); setFundsAmount(""); }} className="flex-1 py-3 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
