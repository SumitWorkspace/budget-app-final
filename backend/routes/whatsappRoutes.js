import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { getTransactions, getStats } from "../api/transactions";
import API from "../api/axios";
import { useSettings } from "../context/SettingsContext";
import { useSearch } from "../context/SearchContext";
import { PlusCircle, TrendingUp, TrendingDown, Wallet, Activity, CalendarClock, HeartPulse } from "lucide-react";
import { computeWeeklyDigest, computeHealthScore } from "../utils/smartEngine";
import { io } from "socket.io-client";

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

  // ✅ useRef to prevent multiple socket connections
  const socketRef = useRef(null);

  // =========================
  // 🔥 INITIAL DATA FETCH
  // =========================
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

  // =========================
  // 🔥 SOCKET CONNECTION
  // =========================
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?._id) return;

    // create socket once
    socketRef.current = io(import.meta.env.VITE_API_URL);

    // 🔥 JOIN USER ROOM
    socketRef.current.emit("join", user._id);

    // 🔥 LISTEN FOR NEW TRANSACTIONS
    socketRef.current.on("newTransaction", (data) => {
      console.log("🔥 Live transaction:", data);

      // Add new transaction on top
      setTransactions((prev) => [
        {
          _id: Date.now(), // temporary id
          title: data.category,
          category: data.category,
          amount: data.amount,
          type: data.type,
          date: new Date()
        },
        ...prev
      ]);
    });

    // cleanup
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // =========================
  // UI
  // =========================
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/add")}
          className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
        >
          <PlusCircle size={18} /> Add Record
        </motion.button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-[#111] p-6 rounded-3xl">
          <p className="text-slate-400 text-sm mb-2">Total Balance</p>
          <h3 className="text-3xl text-white">{formatCurrency(stats.totalBalance)}</h3>
        </div>

        <div className="bg-[#111] p-6 rounded-3xl">
          <p className="text-slate-400 text-sm">Income</p>
          <h3 className="text-2xl text-emerald-400">{formatCurrency(stats.totalIncome)}</h3>
        </div>

        <div className="bg-[#111] p-6 rounded-3xl">
          <p className="text-slate-400 text-sm">Expenses</p>
          <h3 className="text-2xl text-rose-400">{formatCurrency(stats.totalExpenses)}</h3>
        </div>

        {weeklyDigest && (
          <div className="bg-[#111] p-6 rounded-3xl">
            <p className="text-slate-400 text-sm">7-Day Spend</p>
            <h3 className="text-2xl text-white">{formatCurrency(weeklyDigest.currentWeekSpend)}</h3>
          </div>
        )}
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="bg-[#111] p-6 rounded-3xl">
        <h3 className="text-white mb-4">Recent Activity</h3>

        <div className="space-y-3">
          {transactions
            .filter(
              (t) =>
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.category.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((t) => (
              <div key={t._id} className="flex justify-between">
                <span className="text-white">{t.title}</span>
                <span className={t.type === "income" ? "text-emerald-400" : "text-white"}>
                  {t.type === "income" ? "+" : "-"}
                  {formatCurrency(t.amount)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}