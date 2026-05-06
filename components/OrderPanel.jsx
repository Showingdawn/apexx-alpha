"use client";
import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/firebase";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Zap, AlertCircle, ToggleLeft, ToggleRight, Info } from "lucide-react";

const ASSETS = [
  { symbol: "Nifty 50",    name: "Nifty 50",    category: "Indices" },
  { symbol: "Bank Nifty",  name: "Bank Nifty",  category: "Indices" },
  { symbol: "S&P 500",     name: "S&P 500",     category: "Indices" },
  { symbol: "NASDAQ 100",  name: "NASDAQ 100",  category: "Indices" },
  { symbol: "BTC-USD",     name: "Bitcoin",     category: "Crypto" },
  { symbol: "ETH-USD",     name: "Ethereum",    category: "Crypto" },
  { symbol: "SOL-USD",     name: "Solana",      category: "Crypto" },
  { symbol: "RELIANCE",    name: "Reliance",    category: "NSE" },
  { symbol: "TCS",         name: "TCS",         category: "NSE" },
  { symbol: "HDFC BANK",   name: "HDFC Bank",   category: "NSE" },
  { symbol: "INFOSYS",     name: "Infosys",     category: "NSE" },
  { symbol: "NVIDIA",      name: "Nvidia",      category: "US Tech" },
  { symbol: "TESLA",       name: "Tesla",       category: "US Tech" },
  { symbol: "APPLE",       name: "Apple",       category: "US Tech" },
  { symbol: "Gold",        name: "Gold",        category: "Commodities" },
  { symbol: "Crude Oil",   name: "Crude Oil",   category: "Commodities" },
  { symbol: "USD/INR",     name: "USD/INR",     category: "Forex" },
];

// ─── Brokerage calculator (Zerodha model) ────────────────
function calcFees(tradeValue) {
  const stt       = tradeValue * 0.001;                    // 0.1% STT
  const brokerage = Math.min(20, tradeValue * 0.0003);    // ₹20 cap
  const gst       = brokerage * 0.18;                     // 18% GST on brokerage
  const total     = stt + brokerage + gst;
  return { stt, brokerage, gst, total };
}

