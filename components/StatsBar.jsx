"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, AlertCircle, Target, Wallet } from "lucide-react";

function RollingNumber({ value, prefix = "" }) {
  return (
    <motion.span
      key={value}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="inline-block"
    >
      {prefix}{value}
    </motion.span>
  );
}

export default function StatsBar({ balance = 0, setBalance }) {
  const [marketData, setMarketData] = useState({
    nifty: { price: 0, change: 0 },
    btc: { price: 0, change: 0 }
  });
  const [nudge, setNudge] = useState("Market is active. Watch for targets.");
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Market Data
        const [niftyRes, btcRes] = await Promise.all([
          axios.get(`http://localhost:3001/api/market/snapshot?symbol=${encodeURIComponent('^NSEI')}`),
          axios.get(`http://localhost:3001/api/market/snapshot?symbol=${encodeURIComponent('BTC-USD')}`)
        ]);
        
        if (niftyRes.data && btcRes.data) {
          setMarketData({
            nifty: { price: niftyRes.data.price, change: niftyRes.data.changePercent },
            btc: { price: btcRes.data.price, change: btcRes.data.changePercent }
          });
        }

      } catch (err) {
        console.error("Stats fetch failed", err);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 5000); // 5s polling as requested
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Balance Card */}
      <motion.div whileHover={{ scale: 1.02 }} className="bento-card p-5">
        <div className="flex justify-between items-start mb-2">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">Trading Balance</p>
          <Wallet size={14} className="text-[#D4AF37]" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tighter mono-nums flex items-center gap-1">
          $<RollingNumber value={balance.toLocaleString('en-US', {minimumFractionDigits: 2})} />
        </h2>
        <div className="mt-2 text-[10px] text-gray-600 font-mono uppercase">Liquidity Active</div>
      </motion.div>

      {/* Nifty 50 Card */}
      <motion.div whileHover={{ scale: 1.02 }} className="bento-card p-5">
        <div className="flex justify-between items-start mb-2">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">Nifty 50 (^NSEI)</p>
          <TrendingUp size={14} className={marketData.nifty.change >= 0 ? "text-[#00FF94]" : "text-[#FF3131]"} />
        </div>
        <h2 className={`text-2xl font-black tracking-tighter mono-nums ${marketData.nifty.change >= 0 ? "text-[#00FF94] glow-green" : "text-[#FF3131] glow-red"}`}>
          <RollingNumber value={marketData.nifty.price.toLocaleString()} />
        </h2>
        <p className={`text-[10px] mt-1 font-mono font-bold ${marketData.nifty.change >= 0 ? "text-[#00FF94]" : "text-[#FF3131]"}`}>
          {marketData.nifty.change >= 0 ? "+" : ""}{(marketData.nifty.change || 0).toFixed(2)}%
        </p>
      </motion.div>

      {/* BTC Card */}
      <motion.div whileHover={{ scale: 1.02 }} className="bento-card p-5">
        <div className="flex justify-between items-start mb-2">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">Bitcoin (BTC-USD)</p>
          <div className="h-4 w-4 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
             <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]"></div>
          </div>
        </div>
        <h2 className={`text-2xl font-black tracking-tighter mono-nums ${marketData.btc.change >= 0 ? "text-[#00FF94] glow-green" : "text-[#FF3131] glow-red"}`}>
          $<RollingNumber value={marketData.btc.price.toLocaleString()} />
        </h2>
        <p className={`text-[10px] mt-1 font-mono font-bold ${marketData.btc.change >= 0 ? "text-[#00FF94]" : "text-[#FF3131]"}`}>
          {marketData.btc.change >= 0 ? "+" : ""}{(marketData.btc.change || 0).toFixed(2)}%
        </p>
      </motion.div>

      {/* Predictive Nudge Card */}
      <motion.div whileHover={{ scale: 1.02 }} className="bento-card p-5 bg-[#D4AF37]/5 border-[#D4AF37]/20 flex flex-col justify-center relative">
        <div className="absolute top-2 right-2">
           <AlertCircle size={14} className="text-[#D4AF37] animate-pulse" />
        </div>
        <p className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-black mb-1 flex items-center gap-2">
           Agentic Pulse
        </p>
        <p className="text-white text-xs font-bold leading-tight italic">
          "{marketData.nifty.change < 0 ? "Nifty dip detected. Support at 22k?" : nudge}"
        </p>
      </motion.div>
    </div>
  );
}

