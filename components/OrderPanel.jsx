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
}) {
  const [lot, setLot]                       = useState("1");
  const [loading, setLoading]               = useState(false);
  const [isPanic, setIsPanic]               = useState(false);
  const [brokerageEnabled, setBrokerageEnabled] = useState(true);
  const [trailPercent, setTrailPercent]     = useState(1);

  const lotValue    = parseFloat(lot) || 0;
  const tradeValue  = lotValue * (currentPrice || 0);
  const fees        = brokerageEnabled ? calcFees(tradeValue) : null;
  const marginRequired = tradeValue / 5;
  const riskRatio   = balance > 0 ? tradeValue / balance : 0;
  const isHighRisk  = riskRatio > 0.5;

  const estProfit = tpPrice > 0 ? (Math.abs(tpPrice - currentPrice) * lotValue).toFixed(2) : "0.00";
  const estLoss   = slPrice  > 0 ? (Math.abs(currentPrice - slPrice) * lotValue).toFixed(2)  : "0.00";

  const isPreset = ASSETS.some(a => a.symbol === selectedAsset);
  const categories = [...new Set(ASSETS.map(a => a.category))];

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  function triggerRipple(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "success-ripple";
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top  = `${e.clientY - rect.top}px`;
    e.currentTarget.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
  }

  async function handleCloseAll() {
    setIsPanic(true);
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
    triggerRipple(e);

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
      const res = await axios.post("http://localhost:3001/api/trade", {
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
    <div className="glass-panel p-5 h-full flex flex-col border border-[var(--gold-glow)] shadow-2xl relative overflow-hidden backdrop-blur-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--gold)] opacity-[0.05] blur-3xl rounded-full -mr-16 -mt-16" />

      {/* Lock overlay */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#050505]/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="p-4 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-4">
              <ShieldCheck className="text-[#D4AF37]" size={32} />
            </div>
            <h3 className="text-[#D4AF37] font-black text-xs uppercase tracking-[0.3em] mb-2">Discipline Lock Active</h3>
            <p className="text-[10px] text-gray-500 font-bold mb-6">Daily loss threshold exceeded.</p>
            <span className="text-4xl font-black font-mono text-white">{formatTime(lockTime)}</span>
            <span className="text-[8px] text-gray-700 uppercase font-black tracking-widest mt-1">Cool-off Duration</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar pb-4 ${isLocked ? "blur-sm grayscale opacity-30 select-none pointer-events-none" : ""}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#D4AF37]/10 rounded border border-[#D4AF37]/30 text-[#D4AF37]">
              <Zap size={13} />
            </div>
            <h2 className="text-white font-black text-xs uppercase tracking-[0.2em]">Precision Terminal</h2>
          </div>
          <button
            onClick={handleCloseAll}
            className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border transition-all ${isPanic ? "bg-[#FF3131] text-white border-white animate-pulse" : "bg-[#0a0a0a] text-[#FF3131] border-[#FF3131]/30 hover:bg-[#FF3131]/10"}`}
          >
            Liquidate All
          </button>
        </div>

        {/* TP/SL preview */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[8px] text-gray-600 uppercase font-black">Target TP</p>
              <p className="text-[8px] text-[#00FF94] font-black">+${estProfit}</p>
            </div>
            <p className="text-[12px] text-white font-mono font-black">${tpPrice || "---"}</p>
          </div>
          <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[8px] text-gray-600 uppercase font-black">Safety SL</p>
              <p className="text-[8px] text-[#FF3131] font-black">-${estLoss}</p>
            </div>
            <p className="text-[12px] text-white font-mono font-black">${slPrice || "---"}</p>
          </div>
        </div>

        {/* Asset selector */}
        <div className="mb-4">
          <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2 font-black">Asset</label>
          <div className="relative">
            <select
              value={isPreset ? selectedAsset : "custom"}
              onChange={e => onAssetChange(e.target.value)}
              className="w-full p-3 bg-black/60 border border-white/10 rounded-xl focus:outline-none focus:border-[#D4AF37]/50 text-white transition-all text-sm font-bold appearance-none cursor-pointer"
            >
              {categories.map(cat => (
                <optgroup key={cat} label={cat.toUpperCase()} className="bg-[#050505] text-[#D4AF37]">
                  {ASSETS.filter(a => a.category === cat).map(asset => (
                    <option key={asset.symbol} value={asset.symbol} className="text-white">{asset.name}</option>
                  ))}
                </optgroup>
              ))}
              {!isPreset && <option value="custom">{selectedAsset}</option>}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
              <ShieldCheck size={13} />
            </div>
          </div>
        </div>

        {/* Lot size */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Size (LOT)</label>
            <div className="flex gap-1">
              {["25", "50", "MAX"].map(pc => (
                <button key={pc}
                  onClick={() => {
                    const factor = pc === "MAX" ? 1 : parseFloat(pc) / 100;
                    setLot(((balance * 5 * factor) / (currentPrice || 1)).toFixed(2));
                  }}
                  className="text-[8px] font-black px-1.5 py-0.5 rounded bg-white/5 border border-white/10 hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] transition-all"
                >
                  {pc === "MAX" ? "MAX" : `${pc}%`}
                </button>
              ))}
            </div>
          </div>
          <input
            type="number" step="0.01" value={lot}
            onChange={e => setLot(e.target.value)}
            className={`w-full p-3 bg-black/50 border rounded-xl focus:outline-none transition-all font-mono text-2xl font-black text-center ${isHighRisk ? "border-[#FF3131] text-[#FF3131]" : "border-white/5 focus:border-[#D4AF37] text-white"}`}
          />
          {/* Risk bar */}
          <div className="mt-3 p-3 bg-black/40 border border-white/5 rounded-xl">
            <div className="flex justify-between text-[9px] font-bold mb-2">
              <span className="text-gray-600 uppercase tracking-widest">Risk Profile</span>
              <span className={isHighRisk ? "text-[#FF3131] font-black" : "text-gray-400"}>
                {(riskRatio * 100).toFixed(1)}% Cap
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden mb-2">
              <motion.div
                animate={{ width: `${Math.min(riskRatio * 100, 100)}%` }}
                className={`h-full ${isHighRisk ? "bg-[#FF3131] shadow-[0_0_8px_#FF3131]" : "bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"}`}
              />
            </div>
            <div className="flex justify-between text-[9px]">
              <span className="text-gray-600 uppercase">Margin Req.</span>
              <span className="text-white font-mono">${marginRequired.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {isHighRisk && (
              <div className="mt-2 text-[8px] text-[#FF3131] font-black uppercase flex items-center gap-1 border-t border-[#FF3131]/10 pt-2 animate-pulse">
                <AlertCircle size={10} /> Liquidation exposure critical
              </div>
            )}
          </div>
        </div>

        {/* ─── Trailing Stop Loss ─────────────────────────────── */}
        <div className={`mb-4 p-3 rounded-xl border transition-all ${isTrailing ? "border-[#D4AF37]/40 bg-[#D4AF37]/5 trailing-active" : "border-white/5 bg-black/40"}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isTrailing ? "bg-[#D4AF37] animate-pulse" : "bg-gray-700"}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Trailing Stop Loss</span>
            </div>
            <button onClick={() => setIsTrailing(prev => !prev)} className="transition-colors">
              {isTrailing
                ? <ToggleRight size={22} className="text-[#D4AF37]" />
                : <ToggleLeft  size={22} className="text-gray-600" />
              }
            </button>
          </div>
          {isTrailing ? (
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-[#D4AF37]/80 font-bold">SL trails price up by:</p>
              <select
                value={trailPercent}
                onChange={e => setTrailPercent(parseFloat(e.target.value))}
                className="text-[10px] font-black font-mono bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg px-2 py-0.5 outline-none cursor-pointer"
              >
                {[0.5, 1, 1.5, 2].map(p => (
                  <option key={p} value={p}>{p}%</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-[9px] text-gray-600">Enable to lock profits as price rises</p>
          )}
        </div>

        {/* ─── Brokerage & GST Toggle ──────────────────────────── */}
        <div className={`mb-2 p-3 rounded-xl border transition-all ${brokerageEnabled ? "border-[#FF3131]/20 bg-[#FF3131]/3" : "border-white/5 bg-black/40"}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Brokerage & GST</span>
              <span className="text-[8px] bg-[#FF3131]/10 text-[#FF3131] border border-[#FF3131]/20 rounded px-1 py-0.5 font-black uppercase">
                Realistic
              </span>
            </div>
            <button onClick={() => setBrokerageEnabled(prev => !prev)} className="transition-colors">
              {brokerageEnabled
                ? <ToggleRight size={20} className="text-[#FF3131]" />
                : <ToggleLeft  size={20} className="text-gray-600" />
              }
            </button>
          </div>
          {brokerageEnabled && fees && tradeValue > 0 && (
            <div>
              <div className="fee-row"><span>STT (0.1%)</span><span>-${fees.stt.toFixed(3)}</span></div>
              <div className="fee-row"><span>Brokerage (₹20 cap)</span><span>-${fees.brokerage.toFixed(2)}</span></div>
              <div className="fee-row"><span>GST (18%)</span><span>-${fees.gst.toFixed(3)}</span></div>
              <div className="fee-row fee-total"><span>TOTAL FEES</span><span>-${fees.total.toFixed(2)}</span></div>
            </div>
          )}
          {brokerageEnabled && tradeValue === 0 && (
            <p className="text-[9px] text-gray-600 italic">Enter lot size to see fee breakdown</p>
          )}
          {!brokerageEnabled && (
            <p className="text-[9px] text-gray-600">Paper trading — no fees applied</p>
          )}
        </div>
      </div>

      {/* ─── Execute Buttons ─────────────────────────────────── */}
      <div className="flex flex-col gap-3 pt-3 border-t border-white/5">
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={e => handleTrade("BUY", e)}
            disabled={loading || isLocked}
            className="group relative overflow-hidden bg-[#00FF94] hover:brightness-110 disabled:opacity-50 text-black font-black tracking-[0.15em] uppercase transition-all p-4 rounded-2xl text-[11px] h-16 flex flex-col items-center justify-center gap-0.5"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
            <span className="text-[13px]">BULLISH</span>
            <span className="text-[9px]">Initiate Long</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={e => handleTrade("SELL", e)}
            disabled={loading || isLocked}
            className="group relative overflow-hidden bg-[#FF3131] hover:brightness-110 disabled:opacity-50 text-white font-black tracking-[0.15em] uppercase transition-all p-4 rounded-2xl text-[11px] h-16 flex flex-col items-center justify-center gap-0.5 shadow-[0_4px_20px_rgba(255,49,49,0.2)]"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />
            <span className="text-[13px]">BEARISH</span>
            <span className="text-[9px]">Initiate Short</span>
          </motion.button>
        </div>
        <div className="flex items-center justify-center gap-2 opacity-20">
          <ShieldCheck size={9} className="text-gray-500" />
          <span className="text-[8px] uppercase tracking-[0.3em] font-black">Apex Institutional V5</span>
        </div>
      </div>
    </div>
  );
}
