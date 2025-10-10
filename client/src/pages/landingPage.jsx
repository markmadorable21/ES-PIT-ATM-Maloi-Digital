import { useState, useEffect } from 'react';
import backGroundImage from '../assets/images/background imge.png';
import masterCard from '../assets/images/mastercard.png';
import visaCard from '../assets/images/visa.png';
import gCash from '../assets/images/gcash.png';
import atmIcon from '../assets/images/atm.png';

function LandingPage() {
  const [time, setTime] = useState(' ');

  const onPinSuccess = () => {
    navigate("/choose-transaction");
  };

  // Time updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setTime(formatted);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Card recognition (call this from your real card reader)
  const handleCardRecognized = () => {
    setPhase("pin");
    setTimeout(() => inputsRef.current[0]?.focus(), 50);
  };

  // Dev: simulate card insert
  const simulateCardInsert = () => handleCardRecognized();

  // PIN handlers
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
    if (e.key === "Backspace" && !pin[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < inputsRef.current.length - 1)
      inputsRef.current[idx + 1]?.focus();
    if (e.key === "Enter" && isPinReady) handleSubmitPin();
  };

  const isPinReady = pin.every((d) => d.length === 1);

  const handleSubmitPin = () => {
    if (!isPinReady) return;
    setPhase("processing");
    const pinValue = pin.join("");
    console.log("Submitting PIN:", pinValue);

    // Simulate async verify, then go
    setTimeout(() => {
      onPinSuccess(); // <-- navigate after "verification"
    }, 500);
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-white overflow-hidden"
      style={{
        backgroundImage: `url(${backGroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 20px',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 w-full px-2 sm:px-4 py-2 sm:py-3 flex flex-col md:flex-row md:items-center md:justify-between bg-[#CD2255] text-white text-xs sm:text-sm z-10 gap-2 sm:gap-3">
        {/* Time */}
        <div className="text-center md:text-left font-[Kameron]">{time}</div>

        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          <img src={masterCard} alt="MasterCard" className="h-5 sm:h-8" />
          <img src={visaCard} alt="Visa" className="h-5 sm:h-8" />
          <img src={gCash} alt="GCash" className="h-5 sm:h-8" />
        </div>

        {/* Contact */}
        <div className="text-center md:text-right text-[10px] sm:text-xs md:text-sm leading-tight font-[Kameron]">
          For inquiries, please contact <br className="block md:hidden" />
          <span className="font-medium">+63 905 724 6967</span>
        </div>
      </nav>

      {/* Right / Upper text content */}
      <div className="absolute inset-y-5 right-5 w-[44%] min-w-[300px] flex items-start justify-end pt-2 sm:pt-28 md:pt-32 pr-4 sm:pr-8 md:pr-16 lg:pr-24 text-left m-2 mx-10">
        <div className="max-w-full h-auto flex flex-col items-start p-4">
          {/* Title row */}
          <div className="flex flex-nowrap items-baseline gap-3">
            <h1
              className="whitespace-nowrap font-[Kameron] tracking-tight leading-[0.95]
                 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-black"
            >
              {"Maloi\u00A0Digital"}
            </h1>
            <img
              src={atmIcon}
              alt="ATM Icon"
              className="h-[3em] w-auto translate-y-[2px]"
            />
          </div>

          <p className="text-black text-2xl sm:text-3xl mt-2 font-[Lavishly_Yours]">
            All your finances, one place.
          </p>

          {/* ====== FLOW CONTENT ====== */}
          {phase === "welcome" && (
            <>
              <h2 className="text-2xl sm:text-3xl md:text-4xl mt-8 font-[Kameron]">
                Welcome, again!
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-black mt-3 font-[Kameron]">
                Please insert your card.
              </p>

              {/* Dev-only: simulate card insert */}
              <button
                onClick={simulateCardInsert}
                className="mt-6 rounded-full bg-gray-900/10 px-4 py-2 text-sm text-gray-700 hover:bg-gray-900/20"
              >
                Simulate card insert (dev)
              </button>
            </>
          )}

          {phase === "pin" && (
            <div className="mt-8 w-full">
              <p className="font-[Kameron] text-xl md:text-2xl text-gray-900">
                Please enter your Personal Identification Number (PIN)
              </p>

              {/* PIN boxes */}
              <div className="mt-4 flex gap-4 justify-center">
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
                    className="h-14 w-14 rounded-md border-2 border-gray-600 bg-white text-center text-2xl font-[Kameron] tracking-widest shadow-sm focus:border-[#CD2255] focus:outline-none focus:ring-2 focus:ring-[#CD2255]/30"
                    type="password"
                    autoComplete="off"
                  />
                ))}
              </div>

              {/* Enter button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleSubmitPin}
                  disabled={!isPinReady}
                  className={`w-56 rounded-full px-6 py-3 text-lg font-semibold text-white shadow-lg ${
                    isPinReady
                      ? "bg-[#CD2255] hover:brightness-110"
                      : "bg-[#CD2255]/60 cursor-not-allowed"
                  }`}
                >
                  Enter
                </button>
              </div>
            </div>
          )}

          {phase === "processing" && (
            <div className="mt-8">
              <p className="font-[Kameron] text-xl md:text-2xl text-gray-900">
                Processing…
              </p>
            </div>
          )}
          {/* ====== /FLOW CONTENT ====== */}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
