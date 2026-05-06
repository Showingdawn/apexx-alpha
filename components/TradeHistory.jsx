"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import axios from "axios";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, Zap } from "lucide-react";

// ─── Inline SVG Sparkline ──────────────────────────────
function SVGSparkline({ data, isProfit, entryPrice, width = 80, height = 32 }) {
  if (!data || data.length < 2) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-10 h-px bg-gray-800 animate-pulse" />
      </div>
    );
  }

  const prices = data.map(d => d.price ?? d.close ?? d.value ?? 0).filter(Boolean);
  if (prices.length < 2) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const toX = (i) => (i / (prices.length - 1)) * width;
  const toY = (p) => height - ((p - min) / range) * height;

  const points = prices.map((p, i) => `${toX(i).toFixed(1)},${toY(p).toFixed(1)}`).join(" ");

  // Entry price line Y position
  const entryY = entryPrice ? toY(parseFloat(entryPrice)) : null;
  const color = isProfit ? "#00FF94" : "#FF3131";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="sparkline-svg"
      style={{ display: 'block' }}
    >
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`sg-${isProfit}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#sg-${isProfit})`}
      />
      {/* Price line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Entry price marker */}
      {entryY != null && entryY >= 0 && entryY <= height && (
        <line
          x1="0" y1={entryY.toFixed(1)}
          x2={width} y2={entryY.toFixed(1)}
          stroke="#D4AF37"
          strokeWidth="0.8"
          strokeDasharray="3 2"
          opacity="0.7"
        />
      )}
    </svg>
  );
}

// ─── Component ─────────────────────────────────────────
// ─── Ghost Price Component ──────────────────────────────
function GhostPrice({ value, isPositive }) {
  const [prevValue, setPrevValue] = useState(value);
  const [glow, setGlow] = useState(null); // 'green' | 'red' | null

  useEffect(() => {
    if (value > prevValue) {
      setGlow("green");
      const t = setTimeout(() => setGlow(null), 500);
      return () => clearTimeout(t);
    } else if (value < prevValue) {
      setGlow("red");
      const t = setTimeout(() => setGlow(null), 500);
      return () => clearTimeout(t);
    }
    setPrevValue(value);
  }, [value, prevValue]);

  const glowClass = glow === "green" ? "bg-[#00e676]/20 text-[#00e676] shadow-[0_0_20px_#00e67633]" : 
                    glow === "red" ? "bg-[#ff1744]/20 text-[#ff1744] shadow-[0_0_20px_#ff174433]" : 
                    isPositive ? "text-[#00e676]" : "text-[#ff1744]";

  return (
    <span className={`px-2 py-0.5 rounded transition-all duration-300 font-mono font-black ${glowClass}`}>
      {value}
    </span>
  );
}

