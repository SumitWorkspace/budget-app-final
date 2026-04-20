import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getTransactions, deleteTransaction } from "../api/transactions";
import { useSettings } from "../context/SettingsContext";
import { useSearch } from "../context/SearchContext";
import { ArrowLeft, Search, Filter, Trash2, TrendingDown, TrendingUp, Download, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import EmptyState from "./EmptyState";

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const { searchQuery: search, setSearchQuery: setSearch } = useSearch();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { formatCurrency } = useSettings();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTransactions();
      setTransactions(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await deleteTransaction(id);
      toast.success("Transaction deleted successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete transaction.");
    }
  };

  const filteredList = transactions.filter(t => {
    const matchesFilter = filter === "all" || t.type === filter;
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.category.toLowerCase().includes(search.toLowerCase());
    
    let matchesDate = true;
    if (startDate && endDate) {
      const txDate = new Date(t.date);
      matchesDate = txDate >= new Date(startDate) && txDate <= new Date(endDate);
    } else if (startDate) {
      matchesDate = new Date(t.date) >= new Date(startDate);
    } else if (endDate) {
      matchesDate = new Date(t.date) <= new Date(endDate);
    }

    return matchesFilter && matchesCategory && matchesSearch && matchesDate;
  });

  // Extract unique categories for the dropdown
  const uniqueCategories = [...new Set(transactions.map(t => t.category))];

  const exportToCSV = () => {
    const headers = ["Title", "Category", "Date", "Type", "Amount"];
    const rows = filteredList.map(t => [
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.amount
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-10 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Transactions</h1>
            <p className="text-sm text-slate-500">{transactions.length} entries total</p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={exportToCSV}
              disabled={filteredList.length === 0}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Download size={16} /> Export
            </button>
            <button 
              onClick={() => navigate("/add")}
              className="bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              Add New
            </button>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by title or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent dark:text-white rounded-lg focus:ring-slate-900 dark:focus:ring-emerald-500 focus:border-slate-900 dark:focus:border-emerald-500 outline-none text-sm transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              {["all", "income", "expense"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                    filter === f 
                      ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="text-slate-400 shrink-0" size={16} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-48 bg-transparent text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Calendar className="text-slate-400 shrink-0" size={16} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-auto bg-transparent text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500"
              />
              <span className="text-slate-400 text-sm">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-auto bg-transparent text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500"
              />
            </div>
            
            {(search || filter !== 'all' || categoryFilter !== 'all' || startDate || endDate) && (
              <button 
                onClick={() => { setSearch(""); setFilter("all"); setCategoryFilter("all"); setStartDate(""); setEndDate(""); }}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* LIST */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <EmptyState 
              title="No transactions yet" 
              message="You haven't recorded any income or expenses. Add your first transaction to get started!" 
            />
          ) : filteredList.length === 0 ? (
            <EmptyState 
              title="No matches found" 
              message="We couldn't find any transactions matching your current filters." 
              showButton={false}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="p-4 font-medium">Transaction</th>
                    <th className="p-4 font-medium hidden sm:table-cell">Category</th>
                    <th className="p-4 font-medium hidden md:table-cell">Date</th>
                    <th className="p-4 font-medium text-right">Amount</th>
                    <th className="p-4 font-medium text-center w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredList.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            t.type === "income" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                          }`}>
                            {t.type === "income" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">{t.title}</p>
                            <p className="text-xs text-slate-500 sm:hidden">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                          {t.category}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">
                        {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className={`p-4 text-right font-bold text-sm ${
                        t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                      }`}>
                        {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete transaction"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}