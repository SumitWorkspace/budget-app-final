import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAppShortcuts } from "../hooks/useAppShortcuts";

export default function Layout() {
  useAppShortcuts();
  
  return (
    <div className="flex h-screen bg-[#0a0a0a] text-slate-200 overflow-hidden font-sans selection:bg-emerald-500/30">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Header />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto z-0 relative">
          {/* Global Background Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
