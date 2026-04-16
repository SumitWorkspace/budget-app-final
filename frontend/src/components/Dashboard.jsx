import { useFinance } from "../context/FinanceContext";
import AddTransaction from "./AddTransaction";

export default function Dashboard() {
  const { totalBalance, totalIncome, totalExpense, transactions } = useFinance();
  const recent = [...transactions].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Balance</p>
          <p className={`text-2xl font-semibold ${totalBalance >= 0 ? "text-blue-600" : "text-red-500"}`}>
            ₹{totalBalance.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Income</p>
          <p className="text-2xl font-semibold text-green-600">+₹{totalIncome.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Expenses</p>
          <p className="text-2xl font-semibold text-red-500">-₹{totalExpense.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Add Form + Recent Transactions */}
      <div className="grid grid-cols-2 gap-6">
        <AddTransaction />
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Transactions</h3>
          <div className="space-y-2">
            {recent.map(t => (
              <div key={t.id} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.category}</p>
                  <p className="text-xs text-gray-400">{t.date} {t.note && `· ${t.note}`}</p>
                </div>
                <span className={`text-sm font-medium ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                  {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}