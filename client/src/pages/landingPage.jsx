import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backGroundImage from '../assets/enhancedBackground.png';
import masterCard from '../assets/mastercard.png';
import visaCard from '../assets/visa.png';
import gCash from '../assets/gcash.png';
import atmIcon from '../assets/atm.png';

function LandingPage() {
  const [time, setTime] = useState('');
  const [phase, setPhase] = useState('welcome');
  const [pin, setPin] = useState(['', '', '', '']);
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const onPinSuccess = () => navigate('/choose-transaction');

  // 🕒 live clock
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

  // 💳 card simulation
  const handleCardRecognized = () => {
    setPhase('pin');
    setTimeout(() => inputsRef.current[0]?.focus(), 50);
  };
  const simulateCardInsert = () => handleCardRecognized();

  // 🔢 PIN logic
  const handlePinChange = (idx, value) => {
    const v = value.replace(/\D/g, '').slice(0, 1);
    const next = [...pin];
    next[idx] = v;
    setPin(next);
    if (v && idx < inputsRef.current.length - 1)
      inputsRef.current[idx + 1]?.focus();
  };
  const handlePinKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0)
      inputsRef.current[idx - 1]?.focus();
    if (e.key === 'ArrowLeft' && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < inputsRef.current.length - 1)
      inputsRef.current[idx + 1]?.focus();
    if (e.key === 'Enter' && isPinReady) handleSubmitPin();
  };
  const isPinReady = pin.every((d) => d.length === 1);
  const handleSubmitPin = () => {
    if (!isPinReady) return;
    setPhase('processing');
    const pinValue = pin.join('');
    console.log('Submitting PIN:', pinValue);
    setTimeout(onPinSuccess, 500);
  };

  return (
    <div
      className="relative flex items-center justify-center bg-white overflow-hidden"
      style={{
        width: '800px',
        height: '480px',
        backgroundImage: `url(${backGroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* 🔝 Top Navigation Bar */}
      <nav className="absolute top-0 left-0 w-full h-[40px] flex items-center justify-between px-4 bg-[#CD2255] text-white text-[10px] sm:text-xs font-[Kameron]">
        <span>{time}</span>
        <div className="flex items-center gap-2">
          <img src={masterCard} alt="MasterCard" className="h-4" />
          <img src={visaCard} alt="Visa" className="h-4" />
          <img src={gCash} alt="GCash" className="h-4" />
        </div>
        <span className="text-[9px] text-right leading-tight">
          For inquiries, contact <br />
          <strong>+63 905 724 6967</strong>
        </span>
      </nav>

      {/* 🧭 Right Panel */}
      <div className="absolute right-0 top-[45px] bottom-0 w-[46%] flex flex-col justify-start px-4 pt-3 text-left bg-white/60 backdrop-blur-[1px]">
        {/* Static header */}
        <div className="flex items-baseline gap-2">
          <h1 className="font-[Kameron] text-[26px] sm:text-[30px] font-extrabold text-black whitespace-nowrap">
            Maloi&nbsp;Digital
          </h1>
          <img
            src={atmIcon}
            alt="ATM"
            className="h-[28px] w-auto translate-y-[1px]"
          />
        </div>
        <p className="text-black text-[18px] sm:text-[20px] mt-1 font-[Lavishly_Yours]">
          All your finances, one place.
        </p>

        {/* Dynamic section */}
        <div className="mt-3 flex flex-col items-start justify-start w-full overflow-hidden">
          {phase === 'welcome' && (
            <>
              <h2 className="text-[22px] sm:text-[24px] mt-3 font-[Kameron] font-semibold">
                Welcome, again!
              </h2>
              <p className="text-[14px] sm:text-[16px] text-black mt-2 font-[Kameron]">
                Please insert your card.
              </p>

              <button
                onClick={simulateCardInsert}
                className="mt-4 rounded-full bg-gray-900/10 px-4 py-1.5 text-[12px] text-gray-700 hover:bg-gray-900/20"
              >
                Simulate card insert (dev)
              </button>
            </>
          )}

          {phase === 'pin' && (
            <div className="mt-3 w-full">
              <p className="font-[Kameron] text-[16px] text-gray-900">
                Please enter your Personal Identification Number (PIN)
              </p>

              <div className="mt-3 flex gap-3 justify-center">
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
                    className="h-10 w-10 rounded-md border-2 border-gray-600 bg-white text-center text-[18px] font-[Kameron] focus:border-[#CD2255] focus:ring-2 focus:ring-[#CD2255]/30 outline-none"
                    type="password"
                    autoComplete="off"
                  />
                ))}
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleSubmitPin}
                  disabled={!isPinReady}
                  className={`w-40 rounded-full px-4 py-2 text-[14px] font-semibold text-white shadow-lg ${
                    isPinReady
                      ? 'bg-[#CD2255] hover:brightness-110'
                      : 'bg-[#CD2255]/60 cursor-not-allowed'
                  }`}
                >
                  Enter
                </button>
              </div>
            </div>
          )}

          {phase === 'processing' && (
            <div className="mt-4">
              <p className="font-[Kameron] text-[18px] text-gray-900">
                Processing…
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
