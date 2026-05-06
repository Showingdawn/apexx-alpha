"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import OrderPanel from "@/components/OrderPanel";
import Chart from "@/components/Chart";
import TradeHistory from "@/components/TradeHistory";
import MarketDepth from "@/components/MarketDepth";
import StatsBar from "@/components/StatsBar";
import ErrorBoundary from "@/components/ErrorBoundary";
import TopBarTicker from "@/components/TopBarTicker";
import Watchlist from "@/components/Watchlist";
import GrowwSearch from "@/components/GrowwSearch";
import PortfolioHeatmap from "@/components/PortfolioHeatmap";
import TraderConsole from "@/components/TraderConsole";
import CommandBar from "@/components/CommandBar";
import axios from "axios";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function TradePage() {
  const [optimisticTrades, setOptimisticTrades] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState("BTC-USD");
  const [zenMode, setZenMode] = useState(false);
  const [slPrice, setSlPrice] = useState(0);
  const [tpPrice, setTpPrice] = useState(0);
  const [balance, setBalance] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [marketAnalytics, setMarketAnalytics] = useState(null);
  const [impactActive, setImpactActive] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const [isTrailing, setIsTrailing] = useState(false);
  const [highestSinceOpen, setHighestSinceOpen] = useState(0);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [splitMode, setSplitMode] = useState(null);
  const router = useRouter();

  // Daily P&L Tracker
  useEffect(() => {
    const dailyLoss = optimisticTrades.reduce((acc, trade) => {
      return trade.status === 'CLOSED' && trade.pnl < 0 ? acc + trade.pnl : acc;
    }, 0);

    if (dailyLoss < -500 && !isLocked) {
      setIsLocked(true);
      setLockTime(3600);
    }
  }, [optimisticTrades, isLocked]);

  // Lockout Timer
  useEffect(() => {
    if (lockTime > 0) {
      const timer = setInterval(() => setLockTime(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (lockTime <= 0 && isLocked) {
      setIsLocked(false);
    }
  }, [lockTime, isLocked]);

  // Balance Fetch
  useEffect(() => {
    const fetchBalance = async () => {
      if (!auth.currentUser) return;
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await axios.get("/api/user/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBalance(res.data.balance);
      } catch (err) {
        console.error("Balance fetch failed", err);
      }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, []);

  // Price & Analytics Fetch
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await axios.get(`/api/market/snapshot?symbol=${encodeURIComponent(selectedAsset)}`);
        setCurrentPrice(res.data.price);
        setMarketAnalytics({
          recommendation: res.data.recommendationMean,
          quoteType: res.data.quoteType,
          volume: res.data.volume,
          avgVolume: res.data.averageVolume
        });
      } catch (err) {
        console.error("Price fetch failed", err);
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, [selectedAsset]);

  // Trailing SL Logic
  useEffect(() => {
    if (isTrailing && currentPrice > highestSinceOpen) {
      setHighestSinceOpen(currentPrice);
      if (slPrice > 0 && highestSinceOpen > 0) {
        const movePercent = (currentPrice - highestSinceOpen) / highestSinceOpen;
        if (movePercent > 0.005) { 
           setSlPrice(prev => prev * (1 + movePercent));
        }
      }
    }
  }, [currentPrice, isTrailing, slPrice, highestSinceOpen]);

  // Hotkeys
  useEffect(() => {
    const handleKeyDown = async (e) => {
      // Cmd+K to open Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        handleFlashTrade();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [optimisticTrades]);

  const handleFlashTrade = async () => {
    if (optimisticTrades.length === 0) return;
    const target = optimisticTrades.find(t => t.status === 'OPEN');
    if (!target) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.post(`/api/trade/close/${target.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOptimisticTrades(prev => prev.map(t => t.id === target.id ? { ...t, status: 'CLOSED', pnl: res.data.pnl || -100 } : t));
      if ((res.data.pnl || -100) < 0) {
        setImpactActive(true);
        setTimeout(() => setImpactActive(false), 2000);
      }
    } catch (err) {
      console.error("Flash trade failed", err);
    }
  };

  const handleAssetChange = (newAsset) => {
    const cleanAsset = newAsset.includes(':') ? newAsset.split(':').pop() : newAsset;
    setSelectedAsset(cleanAsset);
    setHighestSinceOpen(0); // Reset for Trailing SL
  }

  const handleCommandAction = (actionId, payload) => {
    switch (actionId) {
      case "performance": router.push("/performance"); break;
      case "portfolio":  router.push("/portfolio"); break;
      case "split2":     setSplitMode("2"); break;
      case "split4":     setSplitMode("4"); break;
      case "splitoff":   setSplitMode(null); break;
      case "theme":      document.documentElement.classList.toggle("dark"); break;
      case "reset":      
        axios.post("/api/user/reset", {}, { headers: { Authorization: `Bearer ${auth.currentUser?.accessToken}` } })
             .then(r => setBalance(r.data.balance));
        break;
      case "selectAsset": handleAssetChange(payload); break;
    }
  };

  // Container Variants for Staggered Load
  const terminalVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      } 
    }
  };

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 25 } }
  };

  const mainVariants = {
    hidden: { scale: 0.98, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } }
  };

  const [isVibrating, setIsVibrating] = useState(false);
  const triggerHaptic = () => {
    setIsVibrating(true);
    setTimeout(() => setIsVibrating(false), 300);
  };

  // Modify handleFlashTrade to include haptic
  const baseFlashTrade = handleFlashTrade;
  const wrappedFlashTrade = async () => {
    triggerHaptic();
    await baseFlashTrade();
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={terminalVariants}
      className={`min-h-screen flex text-white overflow-hidden bg-[#020205] selection:bg-[#f0c040]/30 font-body ${isVibrating ? 'haptic-vibration' : ''}`}
    >
      {/* COLUMN 1: WATCHLIST */}
      <AnimatePresence>
        {!zenMode && (
          <motion.div
            variants={sidebarVariants}
            className="hidden xl:block"
          >
            <Watchlist onAssetSelect={handleAssetChange} onAction={(type, symbol) => { triggerHaptic(); handleAssetChange(symbol); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* UNIFIED HEADER BAR */}
        {!zenMode && (
          <motion.div 
            variants={navVariants}
            className="px-6 py-4 border-b border-white/5 flex items-center justify-between gap-12 bg-black/60 backdrop-blur-2xl z-50"
          >
             <div className="flex-shrink-0">
                <Navbar />
             </div>
             
             <div className="flex-1 max-w-2xl">
                <GrowwSearch onSelect={handleAssetChange} />
             </div>

             <div className="flex items-center gap-6 flex-shrink-0">
                <StatsBar balance={balance} setBalance={setBalance} />
             </div>
          </motion.div>
        )}

        <motion.div 
          variants={mainVariants}
          className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#020205]/50 relative"
        >
          {/* Scanline overlay for trade floor */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] scanlines" />

          <div className="flex flex-col gap-8 max-w-[1800px] mx-auto w-full relative z-10">
            
            {/* Contextual Market Pulse (Sovereign Top Ticker) */}
            {!zenMode && (
              <div className="py-1 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-[100]">
                <TopBarTicker />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* CENTER COLUMN: CHART & INSIGHTS (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                <div className="h-[640px] glass-panel border-white/10 overflow-hidden shadow-2xl">
                  <Chart 
                    selectedAsset={selectedAsset} 
                    onAssetSearch={handleAssetChange} 
                    slPrice={slPrice}
                    tpPrice={tpPrice}
                    setSlPrice={setSlPrice}
                    setTpPrice={setTpPrice}
                    splitMode={splitMode}
                    onSplitChange={setSplitMode}
                  />
                </div>
                
                {/* Insights Dual Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="glass-panel p-6 border-white/10 hover:border-[#f0c040]/30 transition-all">
                      <PortfolioHeatmap trades={optimisticTrades} />
                   </div>
                   <div className="glass-panel p-6 border-white/10 hover:border-[#f0c040]/30 transition-all">
                      <MarketDepth price={currentPrice} />
                   </div>
                </div>

                <div className="glass-panel border-white/10 shadow-2xl">
                   <TradeHistory optimisticTrades={optimisticTrades} setOptimisticTrades={setOptimisticTrades} />
                </div>
              </div>

              {/* RIGHT COLUMN: EXECUTION (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-8 sticky top-0">
                <div className="glass-panel border-white/10 p-1 shadow-2xl">
                  <OrderPanel 
                    setOptimisticTrades={setOptimisticTrades} 
                    selectedAsset={selectedAsset}
                    onAssetChange={handleAssetChange} 
                    slPrice={slPrice}
                    tpPrice={tpPrice}
                    setSlPrice={setSlPrice}
                    setTpPrice={setTpPrice}
                    balance={balance}
                    currentPrice={currentPrice}
                    isLocked={isLocked}
                    lockTime={lockTime}
                    isTrailing={isTrailing}
                    setIsTrailing={setIsTrailing}
                    onTrade={triggerHaptic}
                  />
                </div>
                
                <div className="glass-panel border-white/10 shadow-2xl h-full">
                  <TraderConsole history={optimisticTrades} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {zenMode && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-8 text-[11px] font-header font-black uppercase tracking-[0.4em] text-[#f0c040] glass-panel bg-black/50 px-6 py-3 rounded-none shadow-[0_0_40px_rgba(0,0,0,0.8)]"
          >
            Terminal Mode: Zen Alpha // [ESC] to Abort
          </motion.div>
        )}
      </AnimatePresence>
      
      <CommandBar 
        isOpen={cmdOpen} 
        onClose={() => setCmdOpen(false)} 
        onAction={handleCommandAction} 
      />
    </motion.div>
  );
}
