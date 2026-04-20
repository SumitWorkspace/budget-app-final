import { useEffect, useState } from "react";
import { getTransactions } from "../api/transactions";
import { detectSubscriptions } from "../utils/smartEngine";
import { useSettings } from "../context/SettingsContext";
import { RefreshCw, TrendingUp, Calendar, AlertCircle } from "lucide-react";

export default function Subscriptions() {
  const [data, setData] = useState({ subscriptions: [], totalMonthlyFixedCost: 0 });
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useSettings();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTransactions();
        const detected = detectSubscriptions(res.data);
        setData(detected);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const projectedYearly = data.totalMonthlyFixedCost * 12;

  return (
    <div className="p-6 md:p-10 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <RefreshCw size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Subscriptions</h1>
            <p className="text-slate-400 mt-1">Automated recurring expense detection</p>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111] border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertCircle size={80} />
            </div>
            <div className="relative z-10">
              <p className="text-slate-400 font-medium text-sm mb-2 uppercase tracking-wider">Monthly Fixed Burn</p>
              <h3 className="text-5xl font-bold text-white mb-2 tracking-tight">{formatCurrency(data.totalMonthlyFixedCost)}</h3>
              <p className="text-slate-500 text-sm">Automatically deducted each month</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-[#111] border border-purple-500/20 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-purple-400 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={80} />
            </div>
            <div className="relative z-10">
              <p className="text-purple-300/70 font-medium text-sm mb-2 uppercase tracking-wider">Projected Yearly Cost</p>
              <h3 className="text-5xl font-bold text-purple-100 mb-2 tracking-tight">{formatCurrency(projectedYearly)}</h3>
              <p className="text-purple-400/60 text-sm">Cancel unused subs to increase savings!</p>
            </div>
          </div>
        </div>

        {/* LIST */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Detected Subscriptions</h3>
          
          {loading ? (
            <div className="py-12 text-center text-slate-500">Scanning transactions...</div>
          ) : data.subscriptions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
              <RefreshCw size={32} className="mx-auto mb-3 opacity-20" />
              <p>No recurring subscriptions detected yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.subscriptions.map((sub, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-2xl hover:bg-white/10 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider bg-white/10 text-slate-300 px-2 py-1 rounded-md">
                      {sub.category}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1">{sub.title}</h4>
                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-2xl font-bold text-rose-400">{formatCurrency(sub.amount)}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Calendar size={12}/> Last paid: {sub.lastPaid.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
