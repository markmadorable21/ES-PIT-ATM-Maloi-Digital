import { useState, useEffect } from 'react';

function TransactionHistory({ onBack, selectedAccount }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      console.log('🔄 TransactionHistory useEffect triggered');
      console.log('📋 selectedAccount prop:', selectedAccount);

      // 1. SAFETY CHECK: Ensure we have an account to fetch for
      if (!selectedAccount) {
        const errorMsg = 'No selectedAccount provided to TransactionHistory';
        console.error('❌', errorMsg);
        setError(errorMsg);
        setLoading(false);
        setDebugInfo('selectedAccount is null/undefined');
        return;
      }

      try {
        // 2. IDENTIFY THE TAG:
        // Your backend returns "rfid_tag", but some frontends use "tag".
        // This line handles both cases safely.
        const rfid =
          selectedAccount.rfid_tag || selectedAccount.tag || selectedAccount;

        console.log('🔍 RFID extraction attempt:');
        console.log('- selectedAccount.rfid_tag:', selectedAccount.rfid_tag);
        console.log('- selectedAccount.tag:', selectedAccount.tag);
        console.log('- selectedAccount:', selectedAccount);
        console.log('✅ Final RFID value:', rfid);

        setDebugInfo(`Fetching for RFID: "${rfid}"`);

        if (!rfid || rfid.trim() === '') {
          const errorMsg = 'RFID tag is empty or invalid';
          console.error('❌', errorMsg);
          setError(errorMsg);
          setLoading(false);
          return;
        }

        console.log(`🌐 Fetching history for RFID: "${rfid}"`);

        // 3. FETCH: Connect to the Python backend
        // NOTE: Check if your backend is running on port 5000 or 8000
        const apiUrl = `http://localhost:8000/transactions/${rfid}`;
        console.log('📡 API URL:', apiUrl);

        setLoading(true);
        setError(null);

        const startTime = Date.now();
        const response = await fetch(apiUrl);
        const endTime = Date.now();

        console.log(`⏱️ Request took ${endTime - startTime}ms`);
        console.log(
          '📥 Response status:',
          response.status,
          response.statusText
        );
        console.log('📥 Response headers:', response.headers);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Transactions API response:', data);
          console.log('📊 Data type:', typeof data);
          console.log('📊 Is array?', Array.isArray(data));

          if (Array.isArray(data)) {
            console.log(`📈 Number of transactions: ${data.length}`);

            if (data.length === 0) {
              console.log('ℹ️ No transactions found in database');
              setDebugInfo(
                'API returned empty array (no transactions in database)'
              );
            }

            // 4. MAP DATA: Convert Python DB columns to React display format
            const formattedData = data.map((item, index) => {
              console.log(`📝 Processing item ${index}:`, item);

              // Check if timestamp exists
              if (!item.timestamp) {
                console.warn(`⚠️ Item ${index} has no timestamp:`, item);
              }

              return {
                date: item.timestamp
                  ? new Date(item.timestamp).toLocaleString()
                  : 'Unknown Date',
                type: item.type || 'unknown',
                amount: item.amount || 0,
                raw: item, // Keep raw data for debugging
              };
            });

            console.log('✨ Formatted data:', formattedData);
            setTransactions(formattedData);
            setDebugInfo(
              `Loaded ${formattedData.length} transactions successfully`
            );
          } else {
            const errorMsg = 'API did not return an array';
            console.error('❌', errorMsg, data);
            setError(errorMsg);
            setTransactions([]);
            setDebugInfo(
              `API returned: ${typeof data} = ${JSON.stringify(data).substring(
                0,
                100
              )}`
            );
          }
        } else {
          // Try to get error details from response
          let errorDetail = '';
          try {
            const errorData = await response.json();
            errorDetail = errorData.detail || JSON.stringify(errorData);
          } catch (e) {
            errorDetail = await response.text();
          }

          const errorMsg = `Server error: ${response.status} ${response.statusText}`;
          console.error('❌', errorMsg, errorDetail);
          setError(errorMsg);
          setTransactions([]);
          setDebugInfo(
            `Server responded with ${response.status}. Details: ${errorDetail}`
          );
        }
      } catch (error) {
        console.error('❌ Network/Connection error:', error);
        console.error('📞 Is the backend server running?');
        console.error('🔌 Check: http://localhost:8000/');

        const errorMsg = `Connection failed: ${error.message}`;
        setError(errorMsg);
        setDebugInfo(
          `Network error: ${error.message}. Make sure backend is running on port 8000.`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [selectedAccount]);

  // Debug panel for developers
  const renderDebugInfo = () => (
    <div className="mt-4 p-3 bg-gray-100 rounded border border-gray-300 text-xs">
      <h3 className="font-bold text-gray-700 mb-1">Debug Information:</h3>
      <p className="font-mono text-gray-600">{debugInfo}</p>
      <button
        onClick={() => {
          console.log('🔄 Manual refresh triggered');
          setLoading(true);
          setTransactions([]);
          setError(null);
          const fetchHistory = async () => {
            // Re-fetch logic here
            const response = await fetch(
              `http://localhost:8000/transactions/${selectedAccount}`
            );
            const data = await response.json();
            setTransactions(data);
            setLoading(false);
          };
          fetchHistory();
        }}
        className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
      >
        Refresh Data
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="mt-10 font-[Kameron] text-gray-900">
        <h2 className="text-2xl font-bold mb-4 text-[#CD2255]">
          Transaction History
        </h2>
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
            <p className="text-gray-600 mt-4">Loading transactions...</p>
          </div>
        </div>
        {renderDebugInfo()}
        <button
          onClick={onBack}
          className="mt-6 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold shadow transition"
        >
          Back
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 font-[Kameron] text-gray-900">
        <h2 className="text-2xl font-bold mb-4 text-[#CD2255]">
          Transaction History
        </h2>
        <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 font-bold mb-2">
            Error Loading Transactions
          </p>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-sm text-gray-500 mb-4">
            Troubleshooting steps:
            <ul className="list-disc pl-5 mt-2 text-left">
              <li>Ensure backend server is running</li>
              <li>Check if the RFID tag has any transactions</li>
              <li>Verify network connection</li>
            </ul>
          </div>
        </div>
        {renderDebugInfo()}
        <button
          onClick={onBack}
          className="mt-6 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold shadow transition"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10 font-[Kameron] text-gray-900">
      <h2 className="text-2xl font-bold mb-4 text-[#CD2255]">
        Transaction History
      </h2>

      {transactions.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 font-medium mb-2">
            No transactions found for this account.
          </p>
          <p className="text-sm text-gray-500">
            This account has no transaction history yet.
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
                      t.type === 'withdraw' ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {t.type === 'withdraw' ? '-' : '+'}₱
                    {t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Showing {transactions.length} most recent transactions
          </p>
        </div>
      )}

      {renderDebugInfo()}

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
