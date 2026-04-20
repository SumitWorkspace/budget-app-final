import { useNavigate } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { useTheme } from "../context/ThemeContext";
import { useSearch } from "../context/SearchContext";
import { Menu, Search, Bell, Sun, Moon } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const { searchQuery, setSearchQuery } = useSearch();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <header className="h-20 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 z-10 flex-shrink-0">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger */}
        <button className="md:hidden text-slate-400 hover:text-white" onClick={toggleMobileSidebar}>
          <Menu size={24} />
        </button>
        {/* Desktop Hamburger */}
        <button className="hidden md:block text-slate-400 hover:text-white" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        
        <div>
          <h2 className="text-lg font-bold text-white hidden sm:block">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h2>
          <p className="text-xs text-slate-500 hidden sm:block">Here's your financial overview</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#111] border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 w-64"
          />
        </div>
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-[#111] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all relative"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>
        <button className="w-10 h-10 rounded-full bg-[#111] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border border-[#0a0a0a]"></span>
        </button>
        <div 
          onClick={() => navigate("/profile")}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center text-white font-bold cursor-pointer shadow-lg shadow-emerald-500/20"
          title="Profile"
        >
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
