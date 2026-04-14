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
        const res = await axios.get("http://localhost:3001/api/trade/history", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (setOptimisticTrades) {
          const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setOptimisticTrades(sorted);
          const assets = [...new Set(sorted.map(t => t.asset))];
          assets.forEach(async (asset) => {
            try {
              const sRes = await axios.get(`http://localhost:3001/api/market/snapshot?symbol=${encodeURIComponent(asset)}`);
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
    const socket = io("http://localhost:3001");
    socket.on("market_update", (prices) => setMarketPrices(prices));
    return () => socket.disconnect();
  }, []);

  return (
    <div className="bento-card p-5 flex flex-col h-full max-h-[600px] bg-[#050505] border-[#1a1a1a]">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <Brain size={16} className="text-[#D4AF37]" />
          <h2 className="text-white font-black tracking-[0.1em] uppercase text-[11px]">Adaptive Intelligence Feed</h2>
        </div>
        <div className="text-[9px] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2 py-1 rounded text-[#D4AF37] uppercase tracking-widest font-black flex items-center gap-1">
          <Zap size={9} className="fill-[#D4AF37]" /> CMC Killer v3.2
        </div>
      </div>

      {loading ? (
        <div className="text-gray-600 text-center py-12 animate-pulse text-[10px] uppercase tracking-widest font-black">
          Decrypting Ledger Data...
        </div>
      ) : (
        <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-y-1.5">
            <thead>
              <tr className="text-gray-600 uppercase tracking-widest text-[8px] font-black">
                <th className="pb-2 px-2">Asset / Time</th>
                <th className="pb-2 px-2">Sentiment</th>
                <th className="pb-2 px-2 text-center w-24">7D Sparkline</th>
                <th className="pb-2 px-2 text-right">Size</th>
                <th className="pb-2 px-2 text-right">Entry / P&L</th>
                <th className="pb-2 px-2 text-center">Status</th>
                {/* Fees column if present */}
                <th className="pb-2 px-2 text-right">Fees</th>
              </tr>
            </thead>
            <tbody>
              {optimisticTrades.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-700 italic text-xs">
                    Awaiting execution orders...
                  </td>
                </tr>
              ) : optimisticTrades.map((trade) => {
                let pnlValue = 0;
                let pnlString = "0.00";
                let isPositive = false;
                const livePrice = marketPrices[trade.asset] || 0;

                if (trade.status === "OPEN" && livePrice > 0) {
                  const spread = trade.type === "BUY"
                    ? livePrice - trade.entryPrice
                    : trade.entryPrice - livePrice;
                  pnlValue = spread * trade.lot;
                  isPositive = pnlValue >= 0;
                  pnlString = (isPositive ? "+" : "") + pnlValue.toFixed(2);
                } else if (trade.status === "CLOSED") {
                  const floatPnl = parseFloat(trade.pnl) || 0;
                  isPositive = floatPnl >= 0;
                  pnlValue = floatPnl;
                  pnlString = trade.pnl;
                }

                const sentimentValue = ((trade.entryPrice || 50000) % 100) / 100 * 100; // deterministic based on price
                const assetSparkline = sparklines[trade.asset] || [];
                const fees = trade.fees;

                return (
                  <motion.tr
                    layout
                    key={trade.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-[#0a0a0a] hover:bg-[#111] border border-[#1a1a1a] transition-all"
                  >
                    {/* Asset */}
                    <td className="py-3.5 px-3 rounded-l-xl">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${trade.type === "BUY" ? "bg-[#00FF94]/10 text-[#00FF94]" : "bg-[#FF3131]/10 text-[#FF3131]"}`}>
                          {trade.type === "BUY" ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        </div>
                        <div>
                          <p className="text-white font-black text-[11px]" style={{ fontFamily: "'Inter', sans-serif" }}>{trade.asset}</p>
                          <p className="text-[8px] text-gray-600 font-mono uppercase">
                            {new Date(trade.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Sentiment bar */}
                    <td className="py-3.5 px-3">
                      <div className="w-16 h-1.5 bg-[#050505] rounded-full overflow-hidden border border-[#1a1a1a]">
                        <div
                          className={`h-full ${sentimentValue > 50 ? "bg-[#00FF94]/40" : "bg-[#FF3131]/40"}`}
                          style={{ width: `${sentimentValue}%` }}
                        />
                      </div>
                      <p className="text-[7px] font-black uppercase tracking-tighter mt-1 text-gray-600">
                        {sentimentValue > 60 ? "Bull Zone" : sentimentValue < 40 ? "Bear Zone" : "Neutral"}
                      </p>
                    </td>

                    {/* SVG Sparkline */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="mx-auto w-20 h-8 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all opacity-60 group-hover:opacity-100">
                        <SVGSparkline
                          data={assetSparkline}
                          isProfit={isPositive}
                          entryPrice={trade.entryPrice}
                          width={80}
                          height={32}
                        />
                      </div>
                      <p className="text-[7px] text-gray-700 font-mono text-center mt-0.5">Entry ──</p>
                    </td>

                    {/* Size */}
                    <td className="py-3.5 px-3 text-right">
                      <p className="text-white font-black text-[11px]" style={{ fontFamily: "'Roboto Mono', monospace" }}>
                        {(trade.lot || 0).toLocaleString()}
                      </p>
                      <p className="text-[8px] text-gray-600 uppercase font-black">Units</p>
                    </td>

                    {/* Entry / P&L */}
                    <td className="py-3.5 px-3 text-right">
                      <p className={`text-[11px] font-black ${trade.status === "PENDING" ? "text-gray-600" : isPositive ? "text-[#00FF94] glow-green" : "text-[#FF3131] glow-red"}`}
                        style={{ fontFamily: "'Roboto Mono', monospace" }}
                      >
                        {trade.status === "PENDING" ? "---" : `$${pnlString}`}
                      </p>
                      <p className="text-[8px] text-gray-600 font-mono">
                        @ ${(trade.entryPrice ?? 0).toFixed(2)}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                        trade.status === "PENDING" ? "bg-yellow-900/10 text-yellow-500 border-yellow-500/30 animate-pulse" :
                        trade.status === "OPEN"    ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30" :
                        "bg-gray-800/10 text-gray-600 border-gray-700/30"
                      }`}>
                        {trade.status}
                      </span>
                    </td>

                    {/* Fees */}
                    <td className="py-3.5 px-3 rounded-r-xl text-right">
                      {fees ? (
                        <div>
                          <p className="text-[10px] font-mono text-[#FF3131] font-bold">-${fees.total?.toFixed(2)}</p>
                          <p className="text-[7px] text-gray-700 uppercase font-black">STT+GST</p>
                        </div>
                      ) : (
                        <span className="text-[9px] text-gray-800">—</span>
                      )}
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
