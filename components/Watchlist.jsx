"use client";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, LayoutGrid, ShoppingCart, BarChart3, Trash2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const PINNED = ["^NSEI", "^NSEBANK", "BTC-USD", "ETH-USD", "RELIANCE.NS", "GC=F", "SOL-USD"];

export default function Watchlist({ onAssetSelect, onAction }) {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const promises = PINNED.map(s =>
          axios.get(`http://localhost:3001/api/market/snapshot?symbol=${encodeURIComponent(s)}`)
            .then(r => r.data).catch(() => null)
        );
        const results = await Promise.all(promises);
        const newData = {};
        results.forEach((r, i) => { if (r) newData[PINNED[i]] = r; });
        setData(newData);
      } catch (e) {
        console.error("Watchlist sync failed", e);
      }
    };
    fetchBatch();
    const interval = setInterval(fetchBatch, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col glass-sidebar border-r border-white/5 bg-black/40 backdrop-blur-3xl overflow-hidden">
      <div className="p-4 border-b border-white/5 flex justify-between items-center">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
          <LayoutGrid size={12} className="text-[#D4AF37]" /> Market Watch
        </h3>
        <span className="text-[9px] font-mono text-gray-600">{PINNED.length} Assets</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {PINNED.map((symbol) => {
          const item = data[symbol];
          const isUp = (item?.changePercent ?? 0) >= 0;
          const isHot = item?.volume && item?.averageVolume && item.volume > item.averageVolume * 2;

          return (
            <motion.div
              layout
              key={symbol}
              onClick={() => onAssetSelect(symbol)}
              className={`group relative px-4 py-3.5 border-b border-white/5 cursor-pointer overflow-hidden transition-all ${isHot ? "volume-heat" : "hover:bg-[#D4AF37]/5"}`}
            >
              {/* Left accent bar */}
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 rounded-r-full transition-all ${isUp ? "bg-[#00FF94]" : "bg-[#FF3131]"} ${isHot ? "h-10 shadow-[0_0_8px_rgba(212,175,55,0.6)]" : ""}`} />

              <div className="flex justify-between items-center relative z-10">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[12px] font-black text-white group-hover:text-[#D4AF37] transition-colors font-['Inter']">
                      {item?.name || symbol.split('.')[0]}
                    </h4>
                    {isHot && (
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        title="2x+ Volume Spike"
                      >
                        <Zap size={10} className="text-[#D4AF37] fill-[#D4AF37]" />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-700 font-mono uppercase mt-0.5">{symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-mono font-bold text-white" style={{ fontFamily: "'Roboto Mono', monospace" }}>
                    {item?.price
                      ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : <span className="text-gray-700 text-[10px]">---</span>
                    }
                  </p>
                  <p className={`text-[10px] font-mono font-black ${isUp ? "text-[#00FF94]" : "text-[#FF3131]"}`}>
                    {isUp ? "+" : ""}{(item?.changePercent ?? 0).toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Kite-style hover quick-action row */}
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="absolute inset-0 flex items-center justify-end px-3 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-[#050505]/90 to-transparent z-20"
                >
                  <button
                    onClick={e => { e.stopPropagation(); onAction("BUY", symbol); }}
                    title="Quick Buy"
                    className="p-1.5 bg-[#00FF94]/10 rounded-lg text-[#00FF94] hover:bg-[#00FF94] hover:text-black transition-all border border-[#00FF94]/20 hover:border-[#00FF94]"
                  >
                    <ShoppingCart size={12} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onAction("SELL", symbol); }}
                    title="Quick Sell"
                    className="p-1.5 bg-[#FF3131]/10 rounded-lg text-[#FF3131] hover:bg-[#FF3131] hover:text-white transition-all border border-[#FF3131]/20 hover:border-[#FF3131]"
                  >
                    <Trash2 size={12} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onAssetSelect(symbol); }}
                    title="Open Chart"
                    className="p-1.5 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all border border-[#D4AF37]/20 hover:border-[#D4AF37]"
                  >
                    <BarChart3 size={12} />
                  </button>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="p-3 border-t border-white/5 bg-black/60">
        <div className="flex items-center gap-2 text-[9px] text-gray-600 font-black uppercase tracking-widest">
          <div className="h-1 w-1 rounded-full bg-[#00FF94] animate-pulse" />
          NSE · CRYPTO · LIVE
          <div className="ml-auto flex items-center gap-1 text-[#D4AF37]/50">
            <Zap size={8} />
            <span>2x = Heat</span>
          </div>
        </div>
      </div>
    </div>
  );
}
