import { useState, useEffect } from 'react';
import backGroundImage from '../assets/images/background_image.png';
import masterCard from '../assets/images/mastercard.png';
import visaCard from '../assets/images/visa.png';
import gCash from '../assets/images/gcash.png';
import atmIcon from '../assets/images/atm.png';

function ChooseTransactionPage() {
  const [time, setTime] = useState('');

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
        backgroundImage: `
    linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0) 100%),
    url(${backGroundImage})
  `,
        backgroundSize: 'cover',
        backgroundPosition: 'center 20px',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 w-full px-2 sm:px-4 py-2 sm:py-3 flex flex-col md:flex-row md:items-center md:justify-between bg-[#CD2255] text-white text-xs sm:text-sm z-10 gap-2 sm:gap-3 font-[Kameron]">
        {/* Time */}
        <div className="text-center md:text-left">{time}</div>

        {/* Payment Icons */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          <img src={masterCard} alt="MasterCard" className="h-5 sm:h-7" />
          <img src={visaCard} alt="Visa" className="h-5 sm:h-7" />
          <img src={gCash} alt="GCash" className="h-5 sm:h-7" />
        </div>

        {/* Contact Info */}
        <div className="text-center md:text-right text-[10px] sm:text-xs md:text-sm leading-tight">
          For inquiries, please contact <br className="block md:hidden" />
          <span className="font-medium">+63 905 724 6967</span>
        </div>
      </nav>

      {/* Page Content */}
      <div className="absolute inset-0 flex flex-col  justify-center  px-4">
        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 flex   gap-2 font-[Kameron]">
          <img src={atmIcon} alt="ATM Icon" className="h-8 sm:h-9 w-auto" />
          Maloi Digital
        </h1>

        <p className="italic text-gray-600 text-sm sm:text-base font-[Lavishly_Yours]">
          All your finances, one place.
        </p>

        {/* Subtitle */}
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mt-3 font-[Kameron]">
          Please choose your desired transaction
        </h2>

        {/* Transaction Buttons */}
        <div className="flex flex-col sm:flex-row  gap-5 mt-5">
          <button className="bg-[#CD2255] text-white font-semibold py-15 px-10 sm:px-5 rounded-xl shadow-md hover:bg-[#b81e4b] transition-all duration-200 text-sm sm:text-base  font-[Kameron]">
            Balance Inquiry
          </button>

          <button className="bg-[#CD2255] text-white font-semibold py-15 px-10 sm:px-5 rounded-xl shadow-md hover:bg-[#b81e4b] transition-all duration-200 text-sm sm:text-base  font-[Kameron]">
            Withdraw Cash
          </button>

          <button className="bg-[#CD2255] text-white font-semibold py-15 px-10 sm:px-5 rounded-xl shadow-md hover:bg-[#b81e4b] transition-all duration-200 text-sm sm:text-base font-[Kameron]">
            Change PIN
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChooseTransactionPage;
