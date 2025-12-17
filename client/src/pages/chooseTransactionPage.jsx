import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import WithdrawalAmount from "../components/withdrawalAmount";
import BalanceInquiry from "../components/balanceInquiry";
import TransactionHistory from "../components/transactionHistory";
import backGroundImage from "../assets/atm-background-image.png";
import masterCard from "../assets/mastercard.png";
import visaCard from "../assets/visa.png";
import gCash from "../assets/gcash.png";
import atmIcon from "../assets/atm.png";
import amex from "../assets/amex.jpg";

function ChooseTransactionPage() {
  const [time, setTime] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [amount, setAmount] = useState(0);
  const [bankFee, setBankFee] = useState(0);

  const { state } = useLocation();
  const [rfidTag, setRfidTag] = useState(state?.rfidTag || null);

  useEffect(() => {
    // Example: Load RFID tag from localStorage or previous page state
    const storedTag = localStorage.getItem("rfidTag");
    if (storedTag) setRfidTag(storedTag);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setTime(formatted);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleButtonClick = (transactionType) => {
    setSelectedTransaction(transactionType);
    setSelectedAccount(null);
    setAmount(0);
  };

  const handleBackClick = () => {
    setSelectedTransaction(null);
    setSelectedAccount(null);
    setAmount(0);
    setBankFee(0);
  };

  // ✅ Updated account selection: uses RFID tag, not “Savings” or “Credit Card”
  const handleAccountSelection = (accountType) => {
    if (!rfidTag) {
      alert("RFID tag not found! Please verify your card first.");
      return;
    }
    setSelectedAccount({ accountType, tag: rfidTag });
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-white relative"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0) 100%), url(${backGroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        width: "100vw",
      }}
    >
      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 w-full px-2 sm:px-4 py-2 sm:py-3 flex flex-col md:flex-row md:items-center md:justify-between bg-[#CD2255] text-white text-xs sm:text-sm z-10 gap-2 sm:gap-3 font-[Kameron] text-[14px]">
        <div className="text-center ">{time}</div>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <img src={masterCard} alt="MasterCard" className="h-4.5" />
          <img src={visaCard} alt="Visa" className="h-4.5" />
          <img src={gCash} alt="GCash" className="h-4.5" />
          <img src={amex} alt="Amex" className="h-6" />
        </div>
        <div>For inquiries, please contact +63 905 724 6967</div>
      </nav>

      {/* Page Content */}
      <div className="absolute inset-0 flex flex-col justify-center px-4">
        <h1 className="text-[50px] sm:text-5xl font-medium text-gray-900 flex gap-2 font-[Kameron] mt-10">
          <img src={atmIcon} alt="ATM Icon" className="h-[42px]" />
          Maloi Digital
        </h1>
        <div className="flex justify-start space-x-2 pr-4">
          {/* Rectangle */}
          <div className="w-7 h-2 bg-black"></div>
          {/* Three square dots */}
          <div className="w-2 h-2 bg-yellow-400"></div>
          <div className="w-2 h-2 bg-red-500"></div>
          <div className="w-2 h-2 bg-blue-500"></div>
        </div>

        {/* Tagline */}
        <p className="text-left text-[24px] font-[Lavishly_Yours] mb-2 italic pr-[15px]">
          All your finances, one place.
        </p>

        <h2 className="ml-15 font-[Kameron] text-[18px] pl-5 mt-5 text-center w-[300px]">
          {!selectedTransaction
            ? "Please choose your desired transaction"
            : selectedTransaction === "withdrawCash" && !selectedAccount
            ? "Please choose your desired account for withdrawal"
            : selectedTransaction === "balanceInquiry" && !selectedAccount
            ? "Please choose your desired account for balance inquiry"
            : selectedTransaction === "withdrawCash" && selectedAccount
            ? ""
            : selectedTransaction === "balanceInquiry" && selectedAccount
            ? "Checking balance for selected account..."
            : ""}
        </h2>

        {/* Transaction Selection */}
        {!selectedTransaction ? (
          <div className="flex flex-col sm:flex-row gap-5 mt-8">
            <button
              className="p-4 h-[120px] w-[130px] bg-[#CD2255] hover:bg-[#a81b44] text-white rounded-lg font-medium text-lg shadow transition font-[Kameron]"
              onClick={() => handleButtonClick("balanceInquiry")}
              type="button"
            >
              Balance Inquiry
            </button>
            <button
              className="p-4 h-[120px] w-[130px] bg-[#CD2255] hover:bg-[#a81b44] text-white rounded-lg font-medium text-lg shadow transition font-[Kameron]"
              onClick={() => handleButtonClick("withdrawCash")}
              type="button"
            >
              Withdraw Cash
            </button>
            <button
              className="p-4 h-[120px] w-[130px] bg-[#CD2255] hover:bg-[#a81b44] text-white rounded-lg font-medium text-lg shadow transition font-[Kameron]"
              onClick={() => handleButtonClick("transactionHistory")}
              type="button"
            >
              Transaction History
            </button>
          </div>
        ) : selectedTransaction === "balanceInquiry" && !selectedAccount ? (
          <div className="flex flex-col sm:flex-row gap-5 mt-8">
            <button
              className="p-4 h-[120px] w-[130px] bg-[#CD2255] hover:bg-[#a81b44] text-white rounded-lg font-semibold text-lg shadow transition font-[Kameron]"
              onClick={() => handleAccountSelection("Savings")}
              type="button"
            >
              Savings
            </button>
            <button
              className="p-4 h-[120px] w-[130px] bg-[#CD2255] hover:bg-[#a81b44] text-white rounded-lg font-semibold text-lg shadow transition font-[Kameron]"
              onClick={() => handleAccountSelection("Credit Card")}
              type="button"
            >
              Debit Card
            </button>
            <button
              onClick={handleBackClick}
              className="p-4 h-[120px] w-[130px] bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-lg shadow transition font-[Kameron]"
              type="button"
            >
              Back
            </button>
          </div>
        ) : selectedTransaction === "withdrawCash" && !selectedAccount ? (
          <div className="flex flex-col sm:flex-row gap-5 mt-8">
            <button
              className="p-4 h-[120px] w-[130px] bg-[#CD2255] hover:bg-[#a81b44] text-white rounded-lg font-semibold text-lg shadow transition font-[Kameron]"
              onClick={() => handleAccountSelection("Savings")}
              type="button"
            >
              Savings
            </button>
            <button
              className="p-4 h-[120px] w-[130px] bg-[#CD2255] hover:bg-[#a81b44] text-white rounded-lg font-semibold text-lg shadow transition font-[Kameron]"
              onClick={() => handleAccountSelection("Credit Card")}
              type="button"
            >
              Dedit Card
            </button>
            <button
              onClick={handleBackClick}
              className="p-4 h-[120px] w-[130px] bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-lg shadow transition font-[Kameron]"
              type="button"
            >
              Back
            </button>
          </div>
        ) : selectedTransaction === "withdrawCash" && selectedAccount ? (
          <WithdrawalAmount
            selectedAccount={selectedAccount.tag} //rfid tag
            amount={amount}
            setAmount={setAmount}
            bankFee={bankFee}
            setBankFee={setBankFee}
            onCancel={handleBackClick}
          />
        ) : selectedTransaction === "balanceInquiry" && selectedAccount ? (
          <BalanceInquiry
            selectedAccount={selectedAccount.tag} // ✅ RFID Tag passed here
            accountType={selectedAccount.accountType}
            onBack={handleBackClick}
          />
        ) : selectedTransaction === "transactionHistory" ? (
          <TransactionHistory
            onBack={handleBackClick}
            selectedAccount={selectedAccount.tag}
          />
        ) : null}
      </div>
    </div>
  );
}

export default ChooseTransactionPage;
