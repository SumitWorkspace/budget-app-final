import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { 
    LayoutDashboard, Wallet, ArrowUpCircle, 
    ArrowDownCircle, LogOut, Bell, Calendar 
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({ balance: 0, totalIncome: 0, totalExpense: 0 });
    const [insight, setInsight] = useState({ message: "Analyzing...", savingsRate: 0 });
    const [transactions, setTransactions] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                // 1. User Profile fetch (Database se)
                const userRes = await API.get('/api/users/profile');
                setUser(userRes.data);

                // 2. Stats fetch (Balance/Income/Expense)
                const statsRes = await API.get('/api/stats');
                setStats(statsRes.data);

                // 3. Insights fetch (AI Smart Message)
                const insightsRes = await API.get('/api/stats/insights');
                setInsight(insightsRes.data);

                // 4. Transactions fetch
                const transRes = await API.get('/api/v1/transactions');
                setTransactions(transRes.data.slice(0, 5)); // Top 5
            } catch (err) {
                console.error("Data fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-bold">Syncing with Bank...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
            {/* Sidebar */}
            <div className="w-72 bg-[#1E293B] text-white hidden lg:flex flex-col shadow-2xl">
                <div className="p-8">
                    <h2 className="text-2xl font-black text-indigo-400 italic">SUMIT PRO</h2>
                </div>
                <nav className="flex-1 px-4">
                    <div className="flex items-center space-x-3 p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                        <LayoutDashboard size={20} />
                        <span className="font-bold">Dashboard</span>
                    </div>
                </nav>
                <div className="p-6">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-3 p-4 hover:bg-rose-500/10 hover:text-rose-500 rounded-2xl transition-all font-bold text-slate-400">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                            Welcome back, {user?.name || 'User'}!
                        </h1>
                        <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                            <Calendar size={16}/> {new Date().toDateString()}
                        </p>
                    </div>
                    <div className="bg-white p-3 pr-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                            {user?.name?.charAt(0)}
                        </div>
                        <p className="font-black text-slate-800">{user?.name}</p>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-indigo-500">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl inline-block mb-4"><Wallet /></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Balance</p>
                        <h3 className="text-3xl font-black text-slate-800">₹{stats.balance?.toLocaleString()}</h3>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-emerald-500">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl inline-block mb-4"><ArrowUpCircle /></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Income</p>
                        <h3 className="text-3xl font-black text-emerald-600">₹{stats.totalIncome?.toLocaleString()}</h3>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-rose-500">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl inline-block mb-4"><ArrowDownCircle /></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Expense</p>
                        <h3 className="text-3xl font-black text-rose-600">₹{stats.totalExpense?.toLocaleString()}</h3>
                    </div>
                </div>

                {/* AI Insight & Transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* AI Card */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-between">
                        <div>
                            <div className="bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-full text-[10px] font-black tracking-widest inline-block mb-6 border border-indigo-500/30">AI INSIGHTS</div>
                            <h2 className="text-2xl font-bold mb-4">{insight.message}</h2>
                            <p className="text-slate-400">Savings Rate: <span className="text-white font-bold">{insight.savingsRate}%</span></p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-800">
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${insight.savingsRate}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <h2 className="text-xl font-black text-slate-800">Recent Activity</h2>
                            <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm">Add New</button>
                        </div>
                        <table className="w-full text-left">
                            <tbody>
                                {transactions.map(t => (
                                    <tr key={t._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-slate-700">{t.description}</p>
                                            <p className="text-xs text-slate-400 uppercase">{t.category}</p>
                                        </td>
                                        <td className={`px-8 py-5 text-right font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {t.type === 'income' ? '+' : '-'} ₹{t.amount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;