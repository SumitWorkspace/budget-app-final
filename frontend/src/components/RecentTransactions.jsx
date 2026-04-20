export default function RecentTransactions() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow">
      <div className="flex justify-between mb-4">
        <h3 className="font-bold text-gray-700">Recent Transactions</h3>
        <span className="text-pink-500 text-sm cursor-pointer">See all →</span>
      </div>

      <div className="space-y-3">

        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-sm">Health</p>
            <p className="text-xs text-gray-400">Pharmacy</p>
          </div>
          <span className="text-pink-500 font-bold">-₹180</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-sm">Education</p>
            <p className="text-xs text-gray-400">Udemy</p>
          </div>
          <span className="text-pink-500 font-bold">-₹300</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-sm">Freelance</p>
            <p className="text-xs text-gray-400">Design work</p>
          </div>
          <span className="text-green-500 font-bold">+₹2000</span>
        </div>

      </div>
    </div>
  );
}