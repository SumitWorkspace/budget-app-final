import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getTransactions, getStats } from "../api/transactions";
import API from "../api/axios";
import { useSettings } from "../context/SettingsContext";
import { useSearch } from "../context/SearchContext";
import { PlusCircle, TrendingUp, TrendingDown, Wallet, Activity, CalendarClock, HeartPulse } from "lucide-react";
import { computeWeeklyDigest, computeHealthScore } from "../utils/smartEngine";

export default function Dashboard() {
  const navigate = useNavigate();
  const { formatCurrency } = useSettings();
  const { searchQuery } = useSearch();

  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    prediction: { dailyAverage: 0, estimatedDaysRemaining: 0, status: "Stable" }
  });
  const [weeklyDigest, setWeeklyDigest] = useState(null);
  const [healthScore, setHealthScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, statsRes, goalsRes] = await Promise.all([ 
          getTransactions(), 
          getStats(),
          API.get("/api/goals").catch(() => ({ data: [] }))
        ]);
        setTransactions(txRes.data.slice(0, 4));
        setStats(statsRes.data);
        setWeeklyDigest(computeWeeklyDigest(txRes.data));
        setHealthScore(computeHealthScore(txRes.data, goalsRes.data));
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Quick Actions Row */}
      <div className="flex justify-between items-end">
        <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/add")}
          className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2"
        >
          <PlusCircle size={18} /> Add Record
        </motion.button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[#111] border border-white/5 p-6 rounded-3xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 font-medium text-sm mb-2">Total Balance</p>
            <h3 className="text-4xl font-bold text-white mb-4 tracking-tight">{formatCurrency(stats.totalBalance)}</h3>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
              <TrendingUp size={14} /> Stable
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-[#111] border border-white/5 p-6 rounded-3xl"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-400 font-medium text-sm">Income</p>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400"><TrendingUp size={18} /></div>
          </div>
          <h3 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(stats.totalIncome)}</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-[#111] border border-white/5 p-6 rounded-3xl"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-400 font-medium text-sm">Expenses</p>
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400"><TrendingDown size={18} /></div>
          </div>
          <h3 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(stats.totalExpenses)}</h3>
        </motion.div>

        {weeklyDigest && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-[#111] border border-white/5 p-6 rounded-3xl"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 font-medium text-sm">7-Day Spend</p>
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><CalendarClock size={18} /></div>
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight mb-2">{formatCurrency(weeklyDigest.currentWeekSpend)}</h3>
            <div className={`flex items-center gap-2 text-xs w-fit px-2 py-1 rounded-md ${weeklyDigest.isGood ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
              {weeklyDigest.trend === "up" ? <TrendingUp size={14} /> : weeklyDigest.trend === "down" ? <TrendingDown size={14} /> : null}
              {weeklyDigest.trend === "stable" ? "Same as last week" : `${weeklyDigest.percentageChange}% ${weeklyDigest.trend} vs last week`}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-[#111] border border-white/5 rounded-3xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <button onClick={() => navigate("/transactions")} className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">View All</button>
          </div>
          
          <div className="space-y-4">
            {transactions.filter(t => 
              t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              t.category.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 ? (
              <p className="text-slate-500 text-sm py-4">No matching transactions found.</p>
            ) : (
              transactions
                .filter(t => 
                  t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  t.category.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((t) => (
                <div key={t._id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      t.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {t.type === "income" ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{t.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`text-right font-bold ${t.type === "income" ? "text-emerald-400" : "text-white"}`}>
                    {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Smart Insights Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-gradient-to-b from-indigo-500/10 to-[#111] border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none" />
          
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Activity size={20} className="text-indigo-400" /> AI Analysis
          </h3>
          
          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Health Score</p>
                <div className="flex items-end gap-2">
                  <p className={`text-4xl font-bold ${healthScore >= 80 ? 'text-emerald-400' : healthScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {healthScore}
                  </p>
                  <p className="text-slate-500 mb-1">/ 100</p>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/5" />
                  <circle 
                    cx="32" cy="32" r="28" 
                    stroke="currentColor" strokeWidth="4" fill="none" 
                    strokeDasharray="175" strokeDashoffset={175 - (175 * healthScore) / 100}
                    className={`transition-all duration-1000 ${healthScore >= 80 ? 'text-emerald-400' : healthScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`} 
                  />
                </svg>
                <HeartPulse size={20} className={healthScore >= 80 ? 'text-emerald-400' : healthScore >= 50 ? 'text-amber-400' : 'text-rose-400'} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-2xl">
                <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold mb-1">Avg Daily Spend</p>
                <p className="text-lg font-bold text-white">{formatCurrency(stats.prediction.dailyAverage)}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl">
                <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold mb-1">Runway</p>
                <p className="text-lg font-bold text-white">{stats.prediction.estimatedDaysRemaining} <span className="text-xs text-slate-500 font-normal">days left</span></p>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-white/5">
              <p className="text-sm leading-relaxed text-indigo-200/80">
                Your financial health is currently <span className="text-white font-bold">{healthScore >= 80 ? 'Excellent' : healthScore >= 50 ? 'Fair' : 'Needs Work'}</span>. 
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}