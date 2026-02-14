import React from "react";

const DoubleLogo = () => {
  return (
    <div className="flex items-center gap-4 select-none py-1 group">
      {/* Visual Logo Mark */}
      <div className="relative w-12 h-10 flex items-center">
        {/* Back Card - Primary Mint */}
        <div className="absolute left-0 w-8 h-8 rounded-full border-2 border-white shadow-sm bg-[#a8dadc]" />
        
        {/* Front Card - Deep Ocean */}
        <div className="absolute right-0 w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center bg-[#457b9d]">
          {/* The "Match" Symbol - Static Gold Star */}
          <span className="text-lg absolute -left-1 text-[#e9c46a] drop-shadow-sm">
            ★
          </span>
        </div>
      </div>

      {/* Brand Text Divider and Typography */}
      <div className="flex flex-col justify-center border-l-2 border-[#a8dadc] pl-3">
        <h1 className="text-[#1d3557] font-black text-2xl tracking-tight leading-none">
          Double
        </h1>
        <span className="text-[#457b9d] text-[10px] font-bold tracking-[0.2em] uppercase mt-1">
          Spot It!
        </span>
      </div>
    </div>
  );
};

export default DoubleLogo;