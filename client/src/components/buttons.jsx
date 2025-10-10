import React from "react";

function Button({ label, onClick }) {
  return (
    <button
      className="bg-[#CD2255] text-white font-semibold py-4 px-8 sm:px-8 text-lg sm:text-base font-[Kameron] shadow-md hover:bg-[#b81e4b] transition-all duration-200"
      onClick={onClick}
      style={{
        borderRadius: "10px", // Slightly rounded corners
        width: "200px", // Fix the width
        height: "80px", // Fix the height to match the image
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "1.1rem", // Slightly larger text
      }}
    >
      {label}
    </button>
  );
}

export default Button;