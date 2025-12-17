import { useState, useEffect } from "react";

function TransactionHistory({ onBack, selectedAccount }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      // 1. SAFETY CHECK: Ensure we have an account to fetch for
      if (!selectedAccount) {
        console.error("No selectedAccount provided to TransactionHistory");
        return;
      }

      try {
        // 2. IDENTIFY THE TAG:
        // Your backend returns "rfid_tag", but some frontends use "tag".
        // This line handles both cases safely.
        const rfid = selectedAccount.rfid_tag || selectedAccount.tag;

        console.log(`Fetching history for RFID: ${rfid}`);

        // 3. FETCH: Connect to the Python backend
        const response = await fetch(
          `http://localhost:5000/transactions/${rfid}`
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Transactions received:", data);

          // 4. MAP DATA: Convert Python DB columns to React display format
          const formattedData = data.map((item) => ({
            date: new Date(item.timestamp).toLocaleString(), // Formats '2025-12-16...' to readable text
            type: item.type,
            amount: item.amount,
          }));

          setTransactions(formattedData);
        } else {
          console.error("Server returned an error:", response.status);
          setTransactions([]);
        }
      } catch (error) {
        console.error("Error connecting to server:", error);
      }
    };

    fetchHistory();
  }, [selectedAccount]); // Re-run this if the user changes

  return (
    <div className="mt-10 font-[Kameron] text-gray-900">
      <h2 className="text-2xl font-bold mb-4 text-[#CD2255]">
        Transaction History
      </h2>

      {transactions.length === 0 ? (
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">
            No transactions found for this account.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-[#CD2255] text-white">
                <th className="px-4 py-2 text-left">Date & Time</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, index) => (
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-2 text-sm">{t.date}</td>
                  <td className="px-4 py-2 capitalize font-medium">{t.type}</td>
                  <td
                    className={`px-4 py-2 font-bold ${
                      t.type === "withdraw" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {t.type === "withdraw" ? "-" : "+"} ?
                    {t.amount.toLocaleString()}
                  </td>
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
