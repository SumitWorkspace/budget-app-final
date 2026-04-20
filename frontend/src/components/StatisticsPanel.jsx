

export default function StatisticsPanel() {
  
  const savings = Math.max(0, totalBalance);
  const rate = totalIncome > 0 ? Math.round(savings / totalIncome * 100) : 0;
  const spendPct = totalIncome > 0
    ? Math.min(100, Math.round(totalExpense / totalIncome * 100)) : 0;

  const bars = [
    { label: "Jan", pct: 30 },
    { label: "Feb", pct: 55 },
    { label: "Mar", pct: 70 },
    { label: "Apr", pct: spendPct },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-bold text-gray-700 mb-4">Statistics</h3>

      <div className="text-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-600
          to-pink-400 flex items-center justify-center text-white font-bold
          text-base mx-auto mb-2">BH</div>
        <p className="text-sm font-bold text-gray-700">Good Morning! 🔥</p>
        <p className="text-xs text-gray-400">Keep tracking your goals</p>
      </div>

      <div className="space-y-2 mb-4">
        {bars.map(({ label, pct }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-7">{label}</span>
            <div className="flex-1 h-2 bg-pink-50 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-pink-600 to-pink-400
                transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-pink-500 font-bold w-8 text-right">{pct}%</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-pink-50 rounded-xl p-3 text-center">
          <p className="text-base font-bold text-pink-700">
            ₹{savings.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-pink-400 font-semibold mt-0.5">Savings</p>
        </div>
        <div className="bg-pink-50 rounded-xl p-3 text-center">
          <p className="text-base font-bold text-pink-700">{rate}%</p>
          <p className="text-[10px] text-pink-400 font-semibold mt-0.5">Save Rate</p>
        </div>
      </div>
    </div>
  );
}