import { useState, useEffect, useMemo } from "react";
import { getTransactions } from "../api/transactions";
import { useSettings } from "../context/SettingsContext";
import { Calendar, TrendingUp, TrendingDown, Wallet, CalendarDays, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function MonthlySummary() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Default to current month/year
  const currentDate = new Date();
  const defaultMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonthYear, setSelectedMonthYear] = useState(defaultMonthYear);

  const { formatCurrency } = useSettings();

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await getTransactions();
        setTransactions(res.data);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, []);

  // Compute available months for the dropdown (from oldest transaction to newest)
  const availableMonths = useMemo(() => {
    const months = new Set();
    // Always include current month even if no transactions
    months.add(defaultMonthYear);
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(key);
    });

    return Array.from(months).sort().reverse(); // Newest first
  }, [transactions, defaultMonthYear]);

  // Format month key to human readable (e.g. "2026-04" -> "April 2026")
  const formatMonthLabel = (key) => {
    const [year, month] = key.split("-");
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Filter transactions for the selected month
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return key === selectedMonthYear;
    });
  }, [transactions, selectedMonthYear]);

  // Compute stats for selected month
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    const categoryTotals = {};

    currentMonthTransactions.forEach(t => {
      if (t.type === "income") {
        income += t.amount;
      } else {
        expense += t.amount;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });

    const netSavings = income - expense;
    const savingsRate = income > 0 ? ((netSavings / income) * 100).toFixed(1) : 0;
    
    let topCategory = "None";
    let maxExpense = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > maxExpense) {
        maxExpense = amt;
        topCategory = cat;
      }
    });

    return { income, expense, netSavings, savingsRate, topCategory, maxExpense };
  }, [currentMonthTransactions]);

  return (
    <div className="p-6 md:p-10 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER & CONTROLS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-lg">
              <CalendarDays size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Monthly Summary</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your financial statement</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl shadow-sm">
            <Calendar size={18} className="text-slate-400 ml-2" />
            <select
              value={selectedMonthYear}
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 font-medium text-sm outline-none cursor-pointer pr-4 py-1"
            >
              {availableMonths.map(m => (
                <option key={m} value={m} className="bg-white dark:bg-slate-900">
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Generating report...</div>
        ) : (
          <>
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-5 group-hover:opacity-10 transition-opacity"><Wallet size={80} /></div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Net Savings</p>
                <h3 className={`text-3xl font-bold tracking-tight mb-2 ${stats.netSavings >= 0 ? "text-slate-900 dark:text-white" : "text-rose-600 dark:text-rose-400"}`}>
                  {formatCurrency(stats.netSavings)}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${stats.netSavings >= 0 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"}`}>
                    {stats.savingsRate}% Saved
                  </span>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Income</p>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-500"><TrendingUp size={18} /></div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.income)}</h3>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Expenses</p>
                  <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-500"><TrendingDown size={18} /></div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.expense)}</h3>
                {stats.maxExpense > 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Highest: <span className="font-semibold">{stats.topCategory}</span> ({formatCurrency(stats.maxExpense)})
                  </p>
                )}
              </motion.div>
            </div>

            {/* MONTHLY LEDGER */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Transaction Ledger</h3>
                <span className="text-sm font-medium text-slate-500 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  {currentMonthTransactions.length} items
                </span>
              </div>
              
              {currentMonthTransactions.length === 0 ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                  <p>No activity recorded in {formatMonthLabel(selectedMonthYear)}.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                  {currentMonthTransactions.map(t => (
                    <div key={t._id} className="p-4 md:p-6 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          t.type === "income" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                        }`}>
                          {t.type === "income" ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{t.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`font-bold text-right ${t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                        {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
