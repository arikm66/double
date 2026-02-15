import React from "react";
import { VERSION } from '../version' 

const DoubleLogo = () => {
  return (
    <div className="flex items-center gap-4 select-none py-1">
      {/* Visual Logo Mark */}
      <div className="relative w-12 h-10 flex items-center">
        {/* Back Card - Primary Mint */}
        <div className="absolute left-0 w-8 h-8 rounded-full border-2 border-white shadow-sm bg-[#a8dadc]" />
        
        {/* Front Card - Deep Ocean */}
        <div className="absolute right-0 w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center bg-[#457b9d]">
          
          {/* THE BALL CHARACTER - The drop-in replacement */}
          <div className="absolute -left-1 w-5 h-5 rounded-full shadow-sm border border-white/20 bg-[#e9c46a] flex items-center justify-center">
            {/* Simple Kawaii Eyes (Static) */}
            <div className="flex gap-1 mb-0.5">
              <div className="w-1 h-1 bg-[#1d3557] rounded-full" />
              <div className="w-1 h-1 bg-[#1d3557] rounded-full" />
            </div>
            {/* Subtle Shine for 3D feel */}
            <div className="absolute top-0.5 left-1 w-1 h-1 bg-white/40 rounded-full" />
          </div>

        </div>
      </div>

      {/* Brand Text Divider and Typography */}
      <div className="flex flex-col justify-center border-l-2 border-[#a8dadc] pl-3">
        <h1 className="text-[#1d3557] font-black text-2xl tracking-tight leading-none uppercase">
          Double
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[#457b9d] text-[10px] font-bold tracking-[0.2em] uppercase">Spot It!</span>
          <span className="text-[10px] text-slate-400 font-semibold select-none">v{VERSION}</span>
        </div>
      </div>
    </div>
  );
};

export default DoubleLogo;