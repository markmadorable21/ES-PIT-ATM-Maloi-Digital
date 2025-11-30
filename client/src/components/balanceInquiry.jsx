import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCreditCard } from "react-icons/fa";

const BalanceInquiry = ({ selectedAccount, onBack, onReceipt }) => {
  const [showReceiptOption, setShowReceiptOption] = useState(false);
  const [showTransactionOption, setShowTransactionOption] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [goBackToMainTransaction, setGoBackToMainTransaction] = useState(false);
  const [name, setName] = useState("");

  const navigate = useNavigate();

  // ✅ Fetch balance from backend using RFID tag
  useEffect(() => {
    if (!selectedAccount) return;

    const fetchBalance = async () => {
      try {
        console.log(`Fetching balance for RFID tag: ${selectedAccount}`);
        const response = await fetch(
          `http://localhost:8000/balance/${selectedAccount}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch balance");
        }
        const data = await response.json();
        setBalance(data.balance);
        setName(data.name);
        console.log("✅ Balance fetched successfully:", data.balance);
      } catch (error) {
        console.error("❌ Error fetching balance:", error);
        alert("Error retrieving balance. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [selectedAccount]);

  // Handles "Yes/No" for another transaction
  const handleTransactionDecision = (decision) => {
    setShowTransactionOption(false);
    setShowReceiptOption(true);
    setGoBackToMainTransaction(decision);
  };

  // Handles "Yes/No" for receipt printing
  const handleReceiptDecision = async (receiptDecision) => {
    if (receiptDecision) {
      onReceipt && onReceipt(); // Optional callback

      try {
        // 🖨️ Send request to backend to print receipt
        const response = await fetch("http://localhost:8000/print/receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rfid_tag: selectedAccount,
            name: name, // replace this with actual name if available
            balance: balance,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          console.log("🖨️ Receipt printed:", data);
        } else {
          console.error("⚠️ Printer error:", data.detail || data);
          alert("Printer error: " + (data.detail || "Unable to print receipt"));
        }
      } catch (error) {
        console.error("Printer connection failed:", error);
        alert("Printer connection failed. Check backend or USB printer.");
      }
    }

    // Show final message
    setShowReceiptOption(false);
    setShowFinalMessage(true);

    // Navigate after short delay
    setTimeout(() => {
      if (goBackToMainTransaction) {
        onBack && onBack();
      } else {
        navigate("/");
      }
    }, 2000);
  };

  return (
    <div
      className="flex flex-col items-center justify-center mt-10 max-w-md w-full bg-white rounded-lg shadow-lg p-6"
      style={{
        background: "url('/mnt/data/ecc65478-b87d-4728-83a9-a4c869dd4050.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "10px",
      }}
    >
      {/* 🌀 Loading State */}
      {isLoading ? (
        <div className="text-center">
          <span className="text-lg font-semibold text-gray-700 font-[Kameron]">
            Checking balance for your account...
          </span>
        </div>
      ) : (
        <>
          {/* 💳 Display Account Info */}
          <div className="text-left">
            <p className="mt-0.5 text-lg font-semibold text-[#1d3557] font-[Kameron]">
              <FaCreditCard className="inline-block mr-2" /> Account #:{" "}
              {selectedAccount}
            </p>
            <p className="mt-4 text-2xl font-bold text-[#CD2255] font-[Kameron]">
              Current Balance: ₱{balance.toFixed(2)}
            </p>
          </div>

          {/* 🔁 Transaction Decision */}
          {showTransactionOption && (
            <>
              <p className="mt-4 text-lg text-gray-700 font-[Kameron]">
                Would you like to do another transaction?
              </p>
              <div className="flex gap-4 mt-5 justify-center">
                <button
                  onClick={() => handleTransactionDecision(true)}
                  className="bg-[#CD2255] text-white px-6 py-3 rounded-lg font-semibold text-lg transition font-[Kameron]"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleTransactionDecision(false)}
                  className="bg-[#CD2255] text-white px-6 py-3 rounded-lg font-semibold text-lg transition font-[Kameron]"
                >
                  No
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* 🧾 Receipt Option */}
      {showReceiptOption && (
        <div className="text-center mt-5">
          <p className="text-lg text-gray-700 font-[Kameron]">
            Would you like a printed receipt?
          </p>
          <div className="flex gap-4 mt-5 justify-center">
            <button
              onClick={() => handleReceiptDecision(true)}
              className="bg-[#CD2255] text-white px-6 py-3 rounded-lg font-semibold text-lg transition font-[Kameron]"
            >
              Yes
            </button>
            <button
              onClick={() => handleReceiptDecision(false)}
              className="bg-[#CD2255] text-white px-6 py-3 rounded-lg font-semibold text-lg transition font-[Kameron]"
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* ✅ Final Message */}
      {showFinalMessage && !isLoading && (
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 font-[Kameron]">
            Thank you for doing your business with us!
          </p>
          <p className="mt-2 text-lg text-gray-700 font-[Kameron]">
            Please get your card.
          </p>
        </div>
      )}
    </div>
  );
};

export default BalanceInquiry;
