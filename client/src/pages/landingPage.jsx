import { useState, useEffect } from 'react';
import backGroundImage from '../assets/images/background imge.png';
import masterCard from '../assets/images/mastercard.png';
import visaCard from '../assets/images/visa.png';
import gCash from '../assets/images/gcash.png';
import atmIcon from '../assets/images/atm.png';

function LandingPage() {
  const [time, setTime] = useState(' ');

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

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-white relative"
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

        {/* Payment Icons */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          <img src={masterCard} alt="MasterCard" className="h-5 sm:h-7" />
          <img src={visaCard} alt="Visa" className="h-5 sm:h-7" />
          <img src={gCash} alt="GCash" className="h-5 sm:h-7" />
        </div>

        {/* Contact */}
        <div className="text-center md:text-right text-[10px] sm:text-xs md:text-sm leading-tight font-[Kameron]">
          For inquiries, please contact <br className="block md:hidden" />
          <span className="font-medium">+63 905 724 6967</span>
        </div>
      </nav>

      {/* Overlay Text Content */}
      <div className="absolute inset-0 flex items-center justify-end pr-4 sm:pr-8 md:pr-16 lg:pr-24 text-center md:text-left">
        <div className="max-w-[85%] sm:max-w-md h-auto border-2 flex flex-col items-center md:items-start p-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2 font-[Kameron]">
            Maloi Digital
            <img
              src={atmIcon}
              alt="ATM Icon"
              className="h-6 sm:h-7 md:h-8 w-auto"
            />
          </h1>

          <p className="italic text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base font-[Lavishly_Yours]">
            All your finances, one place.
          </p>

          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mt-4 sm:mt-6">
            Welcome, again!
          </h2>

          <p className="text-sm sm:text-base text-gray-700 mt-1 sm:mt-2">
            Please insert your card.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
