import { createContext, useContext, useState, useEffect } from "react";

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("budget_txns");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage every time transactions change
  useEffect(() => {
    localStorage.setItem("budget_txns", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (tx) => {
    setTransactions(prev => [...prev, { ...tx, id: Date.now() }]);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const totalBalance = transactions.reduce((sum, t) =>
    t.type === "income" ? sum + t.amount : sum - t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <FinanceContext.Provider value={{
      transactions, addTransaction, deleteTransaction,
      totalBalance, totalIncome, totalExpense
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

// Custom hook — lets any component use the data easily
export const useFinance = () => useContext(FinanceContext);