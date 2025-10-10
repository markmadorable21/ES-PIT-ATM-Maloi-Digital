import { useState, useEffect } from "react";
import backGroundImage from "../assets/background imge.png";
import masterCard from "../assets/mastercard.png";
import visaCard from "../assets/visa.png";
import gCash from "../assets/gcash.png";

function LandingPage() {
  const [time, setTime] = useState(" ");

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

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-white relative"
      style={{
        backgroundImage: `url(${backGroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center 20px",
        backgroundRepeat: "no-repeat",
      }}
    >
      <nav className="absolute top-0 left-0 w-full px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between bg-[#CD2255] text-white text-sm z-10 gap-3">
        {/* Time */}
        <div className="text-center md:text-left">{time}</div>

        {/* Payment Icons */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <img src={masterCard} alt="MasterCard" className="h-6 sm:h-8" />
          <img src={visaCard} alt="Visa" className="h-6 sm:h-8" />
          <img src={gCash} alt="GCash" className="h-6 sm:h-8" />
        </div>

        {/* Contact */}
        <div className="text-center md:text-right text-xs sm:text-sm">
          For inquiries, please contact <br className="block md:hidden" />
          <span className="font-medium">+63 905 724 6967</span>
        </div>
      </nav>
    </div>
  );
}
export default LandingPage;