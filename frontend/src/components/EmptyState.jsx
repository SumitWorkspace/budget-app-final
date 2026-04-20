import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmptyState({ title, message, showButton = true }) {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center"
    >
      <div className="w-48 h-48 mb-6 opacity-80">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" className="fill-slate-100 dark:fill-slate-800" />
          <rect x="70" y="70" width="60" height="60" rx="12" className="fill-slate-200 dark:fill-slate-700" />
          <path d="M85 100H115M100 85V115" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-slate-400 dark:text-slate-500" />
          <circle cx="140" cy="60" r="15" className="fill-emerald-100 dark:fill-emerald-900/30" />
          <circle cx="140" cy="60" r="6" className="fill-emerald-500" />
          <path d="M40 140L60 120L75 135L100 110" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 opacity-50" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title || "No data found"}</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
        {message || "There is nothing to display here yet. Get started by adding some data!"}
      </p>
      
      {showButton && (
        <button
          onClick={() => navigate("/add")}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/20"
        >
          <PlusCircle size={20} />
          Add First Transaction
        </button>
      )}
    </motion.div>
  );
}
