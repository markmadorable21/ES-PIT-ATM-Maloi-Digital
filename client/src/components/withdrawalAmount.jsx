import React, { useState } from "react";
import LoadingGif from "../assets/loading.gif"; // Add the correct path to your loading.gif
import { useNavigate } from "react-router-dom";

const WithdrawalAmount = ({
  amount,
  setAmount,
  bankFee,
  setBankFee,
  onCancel, // This comes from ChooseTransactionPage
}) => {
  const [step, setStep] = useState("input"); // input, loading, receipt, done
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Helper to check if value is valid
  const isValidAmount = (val) => {
    if (val <= 0) return false;
    return val % 100 === 0;
  };

  const handleAmountChange = (value) => {
    setAmount((prevAmount) => {
      const newAmount = prevAmount + value;
      setBankFee((newAmount < 0 ? 0 : newAmount) * 0.02);
      if (!isValidAmount(newAmount)) {
        setError("Amount must be a multiple of 100, 500, or 1000.");
      } else {
        setError("");
      }
      return newAmount < 0 ? 0 : newAmount;
    });
  };

  const handleInputChange = (e) => {
    const val = Number(e.target.value);
    setAmount(val < 0 ? 0 : val);
    setBankFee((val < 0 ? 0 : val) * 0.02);
    if (!isValidAmount(val)) {
      setError("Amount must be a multiple of 100, 500, or 1000.");
    } else {
      setError("");
    }
  };

  const handleConfirm = () => {
    if (!isValidAmount(amount)) {
      setError("Amount must be a multiple of 100, 500, or 1000.");
      return;
    }
    setStep("loading");
    setTimeout(() => setStep("receipt"), 2000); // Simulate loading
  };

  const handleReceipt = (choice) => {
    setReceipt(choice);
    setStep("done");

    setTimeout(() => {
      setStep("input");
      setAmount(0);
      setBankFee(0);
      // After the 'done' step, navigate back to the transaction selection page
      navigate("/"); // Redirect to the landing page
    }, 2000); // Wait for 2 seconds before navigating
  };

  // Cancel handler to go back
  const handleCancel = () => {
    onCancel(); // Reset state and go back to the selection page
  };

  if (step === "loading") {
    return (
      <div className="flex flex-col items-center justify-center mt-10">
        <span className="text-lg font-semibold font-[Kameron]">
          Processing your withdrawal...
        </span>
        <img src={LoadingGif} alt="Loading..." className="m-5" />
      </div>
    );
  }

  if (step === "receipt") {
    return (
      <div className="flex flex-col items-center justify-center mt-10 gap-6">
        <span className="text-lg font-semibold font-[Kameron]">
          Would you like a printed receipt?
        </span>
        <div className="flex gap-4">
          <button
            className="bg-[#CD2255] hover:bg-[#a81b44] text-white px-6 py-2 rounded-lg font-semibold transition font-[Kameron]"
            onClick={() => handleReceipt(true)}
          >
            Yes
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold transition font-[Kameron]"
            onClick={() => handleReceipt(false)}
          >
            No
          </button>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="flex flex-col items-center justify-center mt-10 gap-4">
        <span className="text-lg font-semibold text-center font-[Kameron]">
          Please get your cash and card.
          <br />
          Thank you for doing your business with us!
        </span>
      </div>
    );
  }

  // Default: input step
  return (
    <div className="flex flex-col gap-4 mt-5 max-w-md w-full">
      <div className="flex items-center gap-2 justify-center">
        <span className="font-bold text-lg text-gray-700">₱</span>
        <input
          type="number"
          value={amount}
          min={0}
          onChange={handleInputChange}
          placeholder="Enter Amount"
          className="p-3 px-20 border-2 border-[#CD2255] rounded-lg w-80 text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#CD2255] transition"
        />
      </div>
      {error && (
        <div className="text-red-500 text-center font-medium">{error}</div>
      )}
      <div className="flex flex-wrap gap-4 justify-center">
        {[100, 500, 1000].map((step) => (
          <div
            key={step}
            className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 shadow-sm"
          >
            <button
              aria-label={`Decrease by ${step}`}
              onClick={() => handleAmountChange(-step)}
              className="bg-[#CD2255] hover:bg-[#a81b44] text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition"
              type="button"
            >
              –
            </button>
            <span className="font-semibold text-gray-700">{step}</span>
            <button
              aria-label={`Increase by ${step}`}
              onClick={() => handleAmountChange(step)}
              className="bg-[#CD2255] hover:bg-[#a81b44] text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition"
              type="button"
            >
              +
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 text-gray-600 text-center">
        <p>
          <span className="font-medium font-[Kameron]">Bank fee:</span>{" "}
          <span className="font-semibold text-[#CD2255]">
            ₱{bankFee.toFixed(2)}
          </span>
        </p>
      </div>
      <div className="flex gap-4 justify-center mt-4">
        <button
          type="button"
          onClick={handleConfirm}
          className="bg-[#CD2255] hover:bg-[#a81b44] text-white px-6 py-2 rounded-lg font-semibold transition font-[Kameron]"
          disabled={!isValidAmount(amount)}
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={handleCancel} // Trigger to go back to the transaction selection page
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold transition font-[Kameron]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WithdrawalAmount;
