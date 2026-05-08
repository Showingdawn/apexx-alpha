"use client";
import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/firebase";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Zap, AlertCircle, ToggleLeft, ToggleRight, Info, Lock } from "lucide-react";
import { playMechanicalClick } from "@/utils/sound";

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
  setBalance,
  currentPrice,
  isLocked,
  lockTime,
  isTrailing,
  setIsTrailing,
  onTrade,
  setActiveInsight = () => {},
}) {
  const [lot, setLot]                       = useState("1");
  const [loading, setLoading]               = useState(false);
  const [isPanic, setIsPanic]               = useState(false);
  const [brokerageEnabled, setBrokerageEnabled] = useState(true);
  const [trailPercent, setTrailPercent]     = useState(1);
  const [leverage, setLeverage]             = useState(1);

  const lotValue    = parseFloat(lot) || 0;
  const safePrice   = currentPrice || 1; // Prevent division by zero

  const [isAdvancedUnlocked, setIsAdvancedUnlocked] = useState(false);
  useEffect(() => {
    const lvl3Completed = localStorage.getItem("apex_lvl3_index");
    if (lvl3Completed && Number(lvl3Completed) >= 7) {
      setIsAdvancedUnlocked(true);
    }
  }, []);


  const tradeValue  = lotValue * safePrice;
  const fees        = brokerageEnabled ? calcFees(tradeValue) : null;
  const marginRequired = tradeValue > 0 ? tradeValue / leverage : 0;
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
      let refundedTotal = 0;
      let closedCount = 0;

      const localTrades = localStorage.getItem("apex_local_trades");
      let tradesArray = [];
      if (localTrades) {
        try { tradesArray = JSON.parse(localTrades); } catch (e) {}
      }

      const updatedTrades = tradesArray.map(t => {
        if (t.status === "OPEN") {
          closedCount++;
          const livePrice = currentPrice || t.entryPrice || 100;
          const spread = t.type === "BUY" ? livePrice - t.entryPrice : t.entryPrice - livePrice;
          const localPnl = spread * t.lot - (t.fees?.total ?? 0);
          refundedTotal += (livePrice * t.lot);
          return { ...t, status: "CLOSED", exitPrice: livePrice, pnl: localPnl };
        }
        return t;
      });

      if (closedCount > 0) {
        const newBal = balance + refundedTotal;
        if (setBalance) {
          setBalance(newBal);
          localStorage.setItem("apex_local_balance", newBal.toString());
        }
        setOptimisticTrades(updatedTrades);
        localStorage.setItem("apex_local_trades", JSON.stringify(updatedTrades));
        toast.dismiss();
        toast.success(`Global Liquidation Complete! closed ${closedCount} positions.`);
      } else {
        toast.dismiss();
        toast.error("No active positions to liquidate.");
      }
      setIsPanic(false);
    }, 1200);
  }

  async function handleTrade(type, e) {
    playMechanicalClick();
    if (onTrade) onTrade();

    const tempId = `trade-${Date.now()}`;
    const entryPrice = currentPrice || 100;
    const totalCost = entryPrice * lotValue;
    const marginRequired = totalCost / leverage;
    const tradeFees = fees?.total ?? 0;
    const totalDeduction = marginRequired + tradeFees;

    if (type === "BUY" && balance < totalDeduction) {
      return toast.error(`Insufficient Buying Power. Required: $${totalDeduction.toFixed(2)}`);
    }

    const newPendingTrade = {
      id: tempId,
      asset: selectedAsset,
      type,
      lot: Number(lot),
      entryPrice,
      exitPrice: null,
      pnl: 0,
      leverage,
      status: "OPEN",
      fees: fees ?? null,
      createdAt: new Date().toISOString(),
    };

    setOptimisticTrades(prev => [newPendingTrade, ...prev]);

    // Save to localStorage
    const localTrades = localStorage.getItem("apex_local_trades");
    let tradesArray = [];
    if (localTrades) {
      try { tradesArray = JSON.parse(localTrades); } catch (e) {}
    }
    tradesArray = [newPendingTrade, ...tradesArray];
    localStorage.setItem("apex_local_trades", JSON.stringify(tradesArray));

    // Update Balance
    const newBal = type === "BUY"
      ? balance - totalDeduction
      : balance + marginRequired - tradeFees;
    if (setBalance) {
      setBalance(newBal);
      localStorage.setItem("apex_local_balance", newBal.toString());
    }

    if (!auth.currentUser) {
      toast.success(`${type} executed successfully (Local Sovereign Mode)`);
      return;
    }

    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.post("/api/trade", {
        type, lot: Number(lot), asset: selectedAsset, brokerageEnabled, leverage,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setOptimisticTrades(prev =>
        prev.map(t => t.id === tempId
          ? { ...t, status: "OPEN", id: res.data.tradeId, entryPrice: res.data.entryPrice, fees: res.data.fees }
          : t
        )
      );

      // Re-sync local storage with updated trade ID
      const latestTrades = localStorage.getItem("apex_local_trades");
      if (latestTrades) {
        try {
          const arr = JSON.parse(latestTrades);
          const updatedArr = arr.map(t => t.id === tempId ? { ...t, id: res.data.tradeId } : t);
          localStorage.setItem("apex_local_trades", JSON.stringify(updatedArr));
        } catch (e) {}
      }

      toast.success(res.data.message);
    } catch (err) {
      console.warn("Backend trade post failed, trade remains on local ledger", err);
      toast.success(`${type} executed successfully on local ledger`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 h-full flex flex-col font-body relative overflow-hidden bg-[#020205]">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#ffffff] opacity-[0.03] blur-[100px] rounded-full -mr-24 -mt-24 pointer-events-none" />

      {/* Lock overlay */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-[#020205]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-10 text-center"
          >
            <div className="p-6 border border-[#ffffff]/30 text-[#ffffff] mb-6">
              <ShieldCheck size={40} />
            </div>
            <h3 className="text-[#ffffff] font-header font-black text-[11px] uppercase tracking-[0.4em] mb-4">Discipline Protocol Active</h3>
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
            <div className="p-2 border border-[#ffffff]/30 text-[#ffffff]">
              <Zap size={15} />
            </div>
            <div>
               <h2 className="text-white font-header font-black text-[11px] uppercase tracking-[0.2em]">Execution Terminal</h2>
               <p className="text-[8px] text-gray-700 font-mono uppercase tracking-widest mt-0.5">Vanguard Alpha v6.2</p>
            </div>
          </div>
          <div className="relative group/liquidate">
            <div className="absolute right-0 top-full mt-2 hidden group-hover/liquidate:block w-48 bg-[#0A0A0A] border border-[#FF3131]/30 p-2 z-50 shadow-2xl pointer-events-none text-right">
              <p className="text-[10px] font-header text-[#FF3131] uppercase tracking-[0.1em] mb-1 font-bold">Liquidate All Positions</p>
              <p className="text-[10px] text-gray-400 font-mono leading-tight">Instantly closes all your open trades at the current market price. Use this to quickly exit the market during extreme volatility or to lock in overall P&L.</p>
            </div>
            <button
              onClick={handleCloseAll}
              className={`text-[9px] font-header font-black uppercase px-4 py-2 border transition-all ${isPanic ? "bg-[#FF3131] text-white border-[#FF3131] animate-pulse" : "bg-black text-[#FF3131] border-[#FF3131]/30 hover:bg-[#FF3131]/10"}`}
            >
              Liquidate All
            </button>
          </div>
        </div>

        {/* TP/SL preview grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-white/[0.02] border border-white/5 relative group/tp hover:border-[#00FF41]/30 transition-all">
            <div className="absolute left-0 -top-2 -translate-y-full mb-2 hidden group-hover/tp:block w-48 bg-[#0A0A0A] border border-[#00FF41]/30 p-2 z-50 shadow-2xl pointer-events-none">
              <p className="text-[10px] font-header text-[#00FF41] uppercase tracking-[0.1em] mb-1 font-bold">Take Profit (TP)</p>
              <p className="text-[10px] text-gray-400 font-mono leading-tight">An automatic order to close your position once it reaches a specific profit level. It ensures you lock in gains before the market can reverse.</p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-[8px] text-gray-600 uppercase font-header font-black tracking-widest">Alpha Target</p>
              <p className="text-[8px] text-[#00FF41] font-mono font-black">+${estProfit}</p>
            </div>
            <p className="text-lg text-white font-mono font-black tracking-tighter">${tpPrice || "0.00"}</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 relative group/sl hover:border-[#FF3131]/30 transition-all">
            <div className="absolute right-0 -top-2 -translate-y-full mb-2 hidden group-hover/sl:block w-48 bg-[#0A0A0A] border border-[#FF3131]/30 p-2 z-50 shadow-2xl pointer-events-none text-right">
              <p className="text-[10px] font-header text-[#FF3131] uppercase tracking-[0.1em] mb-1 font-bold">Stop Loss (SL)</p>
              <p className="text-[10px] text-gray-400 font-mono leading-tight">An automatic order designed to limit your losses. It closes your position if the price moves against you to a certain level, protecting your account from large drawdowns.</p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-[8px] text-gray-600 uppercase font-header font-black tracking-widest">Risk Floor</p>
              <p className="text-[8px] text-[#FF3131] font-mono font-black">-${estLoss}</p>
            </div>
            <p className="text-lg text-white font-mono font-black tracking-tighter">${slPrice || "0.00"}</p>
          </div>
        </div>

        {/* Asset selection container */}
        <div className="mb-6 relative group/asset">
          <div className="absolute left-0 -top-2 -translate-y-full mb-2 hidden group-hover/asset:block w-48 bg-[#0A0A0A] border border-[#ffffff]/30 p-2 z-50 shadow-2xl pointer-events-none">
            <p className="text-[10px] font-header text-[#ffffff] uppercase tracking-[0.1em] mb-1 font-bold">Asset Selection</p>
            <p className="text-[10px] text-gray-400 font-mono leading-tight">Choose which financial instrument to trade. Different assets (like Crypto vs Indices) have different levels of volatility, liquidity, and trading hours.</p>
          </div>
          <label className="text-[9px] text-gray-700 uppercase font-header font-black tracking-[0.2em] flex items-center gap-1 mb-3 cursor-help">
             Asset Matrix <Info size={10} className="opacity-50" />
          </label>
          <div className="relative">
            <select
              value={isPreset ? selectedAsset : "custom"}
              onChange={e => onAssetChange(e.target.value)}
              className="w-full p-4 bg-black/80 border border-white/10 rounded-none focus:outline-none focus:border-[#ffffff]/50 text-white transition-all text-[11px] font-header font-black tracking-[0.1em] appearance-none cursor-pointer uppercase"
            >
              {categories.map(cat => (
                <optgroup key={cat} label={cat.toUpperCase()} className="bg-[#020205] text-[#ffffff]">
                  {ASSETS.filter(a => a.category === cat).map(asset => (
                    <option key={asset.symbol} value={asset.symbol} className="text-white">{asset.name}</option>
                  ))}
                </optgroup>
              ))}
              {!isPreset && <option value="custom">{selectedAsset}</option>}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#ffffff]">
              <ShieldCheck size={14} />
            </div>
          </div>
        </div>

        {/* Leverage Slider */}
        <div className="mb-6 group/lev relative">
          {!isAdvancedUnlocked && (
            <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center cursor-not-allowed group/levlock border border-[#FF3131]/20">
              <Lock size={12} className="text-[#FF3131] mb-1" />
              <div className="hidden group-hover/levlock:block absolute bottom-full mb-2 w-48 bg-[#0A0A0A] border border-[#FF3131]/30 p-2 z-50 shadow-2xl pointer-events-none">
                <p className="text-[10px] font-header text-[#FF3131] uppercase tracking-[0.1em] mb-1 font-bold">Execution Locked</p>
                <p className="text-[10px] text-gray-400 font-mono leading-tight">Complete Level 03: Alpha Generation in Apex Academy to unlock Advanced Execution.</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-3">
            <label className="text-[9px] text-gray-700 uppercase font-header font-black tracking-[0.2em] flex items-center gap-1 cursor-help">
              Tactical Leverage <Info size={10} className="opacity-50" />
            </label>
            <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-sm ${leverage > 50 ? "bg-red-500/20 text-red-400 animate-pulse" : leverage > 20 ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-white"}`}>
              {leverage}x
            </span>
          </div>

          <input 
            type="range" 
            min="1" max="100" step="1" 
            value={leverage} 
            disabled={!isAdvancedUnlocked}
            onMouseEnter={() => setActiveInsight("LEVERAGE_ADJUST")}
            onMouseLeave={() => setActiveInsight("IDLE")}
            onChange={(e) => {
              setLeverage(Number(e.target.value));
              setActiveInsight("LEVERAGE_ADJUST");
            }}
            className="w-full accent-[#00FF41] cursor-ew-resize h-1 bg-white/10 appearance-none rounded-none disabled:opacity-30"
          />

          {/* Recalculated Liquidation Matrix */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-[8px] font-mono border-t border-white/5 pt-2">
            <div>
              <span className="text-gray-600 uppercase block">Long Liquidation</span>
              <span className="text-emerald-400 font-black">
                ${(safePrice * (1 - 0.9 / leverage)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-gray-600 uppercase block">Short Liquidation</span>
              <span className="text-red-400 font-black">
                ${(safePrice * (1 + 0.9 / leverage)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Adaptive Hazard Warnings */}
          {leverage >= 25 && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-2.5 p-2 border text-[8px] font-mono uppercase font-black text-center ${leverage >= 60 ? "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}
            >
              {leverage >= 60 
                ? `💀 HIGH MARGIN HAZARD: liquidation within ${(0.9 / leverage * 100).toFixed(1)}% price deviation!` 
                : `⚠️ VOLATILITY SENSITIVE: moderate liquidation threat.`}
            </motion.div>
          )}

          <div className="absolute left-0 top-full mt-2 hidden group-hover/lev:block w-48 bg-[#0A0A0A] border border-[#ffffff]/30 p-2 z-50 shadow-2xl pointer-events-none">
            <p className="text-[10px] font-header text-[#ffffff] uppercase tracking-[0.1em] mb-1 font-bold">Leverage (Margin Trading)</p>
            <p className="text-[10px] text-gray-400 font-mono leading-tight">Leverage allows you to control a larger position with less capital. It amplifies both your potential profits and your potential losses. Higher leverage increases liquidation risk.</p>
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
                    setLot(((balance * leverage * factor) / (currentPrice || 1)).toFixed(2));
                  }}
                  className="text-[8px] font-header font-black px-2 py-1 bg-white/5 border border-white/10 hover:border-[#ffffff]/40 hover:text-[#ffffff] transition-all uppercase"
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
              className={`w-full p-5 bg-black/80 border rounded-none focus:outline-none transition-all font-mono text-4xl font-black text-center ${isHighRisk ? "border-[#FF3131] text-[#FF3131] shadow-[0_0_20px_rgba(255,23,68,0.1)]" : "border-white/10 focus:border-[#ffffff]/50 text-white"}`}
            />
          </div>
          
          {/* Risk profile matrix */}
          <div className="mt-4 p-5 bg-white/[0.01] border border-white/5 relative group/risk">
            <div className="absolute left-0 top-full mt-2 hidden group-hover/risk:block w-48 bg-[#0A0A0A] border border-[#ffffff]/30 p-2 z-50 shadow-2xl pointer-events-none">
              <p className="text-[10px] font-header text-[#ffffff] uppercase tracking-[0.1em] mb-1 font-bold">Position Sizing</p>
              <p className="text-[10px] text-gray-400 font-mono leading-tight">The percentage of your capital allocated to this single trade. Proper position sizing is crucial for risk management and surviving losing streaks.</p>
            </div>
            <div className="flex justify-between text-[9px] font-header font-black mb-3">
              <span className="text-gray-700 uppercase tracking-[0.2em]">Risk Exposure</span>
              <span className={isHighRisk ? "text-[#FF3131]" : "text-[#ffffff]"}>
                {(riskRatio * 100).toFixed(1)}% CAP
              </span>
            </div>
            <div className="w-full h-[2px] bg-white/5 overflow-hidden mb-4">
              <motion.div
                animate={{ width: `${Math.min(riskRatio * 100, 100)}%` }}
                className={`h-full ${isHighRisk ? "bg-[#FF3131] shadow-[0_0_10px_#FF3131]" : "bg-[#ffffff] shadow-[0_0_10px_#ffffff]"}`}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-gray-700 uppercase">Margin Requirement</span>
              <span className="text-white font-black">${marginRequired.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {isHighRisk && (
              <div className="mt-4 text-[9px] text-[#FF3131] font-header font-black uppercase flex items-center justify-center gap-2 border border-[#FF3131]/20 py-2 animate-pulse bg-[#FF3131]/5">
                <AlertCircle size={11} /> Margin Critical Warning
              </div>
            )}
          </div>
        </div>

        {/* Trailing components */}
        <div className={`mb-4 p-4 border transition-all relative group/trail ${isTrailing ? "border-[#ffffff]/50 bg-[#ffffff]/5" : "border-white/5 bg-white/[0.01]"}`}>
          {!isAdvancedUnlocked && (
            <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center cursor-not-allowed group/traillock">
              <div className="hidden group-hover/traillock:block absolute bottom-full mb-2 w-48 bg-[#0A0A0A] border border-[#FF3131]/30 p-2 z-50 shadow-2xl pointer-events-none">
                <p className="text-[10px] font-header text-[#FF3131] uppercase tracking-[0.1em] mb-1 font-bold">Execution Locked</p>
                <p className="text-[10px] text-gray-400 font-mono leading-tight">Complete Level 03: Alpha Generation in Apex Academy to unlock Advanced Execution.</p>
              </div>
            </div>
          )}
          <div className="absolute left-0 top-0 -translate-y-full mb-2 hidden group-hover/trail:block w-48 bg-[#0A0A0A] border border-[#ffffff]/30 p-2 z-50 shadow-2xl pointer-events-none">
            <p className="text-[10px] font-header text-[#ffffff] uppercase tracking-[0.1em] mb-1 font-bold">Trailing Stop</p>
            <p className="text-[10px] text-gray-400 font-mono leading-tight">A dynamic stop loss that automatically moves up as the asset's price rises in your favor. It allows you to lock in profits while letting the trade continue to grow.</p>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${isTrailing ? "bg-[#ffffff] shadow-[0_0_8px_#ffffff] animate-pulse" : "bg-gray-800"}`} />
              <span className="text-[10px] font-header font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">Trailing Protocol {!isAdvancedUnlocked && <Lock size={10} className="text-[#FF3131]" />}</span>
            </div>
            <button disabled={!isAdvancedUnlocked} onClick={() => setIsTrailing(prev => !prev)} className="group disabled:opacity-30">
              {isTrailing
                ? <ToggleRight size={24} className="text-[#ffffff]" />
                : <ToggleLeft  size={24} className="text-gray-800 group-hover:text-gray-600" />
              }
            </button>
          </div>
          {isTrailing ? (
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-[#ffffff]/80 font-mono uppercase tracking-widest">Offset Step:</p>
              <select
                value={trailPercent}
                onChange={e => setTrailPercent(parseFloat(e.target.value))}
                className="text-[10px] font-mono font-black bg-black border border-[#ffffff]/30 text-[#ffffff] px-2 py-0.5 outline-none cursor-pointer"
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
        <div className={`p-4 border transition-all relative group/fees ${brokerageEnabled ? "border-[#FF3131]/30 bg-[#FF3131]/3" : "border-white/5 bg-white/[0.01]"}`}>
          <div className="absolute left-0 top-0 -translate-y-full mb-2 hidden group-hover/fees:block w-48 bg-[#0A0A0A] border border-[#FF3131]/30 p-2 z-50 shadow-2xl pointer-events-none">
            <p className="text-[10px] font-header text-[#FF3131] uppercase tracking-[0.1em] mb-1 font-bold">Trading Costs</p>
            <p className="text-[10px] text-gray-400 font-mono leading-tight">Slippage (price changes during execution) and brokerage fees represent the cost of trading. They reduce your overall profitability.</p>
          </div>
          <div className="flex items-center justify-between mb-3">
             <span className="text-[10px] font-header font-black uppercase tracking-[0.2em] text-white">Simulation Fidelity</span>
             <button onClick={() => setBrokerageEnabled(prev => !prev)}>
              {brokerageEnabled
                ? <ToggleRight size={20} className="text-[#FF3131]" />
                : <ToggleLeft  size={20} className="text-gray-800" />
              }
            </button>
          </div>
          {brokerageEnabled && fees && tradeValue > 0 ? (
            <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
              <div className="flex justify-between text-[9px] font-mono text-gray-600 uppercase"><span>STT [0.1%]</span><span className="text-[#FF3131]">-${fees.stt.toFixed(2)}</span></div>
              <div className="flex justify-between text-[9px] font-mono text-gray-600 uppercase"><span>Brokerage Matrix</span><span className="text-[#FF3131]">-${fees.brokerage.toFixed(2)}</span></div>
              <div className="flex justify-between text-[9px] font-mono text-gray-800 font-black pt-1 border-t border-white/5"><span>Total Yield Cost</span><span className="text-[#FF3131]">-${fees.total.toFixed(2)}</span></div>
            </div>
          ) : (
             <p className="text-[9px] text-gray-700 font-mono uppercase tracking-widest">{brokerageEnabled ? "Re-calibrating Neural Links..." : "Zero-cost alpha mode active"}</p>
          )}
        </div>
      </div>

      {/* Primary Action Suite */}
      <div className="flex flex-col gap-4 pt-6 border-t border-white/5 bg-[#020205]">
        
        {/* Available Cash Display */}
        <div className="flex justify-between items-center px-2 mb-2">
          <span className="text-[10px] text-gray-500 font-header font-black uppercase tracking-[0.1em]">Available Cash</span>
          <span className="text-[12px] text-white font-mono font-black">${balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative group/buy">
            <div className="absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover/buy:block w-48 bg-[#0A0A0A] border border-[#00FF41]/30 p-2 z-50 shadow-2xl pointer-events-none text-center">
              <p className="text-[10px] font-header text-[#00FF41] uppercase tracking-[0.1em] mb-1 font-bold">Go Long (Buy)</p>
              <p className="text-[10px] text-gray-400 font-mono leading-tight">You expect the asset's price to increase. Your trade becomes profitable if the price goes up after you buy.</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={e => handleTrade("BUY", e)}
              onMouseEnter={() => setActiveInsight("BULLISH_HOVER")}
              onMouseLeave={() => setActiveInsight("IDLE")}
              disabled={loading || isLocked}
              className="w-full relative overflow-hidden bg-[#00FF41] hover:brightness-110 disabled:opacity-30 text-black font-header font-black tracking-[0.2em] uppercase transition-all py-5 border-none shadow-[0_10px_30px_rgba(0,255,65,0.15)] flex flex-col items-center justify-center gap-1"
            >
              <span className="text-[13px]">BULLISH</span>
              <span className="text-[8px] opacity-60">Long α</span>
            </motion.button>
          </div>
          <div className="relative group/sell">
            <div className="absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover/sell:block w-48 bg-[#0A0A0A] border border-[#FF3131]/30 p-2 z-50 shadow-2xl pointer-events-none text-center">
              <p className="text-[10px] font-header text-[#FF3131] uppercase tracking-[0.1em] mb-1 font-bold">Go Short (Sell)</p>
              <p className="text-[10px] text-gray-400 font-mono leading-tight">You expect the asset's price to decrease. You sell the asset first with the intention of buying it back lower. Your trade profits if the price goes down.</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={e => handleTrade("SELL", e)}
              onMouseEnter={() => setActiveInsight("BEARISH_HOVER")}
              onMouseLeave={() => setActiveInsight("IDLE")}
              disabled={loading || isLocked}
              className="w-full relative overflow-hidden bg-[#FF3131] hover:brightness-110 disabled:opacity-30 text-white font-header font-black tracking-[0.2em] uppercase transition-all py-5 border-none shadow-[0_10px_30px_rgba(255,49,49,0.15)] flex flex-col items-center justify-center gap-1"
            >
              <span className="text-[13px]">BEARISH</span>
              <span className="text-[8px] opacity-60">Short β</span>
            </motion.button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 opacity-30 group cursor-none">
          <div className="h-px w-8 bg-gray-800 group-hover:bg-[#ffffff] transition-all" />
          <span className="text-[8px] uppercase tracking-[0.6em] font-header font-black text-white group-hover:text-[#ffffff] transition-all">Sovereign Elite Tier Active</span>
          <div className="h-px w-8 bg-gray-800 group-hover:bg-[#ffffff] transition-all" />
        </div>
      </div>
    </div>
  );
}
