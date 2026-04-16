import { useState } from "react";
import { useFinance } from "../context/FinanceContext";

export default function AddTransaction() {
  const { addTransaction } = useFinance();

  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    note: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.amount || !form.category) return;

    addTransaction({
      ...form,
      amount: Number(form.amount),
      date: new Date().toLocaleDateString()
    });

    setForm({ type: "expense", amount: "", category: "", note: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-medium text-gray-500">Add Transaction</h3>

      <input
        type="number"
        placeholder="Amount"
        className="w-full p-2 border rounded"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
      />

      <input
        type="text"
        placeholder="Category"
        className="w-full p-2 border rounded"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />

      <select
        className="w-full p-2 border rounded"
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <button className="bg-blue-600 text-white w-full py-2 rounded">
        Add
      </button>
    </form>
  );
}