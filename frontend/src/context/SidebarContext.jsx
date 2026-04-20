import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  // Desktop sidebar: expanded by default
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebarExpanded");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Mobile sidebar: hidden by default
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("sidebarExpanded", JSON.stringify(isExpanded));
  }, [isExpanded]);

  const toggleSidebar = () => setIsExpanded(prev => !prev);
  const toggleMobileSidebar = () => setIsMobileOpen(prev => !prev);
  const closeMobileSidebar = () => setIsMobileOpen(false);

  return (
    <SidebarContext.Provider 
      value={{ 
        isExpanded, 
        toggleSidebar, 
        isMobileOpen, 
        toggleMobileSidebar, 
        closeMobileSidebar 
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
