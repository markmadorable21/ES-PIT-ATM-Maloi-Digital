import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import backGroundImage from "../assets/background imge.png";
import masterCard from "../assets/mastercard.png";
import visaCard from "../assets/visa.png";
import gCash from "../assets/gcash.png";
import atmIcon from "../assets/atm.png";

function LandingPage() {
  const [time, setTime] = useState("");
  const [phase, setPhase] = useState("welcome");
  const [pin, setPin] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const onPinSuccess = () => {
    navigate("/choose-transaction");
  };

  // ⏰ Update time every second
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

  // 💳 Simulated card insert
  const handleCardRecognized = () => {
    setPhase("pin");
    setTimeout(() => inputsRef.current[0]?.focus(), 50);
  };

  const simulateCardInsert = () => handleCardRecognized();

  // 🔢 PIN input handling
  const handlePinChange = (idx, value) => {
    const v = value.replace(/\D/g, "").slice(0, 1);
    const next = [...pin];
    next[idx] = v;
    setPin(next);
    if (v && idx < inputsRef.current.length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePinKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !pin[idx] && idx > 0)
      inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowLeft" && idx > 0)
      inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < inputsRef.current.length - 1)
      inputsRef.current[idx + 1]?.focus();
    if (e.key === "Enter" && isPinReady)
      handleSubmitPin();
  };

  const isPinReady = pin.every((d) => d.length === 1);

  const handleSubmitPin = () => {
    if (!isPinReady) return;
    setPhase("processing");
    const pinValue = pin.join("");
    console.log("Submitting PIN:", pinValue);

    setTimeout(() => onPinSuccess(), 500);
  };

  return (
    // Outer wrapper centers the ATM screen
    <div className="flex items-center justify-center min-h-screen bg-gray-300">
      {/* Fixed ATM screen container */}
      <div
        className="relative overflow-hidden rounded-lg shadow-2xl flex flex-col"
        style={{
          width: "800px",
          height: "480px",
          border: "8px solid black",
          backgroundImage: `url(${backGroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* 🔺 Top Navigation Bar */}
        <nav
          className="flex justify-between items-center px-4 py-2 text-white"
          style={{
            backgroundColor: "#CD2255",
            height: "50px",
            fontSize: "14px",
          }}
        >
          <div>{time}</div>

          <div className="flex items-center gap-3">
            <img src={masterCard} alt="MasterCard" style={{ height: "20px" }} />
            <img src={visaCard} alt="Visa" style={{ height: "20px" }} />
            <img src={gCash} alt="GCash" style={{ height: "20px" }} />
          </div>

          <div className="text-right leading-tight">
            For inquiries, contact<br />
            <span className="font-semibold text-[13px]">+63 905 724 6967</span>
          </div>
        </nav>

        {/* 💬 Main Content (Right Side, Left-Aligned) */}
        <div
          className="flex flex-col justify-center items-start text-left"
          style={{
            flex: 1,
            width: "50%", // occupy right half of the screen
            paddingLeft: "40px",
            paddingRight: "40px",
            position: "absolute",
            right: -100, 
            top: 0,
            bottom: 0,
          }}
        >
          {/* Title */}
          <div className="flex items-center gap-3">
            <h1
              className="font-[Kameron] font-extrabold text-black tracking-tight"
              style={{ fontSize: "32px", lineHeight: "1" }}
            >
              Maloi Digital
            </h1>
            <img src={atmIcon} alt="ATM Icon" style={{ height: "34px" }} />
          </div>

          <p
            className="font-[Lavishly_Yours] text-black"
            style={{ fontSize: "20px", marginTop: "4px" }}
          >
            All your finances, one place.
          </p>

          {/* 👇 Dynamic Phases */}
          {phase === "welcome" && (
            <>
              <h2
                className="font-[Kameron] text-black"
                style={{ fontSize: "26px", marginTop: "28px" }}
              >
                Welcome, again!
              </h2>
              <p
                className="font-[Kameron] text-black"
                style={{ fontSize: "18px", marginTop: "8px" }}
              >
                Please insert your card.
              </p>

              <button
                onClick={simulateCardInsert}
                className="mt-5 bg-gray-900/10 px-4 py-2 text-sm text-gray-800 rounded-full hover:bg-gray-900/20"
              >
                Simulate card insert (dev)
              </button>
            </>
          )}

          {phase === "pin" && (
            <div style={{ marginTop: "24px" }}>
              <p
                className="font-[Kameron] text-gray-900"
                style={{ fontSize: "20px" }}
              >
                Please enter your Personal Identification Number (PIN)
              </p>

              {/* PIN input fields */}
              <div className="flex gap-3 mt-3">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    value={digit}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    onChange={(e) => handlePinChange(i, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(i, e)}
                    type="password"
                    autoComplete="off"
                    className="text-center border-2 border-gray-600 rounded-md focus:border-[#CD2255] focus:ring-2 focus:ring-[#CD2255]/30 outline-none"
                    style={{
                      width: "50px",
                      height: "50px",
                      fontSize: "22px",
                      background: "white",
                    }}
                  />
                ))}
              </div>

              <div className="flex justify-start mt-5">
                <button
                  onClick={handleSubmitPin}
                  disabled={!isPinReady}
                  className={`rounded-full text-white font-semibold shadow-md ${
                    isPinReady
                      ? "bg-[#CD2255] hover:brightness-110"
                      : "bg-[#CD2255]/60 cursor-not-allowed"
                  }`}
                  style={{ width: "160px", height: "42px", fontSize: "16px" }}
                >
                  Enter
                </button>
              </div>
            </div>
          )}

          {phase === "processing" && (
            <p
              className="font-[Kameron] text-gray-900 mt-6"
              style={{ fontSize: "22px" }}
            >
              Processing…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;