import { useNavigate } from "react-router-dom";
import { Edit, BarChart2 } from "lucide-react";

export default function ProfilePanel() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-500/20">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>

        <div>
          <p className="font-bold text-slate-900 dark:text-white text-lg">{user?.name || "User"}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 p-4 rounded-xl text-center hover:scale-[1.02] transition">
          <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">Active</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">Status</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 p-4 rounded-xl text-center hover:scale-[1.02] transition">
          <p className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">Pro</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">Plan</p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-6 space-y-3 text-sm">
        <button 
          onClick={() => navigate("/settings")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors font-medium border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          <Edit size={18} className="text-slate-400" /> Edit Profile
        </button>

        <button 
          onClick={() => navigate("/charts")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors font-medium border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          <BarChart2 size={18} className="text-slate-400" /> View Analytics
        </button>
      </div>

    </div>
  );
}