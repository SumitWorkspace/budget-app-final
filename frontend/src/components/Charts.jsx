import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getChartData, getInsightsData, getTransactions } from "../api/transactions";
import API from "../api/axios";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid
} from "recharts";
import { ArrowLeft, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";

export default function Charts() {
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chartRes, insightsRes, transactionsRes] = await Promise.all([
          getChartData(),
          getInsightsData(),
          getTransactions() // Use the correct function from api/transactions.js
        ]);
        
        setAllTransactions(transactionsRes.data || []);
        
        // Format Bar Chart Data from backend aggregation
        const monthlyData = chartRes.data;
        const formattedBarData = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        // Group by month
        const grouped = (monthlyData || []).reduce((acc, curr) => {
          const m = curr._id?.month;
          if (!m) return acc;
          if (!acc[m]) acc[m] = { month: monthNames[m - 1], income: 0, expense: 0 };
          if (curr._id.type === "income") acc[m].income += curr.total;
          else acc[m].expense += curr.total;
          return acc;
        }, {});
        
        setBarData(Object.values(grouped));

        // Format Pie Chart Data from insights breakdown
        const formattedPie = (insightsRes.data?.breakdown || []).map(b => ({
          name: b._id,
          value: b.total
        }));
        setPieData(formattedPie);

      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const PIE_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e"];

  return (
    <div className="p-6 md:p-10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER - Compact */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Financial Analytics</h1>
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`text-xs font-medium text-emerald-600 hover:underline ${!selectedCategory ? 'invisible' : ''}`}
          >
            Clear Selection
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading charts...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* EXPENSE BREAKDOWN PIE */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Expense Distribution</h3>
                {selectedCategory && (
                  <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full animate-pulse">
                    Filtering: {selectedCategory}
                  </span>
                )}
              </div>
              {pieData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-slate-400">No expense data available</div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={selectedCategory ? 60 : 80}
                        outerRadius={selectedCategory ? 90 : 110}
                        paddingAngle={4}
                        dataKey="value"
                        onClick={(data) => setSelectedCategory(data.name)}
                        className="cursor-pointer focus:outline-none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={PIE_COLORS[index % PIE_COLORS.length]} 
                            stroke="none"
                            style={{ 
                              filter: selectedCategory === entry.name ? 'drop-shadow(0 0 8px rgba(16,185,129,0.5))' : 'none',
                              opacity: selectedCategory && selectedCategory !== entry.name ? 0.3 : 1,
                              transition: 'all 0.3s ease'
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}`, 'Amount']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* INTERACTIVE CATEGORY DETAILS (Visible when a slice is clicked) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-[360px]">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                {selectedCategory ? `${selectedCategory} Details` : "Category Insights"}
              </h3>
              
              {!selectedCategory ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                    <PieChartIcon size={32} />
                  </div>
                  <p className="text-sm text-slate-500 max-w-[200px]">Click a slice on the chart to view specific category transactions.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {allTransactions
                    .filter(t => t.category === selectedCategory)
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(t => (
                      <div key={t._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">{t.title}</span>
                          <span className="text-[10px] text-slate-500">{new Date(t.date).toLocaleDateString()}</span>
                        </div>
                        <span className="text-sm font-bold text-rose-500">
                          -{t.amount}
                        </span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

            {/* CASHFLOW TREND LINE CHART */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Income vs Expense Trend</h3>
              {barData.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-slate-400">No trend data available</div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={4} dot={{ r: 5, strokeWidth: 2, fill: '#0a0a0a' }} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={4} dot={{ r: 5, strokeWidth: 2, fill: '#0a0a0a' }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}