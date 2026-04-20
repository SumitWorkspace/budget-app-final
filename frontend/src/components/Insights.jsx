import { useEffect, useState, useMemo } from "react";
import { getTransactions } from "../api/transactions";
import { getInsightsData } from "../api/transactions";
import { useSettings } from "../context/SettingsContext";
import { predictNextMonthSpend, generateBudgetSuggestions, computeSavingsRateTrend } from "../utils/smartEngine";
import {
  Lightbulb, TrendingUp, AlertCircle, Sparkles,
  TrendingDown, Brain, CheckCircle, Info
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function Insights() {
  const [backendData, setBackendData] = useState({
    highestCategory: "None",
    savingsRate: 0,
    message: "Loading insights...",
    breakdown: []
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useSettings();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsRes, txRes] = await Promise.all([
          getInsightsData(),
          getTransactions()
        ]);
        setBackendData(insightsRes.data);
        setTransactions(txRes.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Client-side smart analysis
  const { predictions, totalPredicted } = useMemo(() => predictNextMonthSpend(transactions), [transactions]);
  const suggestions = useMemo(() => generateBudgetSuggestions(transactions), [transactions]);
  const savingsTrend = useMemo(() => computeSavingsRateTrend(transactions), [transactions]);

  const getStatusColor = () => {
    if (backendData.message.includes("Warning")) return "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800";
    if (backendData.message.includes("Alert")) return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
  };

  const suggestionIcon = (type) => {
    if (type === "warning") return <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />;
    if (type === "success") return <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />;
    return <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />;
  };

  const suggestionBg = (type) => {
    if (type === "warning") return "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10";
    if (type === "success") return "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10";
    return "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10";
  };

  return (
    <div className="p-6 md:p-10 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Lightbulb size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Insights</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Smart analysis powered by your transaction history</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Generating insights...</div>
        ) : (
          <div className="space-y-8">

            {/* STATUS BANNER */}
            <div className={`p-5 rounded-2xl border flex items-start gap-4 ${getStatusColor()}`}>
              {backendData.message.includes("Warning") || backendData.message.includes("Alert")
                ? <AlertCircle className="shrink-0 mt-0.5" />
                : <Sparkles className="shrink-0 mt-0.5" />
              }
              <div>
                <h3 className="font-semibold mb-1">Financial Status</h3>
                <p className="text-sm">{backendData.message}</p>
              </div>
            </div>

            {/* TOP ROW — Savings Rate + Top Expense */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Savings Rate</p>
                <div className="flex items-end gap-2">
                  <h2 className="text-4xl font-bold text-slate-900 dark:text-white">{backendData.savingsRate}%</h2>
                  <TrendingUp className="text-emerald-500 mb-1" />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">of your total income is saved.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Top Expense</p>
                <h2 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mb-1">{backendData.highestCategory}</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">is draining most of your budget.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Predicted Next Month</p>
                <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{formatCurrency(totalPredicted)}</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">based on last 3 months' average.</p>
              </div>
            </div>

            {/* SAVINGS RATE TREND */}
            {savingsTrend.length > 1 && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp size={20} className="text-emerald-500" /> Savings Rate Trend (Last 6 Months)
                </h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={savingsTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} unit="%" />
                      <Tooltip
                        formatter={(val) => [`${val}%`, "Savings Rate"]}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #1e293b", backgroundColor: "#0f172a", color: "#fff" }}
                      />
                      <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} fill="url(#savingsGrad)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* BOTTOM ROW — Spending Prediction + Budget Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* SPENDING PREDICTION */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <Brain size={20} className="text-indigo-400" /> Spending Prediction
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Next month forecast per category (3-month avg)</p>
                {predictions.length === 0 ? (
                  <p className="text-sm text-slate-400">Not enough data to predict. Add more transactions.</p>
                ) : (
                  <div className="space-y-4">
                    {predictions.slice(0, 6).map((p, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{p.category}</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(p.predicted)}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((p.predicted / (predictions[0]?.predicted || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500">Predicted Total</span>
                      <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(totalPredicted)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* BUDGET SUGGESTIONS */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <Sparkles size={20} className="text-amber-400" /> Budget Suggestions
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Personalised tips based on this month vs. history</p>
                {suggestions.length === 0 ? (
                  <p className="text-sm text-slate-400">Keep logging transactions to unlock personalised suggestions!</p>
                ) : (
                  <div className="space-y-3">
                    {suggestions.map((s, i) => (
                      <div key={i} className={`p-4 rounded-xl border flex gap-3 ${suggestionBg(s.type)}`}>
                        {suggestionIcon(s.type)}
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {s.message.replace(/\*\*(.*?)\*\*/g, '$1')}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.tip}</p>
                          {s.current > 0 && (
                            <div className="flex gap-4 mt-2 text-xs">
                              <span className="text-slate-500">This month: <strong className="text-slate-700 dark:text-slate-200">{formatCurrency(s.current)}</strong></span>
                              <span className="text-slate-500">Avg: <strong className="text-slate-700 dark:text-slate-200">{formatCurrency(s.average)}</strong></span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SPENDING BREAKDOWN (existing backend data) */}
            {backendData.breakdown.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">All-Time Expense Breakdown</h3>
                <div className="space-y-4">
                  {backendData.breakdown.map((item, idx) => {
                    const totalExpense = backendData.breakdown.reduce((acc, curr) => acc + curr.total, 0);
                    const percentage = totalExpense > 0 ? ((item.total / totalExpense) * 100).toFixed(1) : 0;
                    const colors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-purple-500", "bg-blue-500", "bg-pink-500"];
                    return (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item._id}</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(item.total)} <span className="text-slate-400 font-normal">({percentage}%)</span></span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                          <div className={`${colors[idx % colors.length]} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}