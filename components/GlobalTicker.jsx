"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

const TICKER_DATA = [
  { symbol: "NIFTY", price: "22,453.15", change: "+0.45%", isUp: true },
  { symbol: "XAU/USD", price: "2,341.20", change: "-0.12%", isUp: false },
  { symbol: "BTC", price: "71,890.45", change: "+1.24%", isUp: true },
  { symbol: "ETH", price: "3,842.10", change: "+0.85%", isUp: true },
  { symbol: "USDT/INR", price: "83.12", change: "+0.01%", isUp: true },
  { symbol: "DXY", price: "104.22", change: "-0.05%", isUp: false },
];

export default function GlobalTicker() {
  const duplicatedData = [...TICKER_DATA, ...TICKER_DATA];

  return (
    <div className="w-full bg-[#0a0a0a] border-y border-[#1a1a1a] h-10 overflow-hidden flex items-center relative z-40">
      {/* Left Label */}
      <div className="absolute left-0 top-0 bottom-0 px-4 bg-[#0a0a0a] border-r border-[#1a1a1a] flex items-center gap-2 z-10">
        <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap">Global Pulse</span>
      </div>

      <motion.div
        className="flex items-center gap-12 pl-32 whitespace-nowrap"
        animate={{
          x: [0, -1000],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {duplicatedData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{item.symbol}</span>
            <span className="text-[10px] font-black text-white mono-nums">${item.price}</span>
            <div className={`flex items-center gap-0.5 text-[9px] font-black ${item.isUp ? 'text-[#00FF94]' : 'text-[#FF3131]'}`}>
              {item.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {item.change}
            </div>
            <ArrowRight size={8} className="text-gray-800 ml-2" />
          </div>
        ))}
      </motion.div>

      {/* Right Gradient Overlay */}
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none z-10"></div>
    </div>
  );
}