// ─── Component ─────────────────────────────────────────
export default function TradeHistory({ optimisticTrades = [], setOptimisticTrades }) {
  const [loading, setLoading] = useState(true);
  const [marketPrices, setMarketPrices] = useState({});
  const [sparklines, setSparklines] = useState({});
  const [marketSnapshots, setMarketSnapshots] = useState({});

  useEffect(() => {
    const fetchHistory = async () => {
      if (!auth.currentUser) return;
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await axios.get("/api/trade/history", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (setOptimisticTrades) {
          const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setOptimisticTrades(sorted);
          const assets = [...new Set(sorted.map(t => t.asset))];
          assets.forEach(async (asset) => {
            try {
              const sRes = await axios.get(`/api/market/snapshot?symbol=${encodeURIComponent(asset)}`);
              setMarketSnapshots(prev => ({ ...prev, [asset]: sRes.data }));
              setSparklines(prev => ({ ...prev, [asset]: sRes.data.sparklineData }));
            } catch { /* silent */ }
          });
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [setOptimisticTrades]);

  useEffect(() => {
    const socket = io("/");
    socket.on("market_update", (prices) => setMarketPrices(prices));
    return () => socket.disconnect();
  }, []);

  return (
    <div className="flex flex-col h-full max-h-[700px] font-body">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-4">
        <div className="flex items-center gap-4">
          <div className="p-2 border border-[#f0c040]/30 text-[#f0c040]">
            <Brain size={16} />
          </div>
          <div>
            <h2 className="text-white font-header font-black tracking-[0.2em] uppercase text-[11px]">Neural Audit Ledger</h2>
            <p className="text-[8px] text-gray-600 font-mono uppercase tracking-widest mt-1">Real-time Strategy Verification</p>
          </div>
        </div>
        <div className="text-[9px] glass-panel border-[#f0c040]/30 px-3 py-1.5 text-[#f0c040] font-header font-black flex items-center gap-2">
          <Zap size={10} className="fill-[#f0c040]" /> CMC PROTOCOL V9.1
        </div>
      </div>

      {loading ? (
        <div className="text-gray-700 text-center py-20 animate-pulse text-[10px] uppercase tracking-[0.5em] font-header">
          Decrypting Sovereign Ledger...
        </div>
      ) : (
        <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar px-1">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-gray-500 uppercase tracking-[0.3em] text-[8px] font-header font-black">
                <th className="pb-4 px-4">Asset Matrix</th>
                <th className="pb-4 px-4">Sentiment</th>
                <th className="pb-4 px-4 text-center">Spectral 7D</th>
                <th className="pb-4 px-4 text-right">Allocation</th>
                <th className="pb-4 px-4 text-right">Entry / P&L Delta</th>
                <th className="pb-4 px-4 text-center">State</th>
              </tr>
            </thead>
            <tbody>
              {optimisticTrades.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-20 text-gray-800 italic text-[10px] uppercase font-header tracking-widest">
                    Awaiting Market Entry Commands...
                  </td>
                </tr>
              ) : optimisticTrades.map((trade) => {
                let pnlValue = 0;
                let isPositive = false;
                const livePrice = marketPrices[trade.asset] || 0;

                if (trade.status === "OPEN" && livePrice > 0) {
                  const spread = trade.type === "BUY"
                    ? livePrice - trade.entryPrice
                    : trade.entryPrice - livePrice;
                  pnlValue = spread * trade.lot;
                  isPositive = pnlValue >= 0;
                } else if (trade.status === "CLOSED") {
                  const floatPnl = parseFloat(trade.pnl) || 0;
                  isPositive = floatPnl >= 0;
                  pnlValue = floatPnl;
                }

                const sentimentValue = ((trade.entryPrice || 50000) % 100) / 100 * 100;
                const assetSparkline = sparklines[trade.asset] || [];

                return (
                  <motion.tr
                    layout
                    key={trade.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group glass-panel border-white/5 hover:border-[#f0c040]/20 transition-all cursor-none"
                  >
                    {/* Asset */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-1 h-8 ${trade.type === "BUY" ? "bg-[#00e676]" : "bg-[#ff1744]"}`} />
                        <div>
                          <p className="text-white font-header font-black text-[11px] group-hover:text-[#f0c040] transition-colors">{trade.asset}</p>
                          <p className="text-[8px] text-gray-700 font-mono uppercase mt-1">
                             T+: {new Date(trade.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Sentiment */}
                    <td className="py-4 px-4">
                       <div className="flex flex-col gap-1.5">
                          <div className="w-20 h-[3px] bg-white/5">
                             <div 
                               className={`h-full ${sentimentValue > 50 ? "bg-[#00e676]" : "bg-[#ff1744]"} shadow-[0_0_10px_currentColor]`}
                               style={{ width: `${sentimentValue}%` }}
                             />
                          </div>
                          <p className="text-[7px] font-mono uppercase tracking-[0.2em] text-gray-600">
                            Neural Index: <span className="text-white">{sentimentValue.toFixed(0)}</span>
                          </p>
                       </div>
                    </td>

                    {/* Spectral Sparkline */}
                    <td className="py-4 px-4">
                      <div className="mx-auto w-24 h-10 grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-100 flex items-center justify-center">
                        <SVGSparkline
                          data={assetSparkline}
                          isProfit={isPositive}
                          entryPrice={trade.entryPrice}
                          width={96}
                          height={36}
                        />
                      </div>
                    </td>

                    {/* Size */}
                    <td className="py-4 px-4 text-right">
                      <p className="text-white font-mono font-black text-[12px]">
                        {(trade.lot || 0).toLocaleString()}
                      </p>
                      <p className="text-[7px] text-gray-700 uppercase font-header font-black mt-1 tracking-widest">Capacity</p>
                    </td>

                    {/* Entry / P&L */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex flex-col items-end">
                         {trade.status === "PENDING" ? (
                           <span className="text-[11px] font-mono text-gray-800">---</span>
                         ) : (
                           <GhostPrice value={pnlValue.toFixed(2)} isPositive={isPositive} />
                         )}
                         <p className="text-[8px] text-gray-700 font-mono mt-1">
                           @ {(trade.entryPrice ?? 0).toFixed(2)}
                         </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <span className={`text-[8px] font-header font-black uppercase px-3 py-1 border ${
                        trade.status === "PENDING" ? "text-gray-700 border-gray-800" :
                        trade.status === "OPEN"    ? "text-[#f0c040] border-[#f0c040]/40" :
                        "text-white/20 border-white/5"
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
