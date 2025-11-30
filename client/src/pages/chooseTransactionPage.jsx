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
      <nav className="absolute top-0 left-0 w-full px-2 sm:px-4 py-2 sm:py-3 flex flex-col md:flex-row md:items-center md:justify-between bg-[#CD2255] text-white text-xs sm:text-sm z-10 gap-2 sm:gap-3 font-[Kameron]">
        <div className="text-center md:text-left">{time}</div>
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          <img src={masterCard} alt="MasterCard" className="h-5 sm:h-7" />
          <img src={visaCard} alt="Visa" className="h-5 sm:h-7" />
          <img src={gCash} alt="GCash" className="h-5 sm:h-7" />
        </div>
        <div className="text-center md:text-right text-[10px] sm:text-xs md:text-sm leading-tight">
          For inquiries, please contact <br className="block md:hidden" />
          <span className="font-medium">+63 905 724 6967</span>
        </div>
      </nav>

      {/* Page Content */}
      <div className="absolute inset-0 flex flex-col justify-center px-4">
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 flex gap-2 font-[Kameron] mt-15">
          <img src={atmIcon} alt="ATM Icon" className="h-8 sm:h-10 w-auto" />
          Maloi Digital
        </h1>
        <p className="text-black text-2xl sm:text-3xl mt-2 font-[Lavishly_Yours]">
          All your finances, one place.
        </p>

        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mt-1 font-[Kameron]">
          {!selectedTransaction
            ? "Please choose your desired transaction"
            : selectedTransaction === "withdrawCash" && !selectedAccount
            ? "Please choose your desired account for withdrawal"
            : selectedTransaction === "balanceInquiry" && !selectedAccount
            ? "Please choose your desired account for balance inquiry"
            : selectedTransaction === "withdrawCash" && selectedAccount
            ? "Please enter the withdrawal amount"
            : selectedTransaction === "balanceInquiry" && selectedAccount
            ? "Checking balance for selected account..."
            : ""}
        </h2>

        {/* Transaction Selection */}
        {!selectedTransaction ? (
          <div className="flex flex-col sm:flex-row gap-5 mt-20">
            <button
              className="px-10 py-10 bg-[#CD2255] hover:bg-[#a81b44] text-white rounded-lg font-semibold text-lg shadow transition font-[Kameron]"
              onClick={() => handleButtonClick("balanceInquiry")}
              type="button"
            >
              Balance Inquiry
            </button>
            <button
              className="px-6 py-3 bg-[#CD2255] hover:bg-[#a81b44] text-white rounded-lg font-semibold text-lg shadow transition font-[Kameron]"
              onClick={() => handleButtonClick("withdrawCash")}
              type="button"
            >
              Withdraw Cash
            </button>
            <button
              className="px-6 py-3 bg-[#CD2255] hover:bg-[#a81b44] text-white rounded-lg font-semibold text-lg shadow transition font-[Kameron]"
              onClick={() => handleButtonClick("transactionHistory")}
              type="button"
            >
              Transaction History
            </button>
          </div>
        ) : selectedTransaction === "balanceInquiry" && !selectedAccount ? (
          <div className="flex flex-col sm:flex-row gap-5 mt-20">
            <button
              className="px-10 py-10 bg-[#CD2255] hover:bg-[#a81b44] text-white rounded-lg font-semibold text-lg shadow transition font-[Kameron]"
              onClick={() => handleAccountSelection("Savings")}
              type="button"
            >
              Savings
            </button>
            <button
              className="px-6 py-3 bg-[#CD2255] hover:bg-[#a81b44] text-white rounded-lg font-semibold text-lg shadow transition font-[Kameron]"
              onClick={() => handleAccountSelection("Credit Card")}
              type="button"
            >
              Credit Card
            </button>
            <button
              onClick={handleBackClick}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-lg shadow transition font-[Kameron]"
              type="button"
            >
              Back
            </button>
          </div>
        ) : selectedTransaction === "withdrawCash" && !selectedAccount ? (
          <div className="flex flex-col sm:flex-row gap-5 mt-20">
            <button
              className="px-10 py-10 bg-[#CD2255] hover:bg-[#a81b44] text-white rounded-lg font-semibold text-lg shadow transition font-[Kameron]"
              onClick={() => handleAccountSelection("Savings")}
              type="button"
            >
              Savings
            </button>
            <button
              className="px-6 py-3 bg-[#CD2255] hover:bg-[#a81b44] text-white rounded-lg font-semibold text-lg shadow transition font-[Kameron]"
              onClick={() => handleAccountSelection("Credit Card")}
              type="button"
            >
              Credit Card
            </button>
            <button
              onClick={handleBackClick}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-lg shadow transition font-[Kameron]"
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
          <TransactionHistory onBack={handleBackClick} />
        ) : null}
      </div>
    </div>
  );
}

export default ChooseTransactionPage;
