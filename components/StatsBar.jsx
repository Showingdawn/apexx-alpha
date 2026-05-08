"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Activity, ShieldAlert, TrendingDown, Info, Plus, Award } from "lucide-react";
import { auth } from "@/lib/firebase";
import axios from "axios";
import toast from "react-hot-toast";
import { playCoinSound } from "@/utils/sound";

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

export default function StatsBar({ balance = 0, setBalance, optimisticTrades = [] }) {
  const [peakEquity, setPeakEquity] = useState(balance);
  const [isAdding, setIsAdding] = useState(false);
  const [isCertified, setIsCertified] = useState(false);

  // Capital Top-Up States
  const [showTopUp, setShowTopUp] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0 = idle list, 1 = verification loading, 2 = success receipt
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPct, setProgressPct] = useState(0);

  const startTopUpCheckout = (tier) => {
    setCheckoutTier(tier);
    setCheckoutStep(1);
    setProgressPct(0);
    setProgressMsg("INITIALIZING ULTRA-SECURE HANDSHAKE GATEWAY...");

    const intervals = [
      { ms: 600, msg: "ESTABLISHING QUANTUM-SAFE SSH HANDSHAKE...", pct: 25 },
      { ms: 1400, msg: "GENERATING CRYPTOGRAPHIC LEDGER PROOF...", pct: 55 },
      { ms: 2200, msg: "DEPOSITING LIQUIDITY ALLOCATION TO BLOCKCHAIN...", pct: 85 },
      { ms: 3000, msg: "LEDGER AUDIT SUCCESSFUL! PRINTING SECURE RECEIPT...", pct: 100 },
    ];

    intervals.forEach(({ ms, msg, pct }) => {
      setTimeout(() => {
        setProgressMsg(msg);
        setProgressPct(pct);
        if (pct === 100) {
          setTimeout(() => {
            setCheckoutStep(2);
          }, 400);
        }
      }, ms);
    });
  };

  const claimTierFunds = () => {
    if (!checkoutTier) return;
    playCoinSound();
    const amount = checkoutTier.value;
    const newBal = balance + amount;
    setBalance(newBal);
    localStorage.setItem("apex_local_balance", newBal.toString());
    toast.success(`Capitalized! $${amount.toLocaleString()} added to your vault.`);
    setCheckoutTier(null);
    setCheckoutStep(0);
    setShowTopUp(false);
  };

  useEffect(() => {
    const lvl3Completed = localStorage.getItem("apex_lvl3_index");
    if (lvl3Completed && Number(lvl3Completed) >= 7) {
      setIsCertified(true);
    }
  }, []);

  // Calculations
  const unrealizedPnl = optimisticTrades
    .filter((t) => t.status === "OPEN")
    .reduce((acc, t) => acc + (t.pnl || 0), 0);

  const equity = balance + unrealizedPnl;
  const maintenanceMargin = equity * 0.15; // Simulated 15% maintenance margin
  
  if (equity > peakEquity) {
    setPeakEquity(equity);
  }

  const drawdown = peakEquity > 0 ? ((peakEquity - equity) / peakEquity) * 100 : 0;

  const handleAddFunds = () => {
    setShowTopUp(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        {/* Equity Card */}
        <motion.div whileHover={{ scale: 1.02 }} className="glass-panel p-5 relative group/eq flex flex-col justify-between">
          <div className="absolute left-0 top-full mt-2 hidden group-hover/eq:block w-48 bg-[#0A0A0A] border border-white/30 p-2 z-50 shadow-2xl pointer-events-none">
            <p className="text-[10px] font-header text-white uppercase tracking-[0.1em] mb-1 font-bold">What is Total Equity?</p>
            <p className="text-[10px] text-gray-400 font-mono leading-tight">Your total account value. It equals your cash balance plus any Unrealized P&L from open trades.</p>
          </div>
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-1 cursor-help">
              Total Equity <Info size={10} className="opacity-50" />
            </p>
            <Wallet size={14} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tighter mono-nums flex items-center gap-1">
            $<RollingNumber value={equity.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} />
          </h2>
          
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-[10px] text-[#00FF41] font-mono uppercase">Paper Trading Mode</div>
              {isCertified && (
                <div className="flex items-center gap-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-1.5 py-0.5 rounded-sm">
                  <Award size={10} className="text-[#D4AF37]" />
                  <span className="text-[8px] font-header font-black tracking-widest uppercase text-[#D4AF37]">Certified Alpha Analyst</span>
                </div>
              )}
            </div>
            <button 
              onClick={handleAddFunds}
              disabled={isAdding}
              className="text-[9px] uppercase tracking-widest font-bold text-white px-2 py-1 rounded-sm flex items-center gap-1 transition-all bg-[#00FF41]/20 hover:bg-[#00FF41]/40 text-[#00FF41] disabled:opacity-50"
            >
              <Plus size={10} /> Add Fake Funds
            </button>
          </div>
        </motion.div>

        {/* Unrealized P&L Card */}
        <motion.div whileHover={{ scale: 1.02 }} className="glass-panel p-5 relative group/pnl">
          <div className="absolute left-0 top-full mt-2 hidden group-hover/pnl:block w-48 bg-[#0A0A0A] border border-[#00FF41]/30 p-2 z-50 shadow-2xl pointer-events-none">
            <p className="text-[10px] font-header text-[#00FF41] uppercase tracking-[0.1em] mb-1 font-bold">Unrealized P&L</p>
            <p className="text-[10px] text-gray-400 font-mono leading-tight">The current profit or loss of trades that are still open. It's 'unrealized' because it changes with the market until you close the position.</p>
          </div>
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-1 cursor-help">
              Unrealized P&L <Info size={10} className="opacity-50" />
            </p>
            <Activity size={14} className={unrealizedPnl >= 0 ? "text-[#00FF41]" : "text-[#FF3131]"} />
          </div>
          <h2 className={`text-2xl font-black tracking-tighter mono-nums ${unrealizedPnl >= 0 ? "text-[#00FF41]" : "text-[#FF3131]"}`}>
            {unrealizedPnl >= 0 ? "+" : "-"}$<RollingNumber value={Math.abs(unrealizedPnl).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} />
          </h2>
        </motion.div>

        {/* Maintenance Margin */}
        <motion.div whileHover={{ scale: 1.02 }} className="glass-panel p-5 relative group/margin">
          <div className="absolute left-0 top-full mt-2 hidden group-hover/margin:block w-48 bg-[#0A0A0A] border border-[#FF3131]/30 p-2 z-50 shadow-2xl pointer-events-none">
            <p className="text-[10px] font-header text-[#FF3131] uppercase tracking-[0.1em] mb-1 font-bold">Maintenance Margin</p>
            <p className="text-[10px] text-gray-400 font-mono leading-tight">The minimum amount of equity required to keep your positions open. If your equity falls below this level, you face a margin call (liquidation).</p>
          </div>
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-1 cursor-help">
              Maint. Margin <Info size={10} className="opacity-50" />
            </p>
            <ShieldAlert size={14} className="text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter mono-nums text-white">
            $<RollingNumber value={maintenanceMargin.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} />
          </h2>
          <div className="w-full h-1 bg-white/10 mt-2">
            <div className="h-full bg-white/50" style={{ width: '15%' }}></div>
          </div>
        </motion.div>

        {/* Maximum Drawdown Card */}
        <motion.div whileHover={{ scale: 1.02 }} className="glass-panel p-5 relative group/dd">
          <div className="absolute right-0 top-full mt-2 hidden group-hover/dd:block w-48 bg-[#0A0A0A] border border-[#FF3131]/30 p-2 z-50 shadow-2xl pointer-events-none">
            <p className="text-[10px] font-header text-[#FF3131] uppercase tracking-[0.1em] mb-1 font-bold">Maximum Drawdown</p>
            <p className="text-[10px] text-gray-400 font-mono leading-tight">The largest percentage drop from your peak equity in this session. Tracking drawdown helps manage risk and evaluate strategy consistency.</p>
          </div>
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-1 cursor-help">
              Max Drawdown <Info size={10} className="opacity-50" />
            </p>
            <TrendingDown size={14} className="text-[#FF3131]" />
          </div>
          <h2 className="text-2xl font-black text-[#FF3131] tracking-tighter mono-nums">
            <RollingNumber value={drawdown.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} />%
          </h2>
        </motion.div>
      </div>

      <AnimatePresence>
        {showTopUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[999] p-4 font-mono"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-[#030307] border border-white/10 p-6 relative rounded-none shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Scanline overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] scanlines" />
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFBF00]/40 to-transparent" />

              {/* Header */}
              <div className="flex justify-between items-start mb-8 pb-4 border-b border-white/5 relative z-10">
                <div>
                  <h3 className="text-white text-xs font-header font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#FFBF00] inline-block animate-ping rounded-full" /> SOVEREIGN LIQUIDITY INJECTION HUB
                  </h3>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">ALLOCATE HIGH-CAPACITY SIMULATED RESERVE CAPITAL</p>
                </div>
                {checkoutStep !== 1 && (
                  <button
                    onClick={() => { setShowTopUp(false); setCheckoutStep(0); setCheckoutTier(null); }}
                    className="text-gray-500 hover:text-white transition-all text-[9px] border border-white/5 px-2 py-1 hover:border-white/20 uppercase font-bold tracking-wider"
                  >
                    [ESC] CANCEL
                  </button>
                )}
              </div>

              {/* VIEW 0: Tier Selection Grid */}
              {checkoutStep === 0 && (
                <div className="relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { name: "Sovereign Starter", value: 500000, price: "FREE", displayPrice: "FREE ACCESS", glowColor: "border-[#00FFFF]/20 hover:border-[#00FFFF] text-[#00FFFF]", colorHex: "#00FFFF" },
                      { name: "Alpha Surge Boost", value: 1000000, price: "₹100 INR", displayPrice: "₹100 INR (Simulated)", glowColor: "border-[#FFBF00]/20 hover:border-[#FFBF00] text-[#FFBF00]", colorHex: "#FFBF00" },
                      { name: "Institutional Liquidity", value: 5000000, price: "₹500 INR", displayPrice: "₹500 INR (Simulated)", glowColor: "border-[#00FF41]/20 hover:border-[#00FF41] text-[#00FF41]", colorHex: "#00FF41" },
                      { name: "UHNW Sovereign Syndicate", value: 10000000, price: "₹750 INR", displayPrice: "₹750 INR (Simulated)", glowColor: "border-[#E040FB]/20 hover:border-[#E040FB] text-[#E040FB]", colorHex: "#E040FB" }
                    ].map((tier, idx) => (
                      <div
                        key={idx}
                        onClick={() => startTopUpCheckout(tier)}
                        className={`glass-panel p-5 border cursor-pointer transition-all duration-300 relative group flex flex-col justify-between h-56 bg-black/40 ${tier.glowColor}`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-white/5 text-gray-400 uppercase tracking-widest">TIER 0{idx+1}</span>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tier.colorHex }} />
                          </div>
                          <h4 className="text-[11px] font-black uppercase text-white tracking-widest group-hover:text-white transition-colors mt-2">{tier.name}</h4>
                          <p className="text-[8px] text-gray-500 uppercase mt-2 tracking-wider leading-relaxed">
                            Injects ${tier.value.toLocaleString()} reserve margin immediately to your account ledger.
                          </p>
                        </div>
                        <div>
                          <div className="h-px bg-white/5 my-3" />
                          <div className="flex justify-between items-end">
                            <p className="text-[8px] text-gray-400 uppercase tracking-widest">Rate</p>
                            <p className="text-[10px] font-black tracking-wider text-white uppercase">{tier.price}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[8px] text-gray-600 uppercase text-center tracking-[0.2em]">Select a tier to showcase high-fidelity simulated checkout sequence. No actual currency transaction is processed.</p>
                </div>
              )}

              {/* VIEW 1: Checkout Loader */}
              {checkoutStep === 1 && (
                <div className="flex flex-col items-center justify-center py-12 relative z-10 font-mono">
                  <div className="w-12 h-12 border-2 border-t-[#00FF41] border-[#00FF41]/10 rounded-full animate-spin mb-6" />
                  <div className="w-full max-w-md bg-[#0A0A0F] border border-white/5 p-4 rounded-none shadow-2xl text-center">
                    <span className="text-[8px] text-gray-600 uppercase tracking-[0.3em] font-bold">SOVEREIGN SECURE HANDSHAKE</span>
                    <p className="text-[9px] text-[#00FF41] font-mono mt-2 animate-pulse uppercase tracking-wider">{progressMsg}</p>
                    
                    <div className="w-full h-1.5 bg-white/5 mt-4 overflow-hidden relative">
                      <motion.div
                        className="h-full bg-[#00FF41]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-gray-500 font-mono mt-2 uppercase tracking-widest">
                      <span>SSL V3 Secured</span>
                      <span>{progressPct}% COMPLETED</span>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: Success Receipt */}
              {checkoutStep === 2 && checkoutTier && (
                <div className="relative z-10 max-w-md mx-auto">
                  <div className="border border-[#00FF41]/30 bg-[#020205] p-6 text-left relative shadow-[0_0_40px_rgba(0,255,65,0.05)]">
                    {/* Neon receipt headers */}
                    <div className="text-center mb-6 pb-4 border-b border-white/5">
                      <span className="text-[9px] text-[#00FF41] font-black uppercase tracking-[0.4em] px-2 py-1 bg-[#00FF41]/10 border border-[#00FF41]/20">RECEIPT VERIFIED</span>
                      <p className="text-[8px] text-gray-500 uppercase mt-3 tracking-widest">SOVEREIGN CAPITAL SYSTEMS INC.</p>
                    </div>

                    <div className="flex flex-col gap-3 font-mono text-[9px] text-gray-400">
                      <div className="flex justify-between">
                        <span className="uppercase tracking-wider">Transaction ID:</span>
                        <span className="text-white font-bold">TXN-SEED-{Math.random().toString(36).substr(2, 7).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="uppercase tracking-wider">Timestamp:</span>
                        <span className="text-white font-bold">{new Date().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="uppercase tracking-wider">System Ticker:</span>
                        <span className="text-white font-bold">{checkoutTier.name.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="uppercase tracking-wider">Allocated Value:</span>
                        <span className="text-[#00FF41] font-black text-[11px]">${checkoutTier.value.toLocaleString()} USD</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-3 mt-1">
                        <span className="uppercase tracking-wider font-bold">Checkout Cost:</span>
                        <span className="text-white font-bold text-[10px]">{checkoutTier.displayPrice}</span>
                      </div>
                    </div>

                    <div className="h-px bg-white/5 my-6" />

                    <button
                      onClick={claimTierFunds}
                      className="w-full py-2.5 bg-[#00FF41]/20 hover:bg-[#00FF41]/40 border border-[#00FF41]/40 text-[#00FF41] hover:text-white text-[10px] font-header font-black tracking-[0.2em] uppercase transition-all shadow-[0_0_20px_rgba(0,255,65,0.1)] rounded-none cursor-pointer"
                    >
                      COMMIT TO VAULT BALANCE
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
