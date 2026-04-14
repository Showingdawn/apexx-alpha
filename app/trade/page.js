"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Chart from "@/components/Chart";
import OrderPanel from "@/components/OrderPanel";
import TradeHistory from "@/components/TradeHistory";
import StatsBar from "@/components/StatsBar";
import GlobalTicker from "@/components/GlobalTicker";
import Watchlist from "@/components/Watchlist";
import GrowwSearch from "@/components/GrowwSearch";
import PortfolioHeatmap from "@/components/PortfolioHeatmap";
import TraderConsole from "@/components/TraderConsole";
import MarketDepth from "@/components/MarketDepth";
import CommandBar from "@/components/CommandBar";
import { motion, AnimatePresence } from "framer-motion";
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
        const res = await axios.get("http://localhost:3001/api/user/", {
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
        const res = await axios.get(`http://localhost:3001/api/market/snapshot?symbol=${encodeURIComponent(selectedAsset)}`);
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
      const res = await axios.post(`http://localhost:3001/api/trade/close/${target.id}`, {}, {
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
        axios.post("http://localhost:3001/api/user/reset", {}, { headers: { Authorization: `Bearer ${auth.currentUser?.accessToken}` } })
             .then(r => setBalance(r.data.balance));
        break;
      case "selectAsset": handleAssetChange(payload); break;
    }
  };

  return (
    <motion.div 
      animate={{ 
        filter: impactActive ? "grayscale(1) contrast(1.2)" : "grayscale(0) contrast(1)",
        backgroundColor: impactActive ? "#000000" : "#050505"
      }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex text-[#eaecef] overflow-hidden selection:bg-[#D4AF37]/30"
    >
      {/* COLUMN 1: WATCHLIST */}
      <AnimatePresence>
        {!zenMode && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="hidden xl:block"
          >
            <Watchlist onAssetSelect={handleAssetChange} onAction={(type, symbol) => handleAssetChange(symbol)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* UNIFIED HEADER BAR */}
        {!zenMode && (
          <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between gap-12 bg-black/60 backdrop-blur-2xl z-50">
             <div className="flex-shrink-0">
                <Navbar />
             </div>
             
             <div className="flex-1 max-w-2xl">
                <GrowwSearch onSelect={handleAssetChange} />
             </div>

             <div className="flex items-center gap-6 flex-shrink-0">
                <StatsBar balance={balance} setBalance={setBalance} />
             </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#050505]/50">
          <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
            
            {/* Contextual Market Pulse (Unified Ticker) */}
            {!zenMode && (
              <div className="py-2 border-b border-white/5">
                <GlobalTicker />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* CENTER COLUMN: CHART & INSIGHTS (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="h-[600px] glass-panel border-white/5 overflow-hidden">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <PortfolioHeatmap trades={optimisticTrades} />
                   <MarketDepth price={currentPrice} />
                </div>

                <div className="glass-panel border-white/5">
                   <TradeHistory optimisticTrades={optimisticTrades} setOptimisticTrades={setOptimisticTrades} />
                </div>
              </div>

              {/* RIGHT COLUMN: EXECUTION (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6 sticky top-0">
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
                />
                
                <TraderConsole history={optimisticTrades} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {zenMode && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-6 right-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] bg-black/50 border border-[#D4AF37]/30 px-4 py-2 rounded-full backdrop-blur-md"
        >
          Zen Mode Active // Cmd+K to Exit
        </motion.div>
      )}
      
      <CommandBar 
        isOpen={cmdOpen} 
        onClose={() => setCmdOpen(false)} 
        onAction={handleCommandAction} 
      />
    </motion.div>
  );
}
