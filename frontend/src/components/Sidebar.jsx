import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ArrowRightLeft, PieChart as PieChartIcon, 
  LineChart, Settings, LogOut, Wallet, Activity, X, CalendarDays, RefreshCw
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isExpanded, isMobileOpen, closeMobileSidebar } = useSidebar();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const navItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", path: "/transactions", icon: ArrowRightLeft },
    { name: "Budgets", path: "/budgets", icon: PieChartIcon },
    { name: "Goals", path: "/goals", icon: Wallet },
    { name: "Monthly Summary", path: "/summary", icon: CalendarDays },
    { name: "Subscriptions", path: "/subscriptions", icon: RefreshCw },
    { name: "Analytics", path: "/charts", icon: LineChart }
  ];

  // Desktop Sidebar Content
  const SidebarContent = () => (
    <>
      <div className={`flex items-center ${isExpanded ? 'px-6' : 'justify-center'} py-6 mb-4`}>
        <div className="flex items-center gap-3 text-emerald-400 cursor-pointer" onClick={() => navigate("/dashboard")}>
          <div className="bg-emerald-500/10 p-2 rounded-xl flex-shrink-0">
            <Activity size={24} />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xl font-bold tracking-tight text-white whitespace-nowrap overflow-hidden"
              >
                SmartBudget
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className={`space-y-2 flex-1 ${isExpanded ? 'px-6' : 'px-3'}`}>
        {navItems.map((item, i) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              title={!isExpanded ? item.name : ""}
              className={`w-full flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center'} py-3 rounded-xl text-sm font-medium transition-all relative ${
                isActive 
                  ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon size={isExpanded ? 18 : 20} className={isActive ? "text-white" : "text-slate-500"} />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      <div className={`mt-auto space-y-2 ${isExpanded ? 'px-6' : 'px-3'} pb-6`}>
        <button 
          onClick={() => navigate("/settings")} 
          title={!isExpanded ? "Settings" : ""}
          className={`w-full flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center'} py-3 rounded-xl text-sm font-medium transition-colors ${
            location.pathname.startsWith("/settings") 
              ? "bg-white/10 text-white" 
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Settings size={isExpanded ? 18 : 20} className={location.pathname.startsWith("/settings") ? "text-white" : "text-slate-500"} />
          <AnimatePresence>
            {isExpanded && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="whitespace-nowrap overflow-hidden">
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button 
          onClick={handleLogout} 
          title={!isExpanded ? "Sign Out" : ""}
          className={`w-full flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center'} py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors`}
        >
          <LogOut size={isExpanded ? 18 : 20} />
          <AnimatePresence>
            {isExpanded && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="whitespace-nowrap overflow-hidden">
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isExpanded ? 256 : 80 }}
        className="bg-[#111111] border-r border-white/5 hidden md:flex flex-col relative z-20 flex-shrink-0"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl z-50 flex flex-col p-6 md:hidden"
          >
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-2 text-emerald-400">
                <Activity size={24} /> <span className="text-xl font-bold text-white">SmartBudget</span>
              </div>
              <button onClick={closeMobileSidebar} className="text-slate-400 hover:text-white">
                <X size={28} />
              </button>
            </div>
            <nav className="space-y-4">
              {navItems.map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => { closeMobileSidebar(); navigate(item.path); }} 
                  className={`w-full flex items-center gap-4 text-lg font-medium transition-colors ${
                    location.pathname.startsWith(item.path) ? "text-white" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <item.icon size={24} className={location.pathname.startsWith(item.path) ? "text-emerald-400" : "text-emerald-500/50"} /> 
                  {item.name}
                </button>
              ))}
              <div className="pt-6 border-t border-white/10 space-y-4 mt-6">
                <button 
                  onClick={() => { closeMobileSidebar(); navigate("/settings"); }} 
                  className="w-full flex items-center gap-4 text-lg font-medium text-slate-300 hover:text-white"
                >
                  <Settings size={24} className="text-slate-500" /> Settings
                </button>
                <button 
                  onClick={() => { closeMobileSidebar(); handleLogout(); }} 
                  className="w-full flex items-center gap-4 text-lg font-medium text-rose-400 hover:text-rose-300"
                >
                  <LogOut size={24} /> Sign Out
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
