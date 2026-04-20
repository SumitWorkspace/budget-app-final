import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings, CURRENCIES } from "../context/SettingsContext";
import { useTheme } from "../context/ThemeContext";
import API from "../api/axios";
import { Globe, Moon, Bell, Shield, LogOut, Search, ChevronDown, Check } from "lucide-react";

export default function SettingsPanel() {
  const navigate = useNavigate();
  const { currency, setCurrency } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setCurrencySearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCurrencyChange = async (newCurrency) => {
    setCurrency(newCurrency);
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.settings = { ...user.settings, currency: newCurrency };
        localStorage.setItem("user", JSON.stringify(user));
      }
      await API.put("/api/users/settings", { settings: { currency: newCurrency } });
    } catch (err) {
      console.log("Failed to save setting to backend", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter currencies based on search
  const filteredCurrencies = useMemo(() => {
    const q = currencySearch.toLowerCase();
    return CURRENCIES.filter(
      c => c.label.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [currencySearch]);

  // Group by region
  const grouped = useMemo(() => {
    const map = {};
    filteredCurrencies.forEach(c => {
      if (!map[c.region]) map[c.region] = [];
      map[c.region].push(c);
    });
    return map;
  }, [filteredCurrencies]);

  const selectedCurrency = CURRENCIES.find(c => c.code === currency);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Preferences</h2>
        
        <div className="space-y-6">
          {/* Currency Selection */}
          <div ref={dropdownRef} className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <Globe size={20} />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">Currency</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Currently: <span className="font-semibold">{selectedCurrency?.symbol} {selectedCurrency?.label}</span>
                </p>
              </div>
            </div>

            {/* Trigger button */}
            <button
              type="button"
              onClick={() => { setDropdownOpen(o => !o); setCurrencySearch(""); }}
              disabled={loading}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm rounded-xl outline-none hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors"
            >
              <span>{selectedCurrency?.symbol}  {selectedCurrency?.label} ({selectedCurrency?.code})</span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Custom dropdown panel */}
            {dropdownOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                {/* Search */}
                <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search currency..."
                      value={currencySearch}
                      onChange={e => setCurrencySearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-lg outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Scrollable list */}
                <div className="max-h-60 overflow-y-auto">
                  {Object.entries(grouped).map(([region, list]) => (
                    <div key={region}>
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 sticky top-0">
                        {region}
                      </div>
                      {list.map(c => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            handleCurrencyChange(c.code);
                            setDropdownOpen(false);
                            setCurrencySearch("");
                          }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                        >
                          <span>{c.symbol}  {c.label} <span className="text-slate-400">({c.code})</span></span>
                          {currency === c.code && <Check size={14} className="text-emerald-500 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  ))}
                  {filteredCurrencies.length === 0 && (
                    <p className="px-4 py-6 text-sm text-slate-400 text-center">No currencies match "{currencySearch}"</p>
                  )}
                </div>
              </div>
            )}
          </div>


          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                <Moon size={20} />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">Dark Mode</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Toggle dark theme</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-11 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${theme === 'dark' ? 'left-6' : 'left-1'}`}></div>
            </button>
          </div>

          {/* Notifications (placeholder) */}
          <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <Bell size={20} />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">Notifications</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage alerts (coming soon)</p>
              </div>
            </div>
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Account</h2>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Shield size={18} className="text-slate-400" />
            Privacy &amp; Security
          </button>
          <button
            onClick={() => { localStorage.clear(); navigate("/"); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
          >
            <LogOut size={18} className="text-rose-400" />
            Sign Out
          </button>
        </div>
      </div>

    </div>
  );
}