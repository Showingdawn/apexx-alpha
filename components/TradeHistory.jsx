"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import axios from "axios";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, Zap, Download } from "lucide-react";
import { playMechanicalClick } from "@/utils/sound";
import toast from "react-hot-toast";

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
      const t1 = setTimeout(() => setGlow("green"), 0);
      const t2 = setTimeout(() => setGlow(null), 500);
      setTimeout(() => setPrevValue(value), 0);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else if (value < prevValue) {
      const t1 = setTimeout(() => setGlow("red"), 0);
      const t2 = setTimeout(() => setGlow(null), 500);
      setTimeout(() => setPrevValue(value), 0);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setTimeout(() => setPrevValue(value), 0);
    }
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
  const [ledgerTab, setLedgerTab] = useState("ALL"); // "ALL" | "OPEN" | "CLOSED"
  const [selectedFeedbackTradeId, setSelectedFeedbackTradeId] = useState(null);

  const exportLedgerCSV = () => {
    if (!optimisticTrades || optimisticTrades.length === 0) {
      toast.error("No trades available inside the ledger to export.", { id: "csv-err" });
      return;
    }
    playMechanicalClick();
    
    const headers = ["id", "symbol", "type", "leverage", "entryPrice", "closePrice", "pnl", "timestamp"];
    const rows = optimisticTrades.map(trade => {
      let pnlValue = parseFloat(trade.pnl) || 0;
      if (trade.status === "OPEN") {
        const livePrice = marketPrices[trade.asset] || trade.entryPrice || 0;
        const spread = trade.type === "BUY"
          ? livePrice - trade.entryPrice
          : trade.entryPrice - livePrice;
        pnlValue = spread * (trade.lot || 0);
      }
      return [
        `"${trade.id || ""}"`,
        `"${trade.asset || ""}"`,
        `"${trade.type || ""}"`,
        `"${trade.leverage || 1}x"`,
        trade.entryPrice || 0,
        trade.closePrice || marketPrices[trade.asset] || trade.entryPrice || 0,
        pnlValue.toFixed(2),
        `"${trade.createdAt || new Date().toISOString()}"`
      ];
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "apex_trading_ledger.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Trading ledger successfully exported to apex_trading_ledger.csv!");
  };

  const generateAIFeedback = (trade, pnlValue) => {
    const isProfit = pnlValue >= 0;
    const leverage = trade.leverage || 1;
    const asset = trade.asset || "Asset";
    
    if (trade.status === "OPEN") {
      return {
        grade: leverage > 50 ? "B- (MARGIN EXPOSED)" : "A (SECURE OPEN)",
        statusText: "Active Operations Auditing",
        analysis: `AI Sentinel is currently active. Monitoring your open ${trade.type} position on ${asset} with ${leverage}x leverage. Leverage ratio is registered in memory.`,
        recommendation: leverage > 25 
          ? "⚠️ RISK ADVISORY: Leverage is extremely high! A price deviation of over 3% may result in margin exhaustion. Consider taking profits." 
          : "✨ Strategy audited: Risk parameters are well-balanced. Capital remains secure."
      };
    }
    
    if (isProfit) {
      return {
        grade: leverage > 50 ? "B+ (LEVERAGED PROFIT)" : "A+ (EXCELLENT WIN)",
        statusText: "Highly Profitable Run",
        analysis: `Fantastic execution! You secured $${Math.abs(pnlValue).toFixed(2)} on this ${trade.type} position on ${asset}. Spotting the trend and exiting cleanly with ${leverage}x leverage was highly disciplined.`,
        recommendation: leverage > 50 
          ? "⚠️ Advice: Even with profits, high leverage represents a major volatility trap. Keep it under 20x to maintain systematic gains." 
          : "✨ Advice: Flawless performance! Capital preservation rules were perfectly followed. Replicate this setup."
      };
    } else {
      return {
        grade: leverage > 40 ? "F (LIQUIDATION COLLAPSE)" : "C- (STRATEGY DEFICIT)",
        statusText: "Loss Audited",
        analysis: `AI Sentinel flagged critical risk factors. This ${trade.type} position resulted in a loss of -$${Math.abs(pnlValue).toFixed(2)}. ${leverage > 40 ? `Using high ${leverage}x leverage left zero margin for price fluctuations, causing rapid capital drawdown.` : `Your position size was too large, causing capital exposure on a trend reversal.`}`,
        recommendation: leverage > 20 
          ? "🚨 Recommendation: Reduce leverage immediately! High leverage is a capital-killer for beginners. Protect your account." 
          : "💡 Recommendation: Consult the 'Sovereign Candlestick Cheat Sheet' before entering. Wait for confirmation candles."
      };
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      let tradesArray = [];
      const localTrades = localStorage.getItem("apex_local_trades");
      if (localTrades) {
        try {
          tradesArray = JSON.parse(localTrades);
        } catch (e) {
          console.error("Failed parsing local trades", e);
        }
      }

      if (auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          const res = await axios.get("/api/trade/history", {
            headers: { Authorization: `Bearer ${token}` }
          });
          tradesArray = res.data;
          localStorage.setItem("apex_local_trades", JSON.stringify(tradesArray));
        } catch (err) {
          console.error("Failed to fetch API history:", err);
        }
      }

      if (setOptimisticTrades) {
        const sorted = tradesArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
      setLoading(false);
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
        <div className="flex items-center gap-3">
          <button 
            onClick={exportLedgerCSV}
            className="text-[9px] bg-[#f0c040]/10 hover:bg-[#f0c040]/20 border border-[#f0c040]/30 hover:border-[#f0c040] px-3 py-1.5 text-[#f0c040] font-header font-black flex items-center gap-2 transition-all cursor-pointer rounded-sm shadow-[0_0_10px_rgba(240,192,64,0.05)] hover:shadow-[0_0_15px_rgba(240,192,64,0.2)]"
          >
            <Download size={10} /> EXPORT FOR POWER BI
          </button>
          <div className="text-[9px] glass-panel border-white/10 px-3 py-1.5 text-white/40 font-header font-black flex items-center gap-2">
            <Zap size={10} className="fill-white/20 text-white/20" /> CMC PROTOCOL V9.1
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-700 text-center py-20 animate-pulse text-[10px] uppercase tracking-[0.5em] font-header">
          Decrypting Sovereign Ledger...
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Sovereign Ledger Filter Tabs */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3 px-4">
            <div className="flex gap-2">
              {["ALL", "OPEN", "CLOSED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLedgerTab(tab)}
                  className={`text-[8.5px] font-mono font-black tracking-widest px-3 py-1.5 transition-all uppercase rounded-sm border ${
                    ledgerTab === tab
                      ? "bg-[#f0c040]/10 border-[#f0c040] text-[#f0c040] shadow-[0_0_10px_rgba(240,192,64,0.15)]"
                      : "bg-transparent border-white/5 text-gray-500 hover:text-white"
                  }`}
                >
                  {tab === "ALL" ? "Full Ledger" : tab === "OPEN" ? "Active Ops" : "Archive"}
                </button>
              ))}
            </div>
            
            {/* Realtime stats summary */}
            <div className="flex gap-4 text-[8px] font-mono text-gray-600 uppercase">
              <span>Win Rate: <span className="text-[#00e676] font-bold">
                {optimisticTrades.filter(t => t.status === "CLOSED").length > 0
                  ? `${((optimisticTrades.filter(t => t.status === "CLOSED" && (parseFloat(t.pnl) || 0) >= 0).length / optimisticTrades.filter(t => t.status === "CLOSED").length) * 100).toFixed(0)}%`
                  : "100%"
                }
              </span></span>
              <span>Total closed: <span className="text-white font-bold">{optimisticTrades.filter(t => t.status === "CLOSED").length}</span></span>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar px-1 mt-2">
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
                {optimisticTrades.filter(t => {
                  if (ledgerTab === "OPEN") return t.status === "OPEN";
                  if (ledgerTab === "CLOSED") return t.status === "CLOSED";
                  return true;
                }).length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-20 text-gray-800 italic text-[10px] uppercase font-header tracking-widest">
                      No Trades found in {ledgerTab === "ALL" ? "Ledger" : ledgerTab === "OPEN" ? "Active Operations" : "Archive Ledger"}.
                    </td>
                  </tr>
                ) : optimisticTrades.filter(t => {
                  if (ledgerTab === "OPEN") return t.status === "OPEN";
                  if (ledgerTab === "CLOSED") return t.status === "CLOSED";
                  return true;
                }).map((trade) => {
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
                  <tr key={trade.id} className="border-none bg-transparent">
                    <td colSpan="6" className="p-0 border-none bg-transparent">
                      <table className="w-full text-left border-collapse table-fixed">
                        <tbody>
                          <motion.tr
                            layout
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => {
                              playMechanicalClick();
                              setSelectedFeedbackTradeId(selectedFeedbackTradeId === trade.id ? null : trade.id);
                            }}
                            className={`group border border-white/5 bg-[#020205] hover:bg-white/[0.01] hover:border-[#f0c040]/30 transition-all cursor-pointer rounded-sm ${selectedFeedbackTradeId === trade.id ? "border-[#f0c040]/40 shadow-[0_0_15px_rgba(240,192,64,0.05)]" : ""}`}
                          >
                            {/* Asset */}
                            <td className="py-4 px-4 w-[22%] text-left">
                              <div className="flex items-center gap-3">
                                <div className={`w-1 h-8 ${trade.type === "BUY" ? "bg-[#00e676]" : "bg-[#ff1744]"}`} />
                                <div className="truncate">
                                  <p className="text-white font-header font-black text-[11px] group-hover:text-[#f0c040] transition-colors truncate">{trade.asset}</p>
                                  <p className="text-[8px] text-gray-700 font-mono uppercase mt-1">
                                     T+: {new Date(trade.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Sentiment */}
                            <td className="py-4 px-4 w-[16%] text-left">
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
                            <td className="py-4 px-4 w-[20%] text-center">
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
                            <td className="py-4 px-4 w-[12%] text-right">
                              <p className="text-white font-mono font-black text-[12px]">
                                {(trade.lot || 0).toLocaleString()}
                              </p>
                              <p className="text-[7px] text-gray-700 uppercase font-header font-black mt-1 tracking-widest">Capacity</p>
                            </td>

                            {/* Entry / P&L */}
                            <td className="py-4 px-4 w-[18%] text-right font-mono">
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
                            <td className="py-4 px-4 w-[12%] text-center">
                              <span className={`text-[8px] font-header font-black uppercase px-3 py-1 border transition-all ${
                                trade.status === "PENDING" ? "text-gray-700 border-gray-800" :
                                trade.status === "OPEN"    ? "text-[#f0c040] border-[#f0c040]/40 group-hover:bg-[#f0c040]/5" :
                                "text-white/20 border-white/5"
                              }`}>
                                {trade.status === "OPEN" ? "OPEN 🧠" : trade.status}
                              </span>
                            </td>
                          </motion.tr>

                          {/* Expandable AI Post-Mortem Feedback Card */}
                          <AnimatePresence>
                            {selectedFeedbackTradeId === trade.id && (() => {
                              const ai = generateAIFeedback(trade, pnlValue);
                              return (
                                <tr className="bg-transparent border-none">
                                  <td colSpan="6" className="py-2 px-1 border-none bg-transparent">
                                    <motion.div 
                                      initial={{ opacity: 0, y: -8, height: 0 }}
                                      animate={{ opacity: 1, y: 0, height: "auto" }}
                                      exit={{ opacity: 0, y: -8, height: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="p-5 border border-white/5 bg-[#030308]/90 rounded-sm text-left mb-2 overflow-hidden shadow-[inset_0_1px_10px_rgba(255,255,255,0.02)] mt-1"
                                    >
                                      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                                        <div className="flex items-center gap-2.5">
                                          <div className="p-1.5 bg-[#f0c040]/10 border border-[#f0c040]/30 text-[#f0c040] animate-pulse rounded-sm">
                                            <Brain size={12} />
                                          </div>
                                          <div>
                                            <h4 className="text-[10px] font-header font-black text-white uppercase tracking-widest">Sovereign AI Post-Mortem Audit</h4>
                                            <p className="text-[7.5px] text-gray-500 font-mono uppercase mt-0.5">{ai.statusText}</p>
                                          </div>
                                        </div>
                                        <span className={`text-[9px] font-mono font-black px-2.5 py-1 border rounded-sm ${isPositive ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                                          Grade: {ai.grade}
                                        </span>
                                      </div>

                                      <div className="text-[10px] font-mono leading-relaxed text-gray-400 mb-4 bg-black/30 p-4 border border-white/5 rounded-sm">
                                        <span className="text-[#f0c040] font-bold block mb-1.5 uppercase tracking-wider text-[8.5px]">🔍 Technical Analysis:</span>
                                        {ai.analysis}
                                      </div>

                                      <div className="text-[9.5px] font-mono leading-relaxed p-4 border border-white/5 bg-white/[0.01] rounded-sm">
                                        <span className="text-white font-bold block mb-1.5 uppercase tracking-wider text-[8.5px]">💡 Tactical Recommendation:</span>
                                        <span className={isPositive ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>{ai.recommendation}</span>
                                      </div>
                                    </motion.div>
                                  </td>
                                </tr>
                              );
                            })()}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
         </div>
        </div>
      )}
    </div>
  );
}
