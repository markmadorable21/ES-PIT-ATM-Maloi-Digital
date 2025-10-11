import { useState, useEffect } from "react";

function TransactionHistory({ onBack }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Example: fetch from localStorage or API in real case
    const storedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
    setTransactions(storedTransactions);
  }, []);

  return (
    <div className="mt-10 font-[Kameron] text-gray-900">
      <h2 className="text-2xl font-bold mb-4 text-[#CD2255]">Transaction History</h2>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-[#CD2255] text-white">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Account</th>
                <th className="px-4 py-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, index) => (
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-2">{t.date}</td>
                  <td className="px-4 py-2">{t.type}</td>
                  <td className="px-4 py-2">{t.account}</td>
                  <td className="px-4 py-2">₱{t.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={onBack}
        className="mt-6 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold shadow transition"
      >
        Back
      </button>
    </div>
  );
}

export default TransactionHistory;
