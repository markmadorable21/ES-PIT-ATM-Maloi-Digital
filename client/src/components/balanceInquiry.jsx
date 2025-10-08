import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BalanceInquiry = ({ selectedAccount, onBack, onReceipt }) => {
  const [showReceiptOption, setShowReceiptOption] = useState(false);
  const [showTransactionOption, setShowTransactionOption] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [goBackToMainTransaction, setGoBackToMainTransaction] = useState(false); // Tracks if we need to go to the main transaction screen or landing page

  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setBalance(Math.random() * 100000); // Simulate balance for demo purposes
      setIsLoading(false);
    }, 2000); // Simulate loading time of 2 seconds
  }, []);

  // Handles the transaction decision (Yes or No)
  const handleTransactionDecision = (decision) => {
    setShowTransactionOption(false);
    setShowReceiptOption(true); // Show receipt option regardless of the decision
    if (decision) {
      setGoBackToMainTransaction(true); // User chose 'Yes' for another transaction
    } else {
      setGoBackToMainTransaction(false); // User chose 'No', navigate to the landing page
    }
  };

  // Handles the receipt decision (Yes or No)
  const handleReceiptDecision = (receiptDecision) => {
    if (receiptDecision) {
      onReceipt && onReceipt(); // If Yes, print receipt
      window.print(); // Print the receipt
    }
    setShowReceiptOption(false);
    setShowFinalMessage(true); // Show final thank you message

    setTimeout(() => {
      if (goBackToMainTransaction) {
        onBack && onBack(); // If "Yes" to transaction, go back to main transaction screen
      } else {
        navigate("/"); // If "No", go to the landing page
      }
    }, 2000); // Wait for 2 seconds before navigating
  };

  return (
    <div
      className="flex flex-col items-center justify-center mt-10 max-w-md w-full bg-white rounded-lg shadow-lg p-6"
      style={{
        background: "url('/mnt/data/ecc65478-b87d-4728-83a9-a4c869dd4050.png')", // Update with your image
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "10px",
      }}
    >
      {isLoading ? (
        <div className="text-center">
          <span className="text-lg font-semibold text-gray-700">
            Checking balance for selected account...
          </span>
        </div>
      ) : (
        <>
          <div className="text-left">
            <p className="mt-6 text-lg font-semibold text-[#1d3557]">
              Account #: {selectedAccount}
            </p>
            <p className="mt-4 text-2xl font-bold text-[#CD2255]">
              Current Balance: ₱{balance.toFixed(2)}
            </p>
          </div>
          {showTransactionOption && (
            <>
              <p className="mt-4 text-lg text-gray-700">
                Would you like to do another transaction?
              </p>
              <div className="flex gap-4 mt-5 justify-center">
                <button
                  onClick={() => handleTransactionDecision(false)}
                  className="bg-[#CD2255] text-white px-6 py-3 rounded-lg font-semibold text-lg transition"
                >
                  No
                </button>
                <button
                  onClick={() => handleTransactionDecision(true)}
                  className="bg-[#CD2255] text-white px-6 py-3 rounded-lg font-semibold text-lg transition"
                >
                  Yes
                </button>
              </div>
            </>
          )}
        </>
      )}

      {showReceiptOption && (
        <div className="text-center mt-5">
          <p className="text-lg text-gray-700">
            Would you like a printed receipt?
          </p>
          <div className="flex gap-4 mt-5 justify-center">
            <button
              onClick={() => handleReceiptDecision(true)}
              className="bg-[#CD2255] text-white px-6 py-3 rounded-lg font-semibold text-lg transition"
            >
              Yes
            </button>
            <button
              onClick={() => handleReceiptDecision(false)}
              className="bg-[#CD2255] text-white px-6 py-3 rounded-lg font-semibold text-lg transition"
            >
              No
            </button>
          </div>
        </div>
      )}

      {showFinalMessage && !isLoading && (
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">
            Thank you for doing your business with us!
          </p>
          <p className="mt-2 text-lg text-gray-700">Please get your card.</p>
        </div>
      )}
    </div>
  );
};

export default BalanceInquiry;
