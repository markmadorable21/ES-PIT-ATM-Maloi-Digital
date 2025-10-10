import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backGroundImage from '../assets/unnamed-Picsart-AiImageEnhancer - Copy1.png';
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

  const handleCardRecognized = () => {
    setPhase('pin');
    setTimeout(() => inputsRef.current[0]?.focus(), 50);
  };

  const simulateCardInsert = () => handleCardRecognized();

  const handlePinChange = (idx, value) => {
    const v = value.replace(/\D/g, '').slice(0, 1);
    const next = [...pin];
    next[idx] = v;
    setPin(next);
    if (v && idx < inputsRef.current.length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePinKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
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
    setTimeout(() => onPinSuccess(), 500);
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-white relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to left, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 80%), url(${backGroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* ===== TOP NAV BAR ===== */}
      <nav className="absolute top-0 left-0 w-full flex flex-col md:flex-row md:items-center md:justify-between bg-[#CD2255] text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 z-10 gap-2 sm:gap-3 font-[Kameron]">
        <div className="text-center md:text-left">{time}</div>
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          <img src={masterCard} alt="MasterCard" className="h-3 sm:h-5" />
          <img src={visaCard} alt="Visa" className="h-3 sm:h-5" />
          <img src={gCash} alt="GCash" className="h-3 sm:h-5" />
        </div>
        <div className="text-center md:text-right text-[10px] sm:text-xs md:text-sm leading-tight">
          For inquiries, please contact <br className="block md:hidden" />
          <span className="font-medium">+63 905 724 6967</span>
        </div>
      </nav>

      {/* ===== RIGHT CONTENT ===== */}
      <div className="absolute inset-y-0 right-5 w-[44%] min-w-[300px] flex flex-col justify-start pt-10 sm:pt-16 md:pt-20 pr-4 sm:pr-8 md:pr-12 lg:pr-20 text-left m-2 mx-10">
        <div className="max-w-md flex flex-col items-start p-4 text-right">
          {/* Static Header - moved upward */}
          <div className="flex flex-nowrap items-baseline gap-3">
            <h2 className="font-[Kameron] text-3xl sm:text-5xl md:text-5xl font-bold text-black">
              Maloi Digital
            </h2>
            <img
              src={atmIcon}
              alt="ATM Icon"
              className="h-[2.5em] w-auto translate-y-[2px]"
            />
          </div>

          <p className="text-black text-2xl sm:text-3xl mt-1 font-[Lavishly_Yours]">
            All your finances, one place.
          </p>

          {/* Dynamic section */}
          <div className="mt-6 w-full transition-all duration-500">
            {phase === 'welcome' && (
              <>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-[Kameron] font-semibold">
                  Welcome, again!
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-black mt-2 font-[Kameron]">
                  Please insert your card.
                </p>

                <button
                  onClick={simulateCardInsert}
                  className="mt-4 rounded-full bg-gray-900/10 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-900/20"
                >
                  Simulate card insert (dev)
                </button>
              </>
            )}

            {phase === 'pin' && (
              <div className="w-full mt-4">
                <p className="font-[Kameron] text-base sm:text-lg md:text-xl text-gray-900">
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
                      className="h-12 w-12 rounded-md border-2 border-gray-600 bg-white text-center text-xl font-[Kameron] shadow-sm focus:border-[#CD2255] focus:outline-none focus:ring-2 focus:ring-[#CD2255]/30"
                      type="password"
                      autoComplete="off"
                    />
                  ))}
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    onClick={handleSubmitPin}
                    disabled={!isPinReady}
                    className={`w-44 rounded-full px-4 py-2 text-base font-semibold text-white shadow-lg ${
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
                <p className="font-[Kameron] text-xl md:text-2xl text-gray-900">
                  Processing…
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
