import React, { useState, useEffect } from "react";
import LoadingGif from "../assets/loading.gif";
import { useNavigate } from "react-router-dom";

const WithdrawalAmount = ({
  selectedAccount, // RFID tag from ChooseTransactionPage
  amount,
  setAmount,
  bankFee,
  setBankFee,
  onCancel,
}) => {
  const [step, setStep] = useState("input"); // input, loading, receipt, done
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
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
        if (!response.ok) throw new Error("Failed to fetch balance");

        const data = await response.json();
        setBalance(data.balance);
        console.log("✅ Balance fetched successfully:", data.balance);
      } catch (error) {
        console.error("❌ Error fetching balance:", error);
        alert("Unable to fetch balance. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [selectedAccount]);

  // ✅ Validation
  const isValidAmount = (val) => val > 0 && val % 100 === 0;

  // ✅ Handle input and fee computation
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

  // ✅ Withdraw logic (from Code 1)
  const handleConfirm = async () => {
    if (!isValidAmount(amount)) {
      setError("Amount must be a multiple of 100, 500, or 1000.");
      return;
    }

    const total = amount + bankFee;
    if (total > balance) {
      setError("Insufficient balance.");
      return;
    }

    setStep("loading");
    setMessage("Processing your withdrawal...");

    try {
      const response = await fetch(
        `http://localhost:8000/withdraw/${selectedAccount}/${amount}`,
        { method: "POST" }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Withdrawal failed");

      setBalance(data.new_balance);
      console.log("✅ Withdrawal successful:", data);

      setMessage(`₱${amount} withdrawn successfully!`);
      setTimeout(() => setStep("receipt"), 1500);
    } catch (error) {
      console.error("❌ Withdrawal error:", error);
      alert(error.message || "Withdrawal failed");
      setStep("input");
    }
  };

  // ✅ Receipt step
  const handleReceipt = async (choice) => {
    setReceipt(choice);
    setStep("done");

    if (choice) {
      try {
        const response = await fetch("http://localhost:8000/print/receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rfid_tag: selectedAccount }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Printer error");
        console.log("🖨️ Receipt printed:", data);
      } catch (error) {
        console.error("Printer error:", error);
        alert("Printer error: " + error.message);
      }
    }

    // ✅ Back to home after done
    setTimeout(() => {
      setStep("input");
      setAmount(0);
      setBankFee(0);
      navigate("/");
    }, 2000);
  };

  const handleCancel = () => onCancel();

  // 🌀 Loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center mt-10">
        <span className="text-lg font-semibold font-[Kameron]">
          Checking your account balance...
        </span>
        <img src={LoadingGif} alt="Loading..." className="m-5" />
      </div>
    );
  }

  // 🧾 Receipt choice
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

  // ✅ Final message
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

  // 🏦 Main Input UI
  return (
    <div className="flex flex-col gap-4 mt-5 max-w-md w-full bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-3">
        <p className="text-lg font-[Kameron] text-gray-700 font-semibold">
          Available Balance:
          <span className="text-[#CD2255] ml-2 font-bold">
            ₱{balance.toFixed(2)}
          </span>
        </p>
      </div>

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
          onClick={handleCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold transition font-[Kameron]"
        >
          Cancel
        </button>
      </div>

      {message && (
        <div className="text-center text-gray-600 mt-3 font-[Kameron]">
          {message}
        </div>
      )}
    </div>
  );
};

export default WithdrawalAmount;
