import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backGroundImage from '../assets/enhancedBackground.png';
import masterCard from '../assets/mastercard.png';
import visaCard from '../assets/visa.png';
import gCash from '../assets/gcash.png';
import atmIcon from '../assets/atm.png';
import amex from '../assets/amex.jpg';

function LandingPage() {
  const [time, setTime] = useState('');
  const [phase, setPhase] = useState('welcome');
  const [pin, setPin] = useState(['', '', '', '']);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const [rfidTag, setRfidTag] = useState(null);

  const onPinSuccess = () => navigate('/choose-transaction');

  useEffect(() => {
    const interval = setInterval(async () => {
      if (phase !== 'welcome') return;

      try {
        const res = await fetch('http://localhost:8000/rfid/latest');
        const data = await res.json();

        if (data.rfid_tag) {
          console.log('Detected RFID:', data.rfid_tag);
          setRfidTag(data.rfid_tag);
          localStorage.setItem('rfidTag', data.rfid_tag); // ? Add this line
          setPhase('pin');
          setTimeout(() => inputsRef.current[0]?.focus(), 200);
        }
      } catch (err) {
        console.error(err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]); // <-- include phase

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
  const handleSubmitPin = async () => {
    // 1️⃣ Ensure PIN is fully entered
    if (!isPinReady) return;

    // 2️⃣ Ensure RFID tag exists
    if (!rfidTag) {
      alert('RFID card not detected. Please insert your card.');
      setPhase('welcome');
      return;
    }

    setPhase('processing');

    // 3️⃣ Combine PIN digits and trim any extra whitespace
    const pinValue = pin.join('').trim();

    try {
      const res = await fetch(
        `http://localhost:8000/verify-pin/${rfidTag}/${pinValue}`,
        {
          method: 'POST',
        }
      );

      // 4️⃣ Parse response JSON
      const data = await res.json();

      // 5️⃣ Check for success or throw error
      if (!res.ok) {
        throw new Error(data.detail || 'Invalid PIN');
      }

      console.log('✅ PIN verified:', data);

      // 6️⃣ Navigate to next phase after a short delay
      setTimeout(onPinSuccess, 500);
    } catch (err) {
      console.error('❌ PIN verification failed:', err.message);

      // Reset PIN inputs
      setPin(['', '', '', '']);
      inputsRef.current[0]?.focus();

      // Show error to user
      alert('Incorrect PIN. Please try again.');

      // Go back to PIN phase
      setPhase('pin');
    }
  };

  return (
    <div
      className="relative flex flex-col bg-white overflow-hidden rounded-none shadow-lg"
      style={{
        width: '100vw', // 100% of viewport width
        height: '100vh', // 100% of viewport height
        backgroundImage: `
      linear-gradient(to left, 
      rgba(255, 255, 255, 0.8) 0%,
        rgba(255, 255, 255, 0.7) 20%,
        rgba(255, 255, 255, 0.5) 30%,
        rgba(255, 255, 255, 0.3) 50%,
        rgba(255, 255, 255, 0.1) 60%,
        transparent 70%
      ),
      url(${backGroundImage})
    `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* 🔝 Top Navigation Bar */}
      <nav className="flex items-center justify-between px-5 h-[45px] bg-[#CD2255] text-white text-[14px] font-[Kameron]">
        <span>{time}</span>
        <div className="flex items-center gap-6">
          <img src={masterCard} alt="MasterCard" className="h-4.5" />
          <img src={visaCard} alt="Visa" className="h-4.5" />
          <img src={gCash} alt="GCash" className="h-4.5" />
          <img src={amex} alt="Amex" className="h-6" />
        </div>
        For inquiries, please contact +63 905 724 6967
      </nav>

      {/* 🧭 Text Content on the Right */}
      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-center text-black w-[44%]">
        {/* 🏦 Header */}
        <div className="flex items-center gap-2">
          <h1 className="text-left font-[Kameron] text-[50px] font-medium leading-none">
            Maloi Digital
          </h1>
          <img src={atmIcon} alt="ATM" className="h-[42px]" />
        </div>

        <div className="flex justify-end space-x-2 pr-4">
          {/* Three square dots */}
          <div className="w-2 h-2 bg-yellow-400"></div>
          <div className="w-2 h-2 bg-blue-500"></div>
          <div className="w-2 h-2 bg-red-500"></div>

          {/* Rectangle */}
          <div className="w-7 h-2 bg-black"></div>
        </div>

        {/* ✨ Tagline */}
        <p className="text-right text-[24px] font-[Lavishly_Yours] mb-2 italic pr-[15px]">
          All your finances, one place.
        </p>

        {/* 🔄 Dynamic Section */}
        <div className="mt-8">
          {phase === 'welcome' && (
            <>
              <h2 className="ml-8 text-[28px] font-[Kameron] font-medium">
                Welcome, again!
              </h2>
              <p className="ml-8 text-[20px] font-[Kameron] ">
                Please insert your card.
              </p>
            </>
          )}

          {phase === 'pin' && (
            <div className="mt-4 ">
              <p className="ml-8 font-[Kameron] text-[14px] mb-3 pl-5">
                Please enter your Personal Identification Number (PIN)
              </p>

              <div className="ml-12 flex gap-3 justify-center">
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

              <button
                onClick={handleSubmitPin}
                disabled={!isPinReady}
                className={`mt-5 ml-16 w-40 rounded-full font-[Kameron] px-4 py-2 text-[14px] font-semibold text-white shadow-md ${
                  isPinReady
                    ? 'bg-[#CD2255] hover:brightness-110'
                    : 'bg-[#CD2255]/60 cursor-not-allowed'
                }`}
              >
                Enter
              </button>
            </div>
          )}

          {phase === 'processing' && (
            <p className="text-right font-[Kameron] text-[18px] mt-6 pr-5">
              Processing…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