export default function OrderPanel({
  setOptimisticTrades,
  selectedAsset,
  onAssetChange,
  slPrice,
  tpPrice,
  balance,
  currentPrice,
  isLocked,
  lockTime,
  isTrailing,
  setIsTrailing,
  onTrade,
}) {
  const [lot, setLot]                       = useState("1");
  const [loading, setLoading]               = useState(false);
  const [isPanic, setIsPanic]               = useState(false);
  const [brokerageEnabled, setBrokerageEnabled] = useState(true);
  const [trailPercent, setTrailPercent]     = useState(1);

  const lotValue    = parseFloat(lot) || 0;
  const safePrice   = currentPrice || 1; // Prevent division by zero
  const tradeValue  = lotValue * safePrice;
  const fees        = brokerageEnabled ? calcFees(tradeValue) : null;
  const marginRequired = tradeValue / 5;
  const riskRatio   = (balance > 0) ? (tradeValue / balance) : 0;
  const isHighRisk  = riskRatio > 0.5;

  const estProfit = tpPrice > 0 ? (Math.abs(tpPrice - safePrice) * lotValue).toFixed(2) : "0.00";
  const estLoss   = slPrice  > 0 ? (Math.abs(safePrice - slPrice) * lotValue).toFixed(2)  : "0.00";

  const isPreset = ASSETS.some(a => a.symbol === selectedAsset);
  const categories = [...new Set(ASSETS.map(a => a.category))];

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  async function handleCloseAll() {
    setIsPanic(true);
    if (onTrade) onTrade();
    toast.loading("Initiating Global Liquidation...");
    setTimeout(() => {
      setOptimisticTrades([]);
      setIsPanic(false);
      toast.dismiss();
      toast.success("Emergency Exit Sequence Complete");
    }, 1500);
  }

  async function handleTrade(type, e) {
    if (!auth.currentUser) return toast.error("Must be logged in to trade");
    if (onTrade) onTrade();

    const tempId = `pending-${Date.now()}`;
    const newPendingTrade = {
      id: tempId, asset: selectedAsset, type,
      lot: Number(lot), pnl: 0, status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    setOptimisticTrades(prev => [newPendingTrade, ...prev]);
    setLoading(true);

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.post("/api/trade", {
        type, lot: Number(lot), asset: selectedAsset, brokerageEnabled,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setOptimisticTrades(prev =>
        prev.map(t => t.id === tempId
          ? { ...t, status: "OPEN", id: res.data.tradeId, entryPrice: res.data.entryPrice, fees: res.data.fees }
          : t
        )
      );
      toast.success(res.data.message);
    } catch (err) {
      setOptimisticTrades(prev => prev.filter(t => t.id !== tempId));
      toast.error("Trade failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 h-full flex flex-col font-body relative overflow-hidden bg-[#020205]">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#f0c040] opacity-[0.03] blur-[100px] rounded-full -mr-24 -mt-24 pointer-events-none" />

      {/* Lock overlay */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-[#020205]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-10 text-center"
          >
            <div className="p-6 border border-[#f0c040]/30 text-[#f0c040] mb-6">
              <ShieldCheck size={40} />
            </div>
            <h3 className="text-[#f0c040] font-header font-black text-[11px] uppercase tracking-[0.4em] mb-4">Discipline Protocol Active</h3>
            <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mb-10 max-w-[200px] leading-loose">Daily liquidation threshold breached. Access revoked.</p>
            <span className="text-5xl font-black font-mono text-white tracking-tighter">{formatTime(lockTime)}</span>
            <span className="text-[8px] text-gray-700 uppercase font-header font-black tracking-[0.5em] mt-4">Cool-off Matrix</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar pb-4 ${isLocked ? "blur-sm grayscale opacity-30 select-none pointer-events-none" : ""}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-[#f0c040]/30 text-[#f0c040]">
              <Zap size={15} />
            </div>
            <div>
               <h2 className="text-white font-header font-black text-[11px] uppercase tracking-[0.2em]">Execution Terminal</h2>
               <p className="text-[8px] text-gray-700 font-mono uppercase tracking-widest mt-0.5">Vanguard Alpha v6.2</p>
            </div>
          </div>
          <button
            onClick={handleCloseAll}
            className={`text-[9px] font-header font-black uppercase px-4 py-2 border transition-all ${isPanic ? "bg-[#ff1744] text-white border-[#ff1744] animate-pulse" : "bg-black text-[#ff1744] border-[#ff1744]/30 hover:bg-[#ff1744]/10"}`}
          >
            Liquidate All
          </button>
        </div>

        {/* TP/SL preview grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-white/[0.02] border border-white/5 group hover:border-[#00e676]/30 transition-all">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[8px] text-gray-600 uppercase font-header font-black tracking-widest">Alpha Target</p>
              <p className="text-[8px] text-[#00e676] font-mono font-black">+${estProfit}</p>
            </div>
            <p className="text-lg text-white font-mono font-black tracking-tighter">${tpPrice || "0.00"}</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 group hover:border-[#ff1744]/30 transition-all">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[8px] text-gray-600 uppercase font-header font-black tracking-widest">Risk Floor</p>
              <p className="text-[8px] text-[#ff1744] font-mono font-black">-${estLoss}</p>
            </div>
            <p className="text-lg text-white font-mono font-black tracking-tighter">${slPrice || "0.00"}</p>
          </div>
        </div>

        {/* Asset selection container */}
        <div className="mb-6">
          <label className="text-[9px] text-gray-700 uppercase font-header font-black tracking-[0.2em] block mb-3">Asset Matrix</label>
          <div className="relative">
            <select
              value={isPreset ? selectedAsset : "custom"}
              onChange={e => onAssetChange(e.target.value)}
              className="w-full p-4 bg-black/80 border border-white/10 rounded-none focus:outline-none focus:border-[#f0c040]/50 text-white transition-all text-[11px] font-header font-black tracking-[0.1em] appearance-none cursor-pointer uppercase"
            >
              {categories.map(cat => (
                <optgroup key={cat} label={cat.toUpperCase()} className="bg-[#020205] text-[#f0c040]">
                  {ASSETS.filter(a => a.category === cat).map(asset => (
                    <option key={asset.symbol} value={asset.symbol} className="text-white">{asset.name}</option>
                  ))}
                </optgroup>
              ))}
              {!isPreset && <option value="custom">{selectedAsset}</option>}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#f0c040]">
              <ShieldCheck size={14} />
            </div>
          </div>
        </div>

        {/* Lot size implementation */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="text-[9px] text-gray-700 uppercase font-header font-black tracking-[0.2em]">Position Size (LOT)</label>
            <div className="flex gap-2">
              {["25", "50", "MAX"].map(pc => (
                <button key={pc}
                  onClick={() => {
                    const factor = pc === "MAX" ? 1 : parseFloat(pc) / 100;
                    setLot(((balance * 5 * factor) / (currentPrice || 1)).toFixed(2));
                  }}
                  className="text-[8px] font-header font-black px-2 py-1 bg-white/5 border border-white/10 hover:border-[#f0c040]/40 hover:text-[#f0c040] transition-all uppercase"
                >
                  {pc === "MAX" ? "MAX" : `${pc}%`}
                </button>
              ))}
            </div>
          </div>
          <div className="relative group">
            <input
              type="number" step="0.01" value={lot}
              onChange={e => setLot(e.target.value)}
              className={`w-full p-5 bg-black/80 border rounded-none focus:outline-none transition-all font-mono text-4xl font-black text-center ${isHighRisk ? "border-[#ff1744] text-[#ff1744] shadow-[0_0_20px_rgba(255,23,68,0.1)]" : "border-white/10 focus:border-[#f0c040]/50 text-white"}`}
            />
          </div>
          
          {/* Risk profile matrix */}
          <div className="mt-4 p-5 bg-white/[0.01] border border-white/5">
            <div className="flex justify-between text-[9px] font-header font-black mb-3">
              <span className="text-gray-700 uppercase tracking-[0.2em]">Risk Exposure</span>
              <span className={isHighRisk ? "text-[#ff1744]" : "text-[#f0c040]"}>
                {(riskRatio * 100).toFixed(1)}% CAP
              </span>
            </div>
            <div className="w-full h-[2px] bg-white/5 overflow-hidden mb-4">
              <motion.div
                animate={{ width: `${Math.min(riskRatio * 100, 100)}%` }}
                className={`h-full ${isHighRisk ? "bg-[#ff1744] shadow-[0_0_10px_#ff1744]" : "bg-[#f0c040] shadow-[0_0_10px_#f0c040]"}`}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-gray-700 uppercase">Margin Requirement</span>
              <span className="text-white font-black">${marginRequired.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {isHighRisk && (
              <div className="mt-4 text-[9px] text-[#ff1744] font-header font-black uppercase flex items-center justify-center gap-2 border border-[#ff1744]/20 py-2 animate-pulse bg-[#ff1744]/5">
                <AlertCircle size={11} /> Margin Critical Warning
              </div>
            )}
          </div>
        </div>

        {/* Trailing components */}
        <div className={`mb-4 p-4 border transition-all ${isTrailing ? "border-[#f0c040]/50 bg-[#f0c040]/5" : "border-white/5 bg-white/[0.01]"}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${isTrailing ? "bg-[#f0c040] shadow-[0_0_8px_#f0c040] animate-pulse" : "bg-gray-800"}`} />
              <span className="text-[10px] font-header font-black uppercase tracking-[0.2em] text-white">Trailing Protocol</span>
            </div>
            <button onClick={() => setIsTrailing(prev => !prev)} className="group">
              {isTrailing
                ? <ToggleRight size={24} className="text-[#f0c040]" />
                : <ToggleLeft  size={24} className="text-gray-800 group-hover:text-gray-600" />
              }
            </button>
          </div>
          {isTrailing ? (
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-[#f0c040]/80 font-mono uppercase tracking-widest">Offset Step:</p>
              <select
                value={trailPercent}
                onChange={e => setTrailPercent(parseFloat(e.target.value))}
                className="text-[10px] font-mono font-black bg-black border border-[#f0c040]/30 text-[#f0c040] px-2 py-0.5 outline-none cursor-pointer"
              >
                {[0.5, 1, 1.5, 2].map(p => (
                  <option key={p} value={p}>{p}%</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-[9px] text-gray-700 font-mono uppercase tracking-widest leading-loose">Automated Profit Capture Inactive</p>
          )}
        </div>

        {/* Fee structure transparency */}
        <div className={`p-4 border transition-all ${brokerageEnabled ? "border-[#ff1744]/30 bg-[#ff1744]/3" : "border-white/5 bg-white/[0.01]"}`}>
          <div className="flex items-center justify-between mb-3">
             <span className="text-[10px] font-header font-black uppercase tracking-[0.2em] text-white">Simulation Fidelity</span>
             <button onClick={() => setBrokerageEnabled(prev => !prev)}>
              {brokerageEnabled
                ? <ToggleRight size={20} className="text-[#ff1744]" />
                : <ToggleLeft  size={20} className="text-gray-800" />
              }
            </button>
          </div>
          {brokerageEnabled && fees && tradeValue > 0 ? (
            <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
              <div className="flex justify-between text-[9px] font-mono text-gray-600 uppercase"><span>STT [0.1%]</span><span className="text-[#ff1744]">-${fees.stt.toFixed(2)}</span></div>
              <div className="flex justify-between text-[9px] font-mono text-gray-600 uppercase"><span>Brokerage Matrix</span><span className="text-[#ff1744]">-${fees.brokerage.toFixed(2)}</span></div>
              <div className="flex justify-between text-[9px] font-mono text-gray-800 font-black pt-1 border-t border-white/5"><span>Total Yield Cost</span><span className="text-[#ff1744]">-${fees.total.toFixed(2)}</span></div>
            </div>
          ) : (
             <p className="text-[9px] text-gray-700 font-mono uppercase tracking-widest">{brokerageEnabled ? "Re-calibrating Neural Links..." : "Zero-cost alpha mode active"}</p>
          )}
        </div>
      </div>

      {/* Primary Action Suite */}
      <div className="flex flex-col gap-4 pt-6 border-t border-white/5 bg-[#020205]">
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={e => handleTrade("BUY", e)}
            disabled={loading || isLocked}
            className="group relative overflow-hidden bg-[#00e676] hover:brightness-110 disabled:opacity-30 text-black font-header font-black tracking-[0.2em] uppercase transition-all py-5 border-none shadow-[0_10px_30px_rgba(0,230,118,0.15)] flex flex-col items-center justify-center gap-1"
          >
            <span className="text-[13px]">BULLISH</span>
            <span className="text-[8px] opacity-60">Long α</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={e => handleTrade("SELL", e)}
            disabled={loading || isLocked}
            className="group relative overflow-hidden bg-[#ff1744] hover:brightness-110 disabled:opacity-30 text-white font-header font-black tracking-[0.2em] uppercase transition-all py-5 border-none shadow-[0_10px_30px_rgba(255,23,68,0.15)] flex flex-col items-center justify-center gap-1"
          >
            <span className="text-[13px]">BEARISH</span>
            <span className="text-[8px] opacity-60">Short β</span>
          </motion.button>
        </div>
        <div className="flex items-center justify-center gap-4 opacity-30 group cursor-none">
          <div className="h-px w-8 bg-gray-800 group-hover:bg-[#f0c040] transition-all" />
          <span className="text-[8px] uppercase tracking-[0.6em] font-header font-black text-white group-hover:text-[#f0c040] transition-all">Sovereign Elite Tier Active</span>
          <div className="h-px w-8 bg-gray-800 group-hover:bg-[#f0c040] transition-all" />
        </div>
      </div>
    </div>
  );
}
