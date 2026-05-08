"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Search, Info, LayoutTemplate, Grid2X2, Square, Eye, Activity, Award, Clock, GraduationCap, BookOpen } from "lucide-react";
import { detectPatterns, MOCK_CHART_CANDLES } from "@/utils/patterns";

const SYMBOL_MAP = {
  'BTC-USD':    'BINANCE:BTCUSDT',
  'ETH-USD':    'BINANCE:ETHUSDT',
  'SOL-USD':    'BINANCE:SOLUSDT',
  'AAPL':       'NASDAQ:AAPL',
  'TSLA':       'NASDAQ:TSLA',
  'NVDA':       'NASDAQ:NVDA',
  'MSFT':       'NASDAQ:MSFT',
  'GOOGL':      'NASDAQ:GOOGL',
  'AMZN':       'NASDAQ:AMZN',
  'Nifty 50':   'NSE:NIFTY',
  'Bank Nifty': 'NSE:BANKNIFTY',
  'RELIANCE':   'NSE:RELIANCE',
  'TCS':        'NSE:TCS',
};

const TV_CONFIG = {
  autosize: true,
  interval: "1",
  timezone: "exchange",
  theme: "dark",
  style: "1",
  locale: "en",
  toolbar_bg: "#050505",
  enable_publishing: false,
  hide_side_toolbar: false,
  allow_symbol_change: true,
  backgroundColor: "#050505",
  gridColor: "rgba(212, 175, 55, 0.03)",
};

const BRIEFINGS = {
  "1m": "[SCALP] High-frequency noise. Monitoring micro-liquidity sweeps.",
  "15m": "[INTRADAY] Trend validation in progress. Look for local Break of Structure (BOS).",
  "1h": "[SWING] Macro-structure evolving. Institutional bias is currently dominant.",
  "4h": "[SWING] Macro-structure evolving. Institutional bias is currently dominant.",
  "1D": "[POSITIONAL] Major trend analysis. Aligning with long-term capital flows."
};

const MENTOR_BRIEFINGS = {
  "1m": "Briefing: High-volatility scalping. Move quickly. Look for patterns like the 'Hammer' to buy the 'floor'.",
  "15m": "Briefing: Local trend validation. Keep stop-loss tight and monitor Break of Structure (BOS).",
  "1h": "Briefing: Local trend validation. Keep stop-loss tight and monitor Break of Structure (BOS).",
  "4h": "Briefing: Institutional trend following. Patience required. Look for 'Order Blocks' to find where major funds are entering.",
  "1D": "Briefing: Institutional trend following. Patience required. Look for 'Order Blocks' to find where major funds are entering."
};

const MENTOR_GOALS = {
  "1m": "Goal: Master high-speed candlestick volume validation to execute scalp setups.",
  "15m": "Goal: Identify a 15m time-frame reversal pattern to enter with Institutional Flow.",
  "1h": "Goal: Study hourly liquidity sweeps and trend continuation structures to build swing positions.",
  "4h": "Goal: Align macro trendlines with larger institution blocks to maximize risk-adjusted yields.",
  "1D": "Goal: Establish long-term investment bias based on institutional distribution cycles."
};

function mapToTVSymbol(asset) {
  if (SYMBOL_MAP[asset]) return SYMBOL_MAP[asset];
  if (asset.includes(':')) return asset;
  if (asset.endsWith('.NS')) return `NSE:${asset.replace('.NS','')}`;
  return `OANDA:${asset.replace(/[-/]/g, '')}`;
}

function TVPane({ id, symbol, scriptLoaded, compact = false }) {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (!scriptLoaded || !window.TradingView || !containerRef.current) return;
    containerRef.current.innerHTML = "";
    widgetRef.current = new window.TradingView.widget({
      ...TV_CONFIG,
      symbol: mapToTVSymbol(symbol),
      hide_side_toolbar: compact,
      container_id: id,
      autosize: true,
    });
  }, [symbol, scriptLoaded, id, compact]);

  return (
    <div id={id} ref={containerRef} className="w-full h-full bg-[#050505]" />
  );
}

function PaneHeader({ symbol, onSymbolChange, paneIdx }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(symbol);

  const commit = () => {
    if (val.trim()) onSymbolChange(val.trim().toUpperCase());
    setEditing(false);
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-xl border-b border-white/5">
      <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Pane {paneIdx + 1}</span>
      {editing ? (
        <input
          autoFocus
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
          className="text-[10px] font-mono font-black text-white bg-transparent border-b border-[#D4AF37] outline-none w-24 px-0.5"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-[10px] font-mono font-black text-[#D4AF37] hover:text-white transition-colors"
        >
          {symbol}
        </button>
      )}
    </div>
  );
}

export default function Chart({ selectedAsset, onAssetSearch, slPrice, tpPrice, setSlPrice, setTpPrice, splitMode, onSplitChange, setActiveInsight = () => {} }) {
  const containerRef = useRef(null);
  const chartAreaRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [slY, setSlY] = useState(450);
  const [tpY, setTpY] = useState(150);

  // Timeframe and Scanner states
  const [activeTimeframe, setActiveTimeframe] = useState("15m");
  const [isScanning, setIsScanning] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [showIntelOverlay, setShowIntelOverlay] = useState(true);
  const [isMentorMode, setIsMentorMode] = useState(false);
  const [activeIndTab, setActiveIndTab] = useState("EMA 50");

  // Macro Shockwave States
  const [activeNews, setActiveNews] = useState(null);
  const [newsFlashTimeout, setNewsFlashTimeout] = useState(null);
  const [showAlphapedia, setShowAlphapedia] = useState(false);
  const [selectedPatternId, setSelectedPatternId] = useState(1);

  const triggerNewsShockwave = () => {
    const events = [
      { title: "FED INTEREST RATE DECISION", description: "FED raises rates by 75bps. Hawkish press conference underway.", action: "CRITICAL VOLATILITY: Institutional Sell Wall detected! Price floor collapsing.", type: "BEARISH", iconColor: "text-red-500", glowBg: "bg-red-500/10 border-red-500/30 text-red-500" },
      { title: "CPI INFLATION RELEASES BELOW CONSENSUS", description: "CPI lands at 2.8% vs 3.1% expected. Massive buying surge initiated.", action: "EMERGENT ABSORPTION: Whales cleaning the offer. High-frequency buying surge.", type: "BULLISH", iconColor: "text-emerald-500", glowBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" },
      { title: "SUDDEN LIQUIDITY SWEEP BY CENTRAL BANK", description: "Sovereign reserve liquidity injection sweeps sell limits.", action: "LIQUIDITY SWEPT: Short positions squeezed. Maintain hedging neutrality.", type: "BULLISH", iconColor: "text-cyan-500", glowBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-500" },
      { title: "GLOBAL TECH REGULATORY CRACKDOWN", description: "Aggressive regulatory compliance checks trigger stop-hunts.", action: "CAUTION: Stop-hunts ongoing. Look for local Break of Structure.", type: "BEARISH", iconColor: "text-amber-500", glowBg: "bg-amber-500/10 border-amber-500/30 text-amber-500" },
    ];
    const picked = events[Math.floor(Math.random() * events.length)];
    setActiveNews(picked);
    toast.error(`ALERT: ${picked.title} Shockwave Triggered!`);

    if (newsFlashTimeout) clearTimeout(newsFlashTimeout);
    const t = setTimeout(() => {
      setActiveNews(null);
    }, 15000);
    setNewsFlashTimeout(t);
  };

  const [paneSymbols, setPaneSymbols] = useState(() => {
    return ["BTC-USD", "Nifty 50", "ETH-USD", "Bank Nifty"];
  });

  useEffect(() => {
    const handleShock = () => triggerNewsShockwave();
    const handleAlpha = () => setShowAlphapedia(true);

    window.addEventListener("apex_trigger_shockwave", handleShock);
    window.addEventListener("apex_trigger_alphapedia", handleAlpha);

    return () => {
      window.removeEventListener("apex_trigger_shockwave", handleShock);
      window.removeEventListener("apex_trigger_alphapedia", handleAlpha);
    };
  }, [newsFlashTimeout]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPaneSymbols(prev => {
        const next = [...prev];
        next[0] = selectedAsset;
        return next;
      });
    }, 0);
    return () => clearTimeout(t);
  }, [selectedAsset]);

  const calculatePrice = (y) => {
    const range = 20000;
    const height = 600;
    return (80000 - (y / height) * range).toFixed(2);
  };

  useEffect(() => {
    setSlPrice(calculatePrice(slY));
    setTpPrice(calculatePrice(tpY));
  }, [slY, tpY, setSlPrice, setTpPrice]);

  const mapTimeframeToInterval = (tf) => {
    switch (tf) {
      case "1m": return "1";
      case "15m": return "15";
      case "1h": return "60";
      case "4h": return "240";
      case "1D": return "D";
      default: return "15";
    }
  };

  useEffect(() => {
    if (splitMode || !scriptLoaded || !window.TradingView || !containerRef.current) return;
    containerRef.current.innerHTML = "";
    new window.TradingView.widget({
      ...TV_CONFIG,
      interval: mapTimeframeToInterval(activeTimeframe),
      symbol: mapToTVSymbol(selectedAsset),
      container_id: "tv_chart_single",
    });
  }, [selectedAsset, scriptLoaded, splitMode, activeTimeframe]);

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    const pair = searchInput.toUpperCase().trim();
    const finalPair = pair.indexOf(":") === -1 ? `OANDA:${pair}` : pair;
    onAssetSearch(finalPair);
    setSearchInput("");
  };

  const handleMouseMove = (e) => {
    if (!chartAreaRef.current) return;
    const rect = chartAreaRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const getShuffledCandles = () => {
    const shiftMap = { "1m": 0, "15m": 2, "1h": 4, "4h": 6, "1D": 8 };
    const shift = shiftMap[activeTimeframe] || 0;
    return [
      ...MOCK_CHART_CANDLES.slice(shift),
      ...MOCK_CHART_CANDLES.slice(0, shift)
    ];
  };
  const activeCandles = getShuffledCandles();

  const getMentorFeedback = (candle) => {
    if (!candle) return null;
    const body = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low || 1;
    const upperWick = candle.high - Math.max(candle.open, candle.close);
    const lowerWick = Math.min(candle.open, candle.close) - candle.low;
    const isGreen = candle.close >= candle.open;

    // Rule A: Aggressive Buying
    if (lowerWick > 2 * body && isGreen) {
      return {
        zone: "BUY ZONE",
        color: "#00FF41",
        text: `The market whales just 'cleaned up' the floor. A massive buying wall is likely. Tactical entry price: $${candle.low}.`
      };
    }
    // Rule B: Aggressive Selling
    if (upperWick > 2 * body && !isGreen) {
      return {
        zone: "SELL ZONE",
        color: "#FF3131",
        text: `Professional money is shorting the peak. Retail trap detected. Protect capital at price: $${candle.high}.`
      };
    }
    // Rule C: Indecision
    if (Math.abs(upperWick - lowerWick) < body * 0.5 && body < range * 0.3) {
      return {
        zone: "CAUTION ZONE",
        color: "#FFBF00",
        text: `Total market indecision. Bulls and Bears are exhausted. Wait for a breakthrough above $${candle.high} or below $${candle.low}.`
      };
    }
    // Fallback
    return {
      zone: "STABILIZATION",
      color: "#D4AF37",
      text: `Market is building volume. Look for clean S&R alignment before entry.`
    };
  };

  const getSRElements = () => {
    if (!activeCandles || activeCandles.length === 0) return { resY: 20, supY: 80 };
    const highs = activeCandles.map(c => c.high);
    const lows = activeCandles.map(c => c.low);
    const maxHigh = Math.max(...highs);
    const minLow = Math.min(...lows);
    const spread = maxHigh - minLow || 1;
    
    const sortedHighs = [...highs].sort((a,b) => b - a);
    const sortedLows = [...lows].sort((a,b) => a - b);
    
    const resistance = sortedHighs.slice(0, 3).reduce((acc, v) => acc + v, 0) / 3;
    const support = sortedLows.slice(0, 3).reduce((acc, v) => acc + v, 0) / 3;
    
    const resY = ((maxHigh - resistance) / spread) * 100;
    const supY = ((maxHigh - support) / spread) * 100;
    
    return { resY, supY };
  };
  const { resY, supY } = getSRElements();

  useEffect(() => {
    if (!setActiveInsight || !isScanning) return;
    const rect = chartAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const containerTop = rect.height / 4;
    const containerHeight = rect.height / 2;
    const mousePercent = ((mousePos.y - containerTop) / containerHeight) * 100;
    
    const isNearRes = Math.abs(mousePercent - resY) < 12;
    const isNearSup = Math.abs(mousePercent - supY) < 12;
    
    if (isNearRes) {
      setActiveInsight('APPROACHING_RESISTANCE');
    } else if (isNearSup) {
      setActiveInsight('APPROACHING_SUPPORT');
    } else {
      setActiveInsight('IDLE');
    }
  }, [mousePos, isScanning, resY, supY, setActiveInsight]);

  const paneCount = splitMode === "4" ? 4 : splitMode === "2" ? 2 : 1;

  // Active pattern calculation for hovered index
  let activePattern = null;
  if (hoveredIdx !== null) {
    const slice = activeCandles.slice(Math.max(0, hoveredIdx - 2), hoveredIdx + 1);
    activePattern = detectPatterns(slice);
  }

  const hoveredCandle = hoveredIdx !== null ? activeCandles[hoveredIdx] : null;
  const mentorFeedback = hoveredCandle ? getMentorFeedback(hoveredCandle) : null;

  return (
    <div className="bento-card border-[#1a1a1a] flex flex-col transition-all relative overflow-hidden" style={{ height: splitMode === "4" ? 620 : (isMentorMode ? "auto" : 600) }}>
      <Script src="https://s3.tradingview.com/tv.js" onLoad={() => setScriptLoaded(true)} />

      {/* Intelligence Overlay (only in single mode) */}
      {!splitMode && (
        <div ref={chartAreaRef} className="absolute inset-0 z-30 pointer-events-none">
          <motion.div
            drag="y"
            dragConstraints={chartAreaRef}
            onDrag={(e, info) => chartAreaRef.current && setTpY(info.point.y - chartAreaRef.current.getBoundingClientRect().top)}
            style={{ top: tpY }}
            className="absolute left-0 w-full h-[2px] bg-[#00FF94]/40 shadow-[0_0_10px_rgba(0,255,148,0.5)] cursor-ns-resize pointer-events-auto flex items-center justify-end pr-4"
          >
            <div className="bg-[#00FF94] text-black text-[9px] font-black px-2 py-0.5 rounded-l-md uppercase tracking-widest shadow-lg">
              TP: ${tpPrice}
            </div>
          </motion.div>
          <motion.div
            drag="y"
            dragConstraints={chartAreaRef}
            onDrag={(e, info) => chartAreaRef.current && setSlY(info.point.y - chartAreaRef.current.getBoundingClientRect().top)}
            style={{ top: slY }}
            className="absolute left-0 w-full h-[2px] bg-[#FF3131]/40 shadow-[0_0_10px_rgba(255,49,49,0.5)] cursor-ns-resize pointer-events-auto flex items-center justify-end pr-4"
          >
            <div className="bg-[#FF3131] text-white text-[9px] font-black px-2 py-0.5 rounded-l-md uppercase tracking-widest shadow-lg">
              SL: ${slPrice}
            </div>
          </motion.div>
        </div>
      )}

      {/* Circuit limit line */}
      {!splitMode && (
        <div className="absolute top-0 left-0 w-full h-[1px] bg-[#D4AF37]/50 shadow-[0_0_10px_#D4AF37] z-40 pointer-events-none" />
      )}

      {/* Top toolbar */}
      <div className={`p-3 border-b border-[#1a1a1a] flex items-center gap-3 bg-black/40 backdrop-blur-xl relative z-20 ${splitMode ? 'h-11' : ''}`}>
        {!splitMode && (
          <>
            <div className="relative flex-1 max-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={13} />
              <input
                placeholder="Enter symbol..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full bg-black/40 border border-white/10 py-2 pl-9 pr-4 rounded-xl focus:outline-none focus:border-[#D4AF37]/50 text-xs text-white placeholder-gray-700 transition-all font-bold backdrop-blur-md"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-[#D4AF37] hover:brightness-110 text-black font-black py-2 px-4 rounded-xl transition-all text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Analyze
            </button>

            {/* Timeframe Selectors */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-lg">
              {["1m", "15m", "1h", "4h", "1D"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-2 py-1 rounded text-[9px] font-mono transition-all font-bold border ${activeTimeframe === tf ? 'bg-[#FFBF00]/10 text-[#FFBF00] border-[#FFBF00] shadow-[0_0_8px_rgba(255,191,0,0.5)]' : 'text-gray-500 border-transparent hover:text-white hover:border-white/10'}`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Intelligence Overlay Toggle */}
            <button
              onClick={() => setShowIntelOverlay(!showIntelOverlay)}
              className={`px-3 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-widest border transition-all ${showIntelOverlay ? 'bg-[#FFBF00]/20 border-[#FFBF00]/50 text-[#FFBF00] shadow-[0_0_10px_rgba(255,191,0,0.3)]' : 'bg-black/40 border-white/10 text-gray-500 hover:text-white'}`}
            >
              Intelligence Overlay
            </button>

            {/* Mentor Mode Toggle */}
            <button
              onClick={() => setIsMentorMode(!isMentorMode)}
              className={`px-3 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-widest border transition-all flex items-center gap-1.5 ${isMentorMode ? 'bg-[#00FF41]/10 border-[#00FF41]/50 text-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,0.3)]' : 'bg-black/40 border-white/10 text-gray-500 hover:text-white'}`}
            >
              <GraduationCap size={11} className={isMentorMode ? 'animate-pulse' : ''} />
              Mentor Mode
            </button>

            {/* Macro Shockwave Trigger */}
            <button
              onClick={triggerNewsShockwave}
              className="px-3 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-widest border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)] flex items-center gap-1"
            >
              <Activity size={11} className="animate-pulse" />
              Macro Shockwave
            </button>

            {/* Alphapedia Button */}
            <button
              onClick={() => setShowAlphapedia(!showAlphapedia)}
              className={`px-3 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-widest border transition-all flex items-center gap-1.5 ${showAlphapedia ? 'bg-[#FFBF00]/20 border-[#FFBF00]/50 text-[#FFBF00] shadow-[0_0_10px_rgba(255,191,0,0.3)]' : 'bg-black/40 border-white/10 text-gray-500 hover:text-white'}`}
            >
              <BookOpen size={11} />
              Alphapedia
            </button>
          </>
        )}

        {splitMode && (
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 flex-1">
            {splitMode === "2" ? "2-Chart Split" : "4-Chart Grid"} · Click symbol to change
          </span>
        )}

        {/* Split mode toggles */}
        <div className="flex items-center gap-1 ml-auto">
          {[
            { mode: null,  Icon: Square,         title: "Single" },
            { mode: "2",   Icon: LayoutTemplate, title: "2-split" },
            { mode: "4",   Icon: Grid2X2,        title: "4-split" },
          ].map(({ mode, Icon, title }) => (
            <button
              key={title}
              title={title}
              onClick={() => onSplitChange(mode)}
              className={`p-1.5 rounded-lg transition-all ${splitMode === mode ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
            >
              <Icon size={13} />
            </button>
          ))}
        </div>
      </div>

      {/* Chart body */}
      <div className="flex-1 relative overflow-hidden scanlines bg-[#020205]">
        <div className="absolute inset-0 z-0 crt-flicker opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {!splitMode ? (
          <div className="relative w-full h-full">
            <AnimatePresence>
              {showAlphapedia && (
                <motion.div
                  initial={{ opacity: 0, x: 400 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 400 }}
                  className="absolute top-4 right-4 bottom-4 w-80 bg-[#030307]/95 border border-[#FFBF00]/20 rounded-xl backdrop-blur-2xl p-5 shadow-[0_0_35px_rgba(0,0,0,0.8)] z-50 flex flex-col font-mono text-white"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-[#FFBF00]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Sovereign Cheat Sheet</span>
                    </div>
                    <button
                      onClick={() => setShowAlphapedia(false)}
                      className="text-gray-500 hover:text-white text-xs font-bold font-mono transition"
                    >
                      [CLOSE]
                    </button>
                  </div>

                  {/* Pattern Selector */}
                  <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                    {[
                      {
                        id: 1,
                        name: "Hammer Candle",
                        sentiment: "BULLISH REVERSAL",
                        color: "text-emerald-500",
                        description: "Formed at the bottom of a downtrend. Whales are aggressively rejecting low prices.",
                        entry: "Above body close + confirmation",
                        stopLoss: "Just below the long lower wick floor",
                        svg: (
                          <svg width="60" height="100" viewBox="0 0 60 100" className="mx-auto my-2">
                            <line x1="30" y1="20" x2="30" y2="25" stroke="#00e676" strokeWidth="2" />
                            <rect x="20" y="25" width="20" height="15" fill="#00e676" rx="2" />
                            <line x1="30" y1="40" x2="30" y2="90" stroke="#00e676" strokeWidth="2" strokeDasharray="1 1" />
                            <line x1="5" y1="90" x2="55" y2="90" stroke="#00FFFF" strokeWidth="1" strokeDasharray="3 3" />
                            <text x="5" y="98" fill="#00FFFF" fontSize="7" fontWeight="bold">STOP LOSS FLOOR</text>
                          </svg>
                        )
                      },
                      {
                        id: 2,
                        name: "Shooting Star",
                        sentiment: "BEARISH REVERSAL",
                        color: "text-red-500",
                        description: "Formed at the top of an uptrend. Institutional offers are absorbing the buy wicks.",
                        entry: "Below body close + confirmation",
                        stopLoss: "Just above the massive upper wick ceiling",
                        svg: (
                          <svg width="60" height="100" viewBox="0 0 60 100" className="mx-auto my-2">
                            <line x1="30" y1="10" x2="30" y2="60" stroke="#FF3131" strokeWidth="2" strokeDasharray="1 1" />
                            <rect x="20" y="60" width="20" height="15" fill="#FF3131" rx="2" />
                            <line x1="30" y1="75" x2="30" y2="80" stroke="#FF3131" strokeWidth="2" />
                            <line x1="5" y1="10" x2="55" y2="10" stroke="#FFBF00" strokeWidth="1" strokeDasharray="3 3" />
                            <text x="5" y="8" fill="#FFBF00" fontSize="7" fontWeight="bold">RESISTANCE SL</text>
                          </svg>
                        )
                      },
                      {
                        id: 3,
                        name: "Bullish Engulfing",
                        sentiment: "BULLISH TREND",
                        color: "text-emerald-500",
                        description: "A large green candle fully swallows or engulfs the previous red candle's body.",
                        entry: "Immediately at engulfing close",
                        stopLoss: "Below the red candle low coordinate",
                        svg: (
                          <svg width="90" height="100" viewBox="0 0 90 100" className="mx-auto my-2">
                            <line x1="25" y1="35" x2="25" y2="75" stroke="#FF3131" strokeWidth="1.5" />
                            <rect x="15" y="45" width="20" height="20" fill="#FF3131" rx="1" />
                            <line x1="65" y1="15" x2="65" y2="85" stroke="#00e676" strokeWidth="2" />
                            <rect x="55" y="25" width="20" height="50" fill="#00e676" rx="2" />
                          </svg>
                        )
                      }
                    ].map((pattern) => (
                      <div
                        key={pattern.id}
                        onClick={() => setSelectedPatternId(pattern.id)}
                        className={`border p-3 rounded-lg cursor-pointer transition-all ${selectedPatternId === pattern.id ? 'border-[#FFBF00] bg-[#FFBF00]/5' : 'border-white/5 hover:bg-white/5'}`}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-[10px] font-black uppercase text-white">{pattern.name}</h4>
                          <span className={`text-[8px] font-black uppercase ${pattern.color}`}>{pattern.sentiment}</span>
                        </div>
                        <p className="text-[9px] text-gray-500 mt-1 leading-normal">{pattern.description}</p>
                        
                        {selectedPatternId === pattern.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-3 border-t border-white/5 pt-3 text-center"
                          >
                            {pattern.svg}
                            <div className="text-left mt-2 flex flex-col gap-1 text-[8.5px] border-t border-white/5 pt-2">
                              <p><span className="text-gray-500">TARGET ENTRY:</span> <span className="text-white font-bold">{pattern.entry}</span></p>
                              <p><span className="text-gray-500">STOP LOSS LIMIT:</span> <span className="text-[#FFBF00] font-bold">{pattern.stopLoss}</span></p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.success(`SIMULATING: Spotted ${pattern.name}! RPG reward claimed.`);
                                const savedXp = Number(localStorage.getItem("apex_rpg_xp") || 350);
                                localStorage.setItem("apex_rpg_xp", savedXp + 250);
                              }}
                              className="mt-3 w-full py-1.5 bg-[#FFBF00] text-black text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all rounded-sm shadow-[0_0_15px_rgba(255,191,0,0.2)]"
                            >
                              Simulate Spotting
                            </button>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {activeNews && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className={`absolute top-4 inset-x-4 z-40 border px-6 py-4 backdrop-blur-xl rounded-xl flex items-center justify-between shadow-2xl ${activeNews.glowBg}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 border border-red-500/20 rounded-lg animate-ping absolute" />
                  <div className="p-2 border border-red-500/30 rounded-lg bg-red-500/10 flex items-center justify-center relative z-10">
                    <Activity size={16} className="text-red-500 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono tracking-widest text-red-500 font-bold block mb-0.5 uppercase">MACRO SHOCKWAVE SYSTEM ACTIVE</span>
                    <h3 className="text-sm font-header font-black uppercase tracking-wider text-white">
                      {activeNews.title}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{activeNews.description}</p>
                  </div>
                </div>
                <div className="text-right max-w-sm hidden md:block">
                  <span className="text-[7px] text-gray-500 font-mono block mb-1">TACTICAL INSTRUCTION</span>
                  <p className="text-[10px] font-mono font-bold text-red-500 leading-tight uppercase">
                    {activeNews.action}
                  </p>
                </div>
              </motion.div>
            )}

            <div id="tv_chart_single" ref={containerRef} className="w-full h-full bg-transparent" />
            
            {/* Holographic Scanner Overlay */}
            <div 
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsScanning(true)}
              onMouseLeave={() => { setIsScanning(false); setHoveredIdx(null); }}
              className="absolute inset-0 z-30 cursor-crosshair pointer-events-auto"
            >
              {/* Vertical Amber Laser Line */}
              {isScanning && (
                <div 
                  className="absolute top-0 bottom-0 w-[1px] bg-[#FFBF00] shadow-[0_0_12px_#FFBF00] pointer-events-none z-40"
                  style={{ left: mousePos.x }}
                />
              )}

              {/* Automated Technical Analysis Overlay (S&R Lines) */}
              {showIntelOverlay && (
                <div className="absolute inset-x-0 top-1/4 bottom-1/4 pointer-events-none z-20">
                  {/* Resistance Line */}
                  <div 
                    className="absolute inset-x-0 h-[1.5px] border-t border-dashed border-[#FFBF00] shadow-[0_0_8px_rgba(255,191,0,0.6)] flex items-center justify-end pr-4 transition-all duration-300"
                    style={{ top: `${resY}%` }}
                  >
                    <div className="bg-black/80 border border-[#FFBF00]/30 backdrop-blur-md text-[#FFBF00] font-mono font-bold text-[8px] px-2 py-0.5 rounded shadow-lg transform -translate-y-1/2">
                      RESISTANCE: Sell Wall detected. Price rejection zone.
                    </div>
                  </div>

                  {/* Support Line */}
                  <div 
                    className="absolute inset-x-0 h-[1.5px] border-t border-dashed border-[#00FFFF] shadow-[0_0_8px_rgba(0,255,255,0.6)] flex items-center justify-end pr-4 transition-all duration-300"
                    style={{ top: `${supY}%` }}
                  >
                    <div className="bg-black/80 border border-[#00FFFF]/30 backdrop-blur-md text-[#00FFFF] font-mono font-bold text-[8px] px-2 py-0.5 rounded shadow-lg transform -translate-y-1/2">
                      SUPPORT: Buy Zone detected. Price floor protection.
                    </div>
                  </div>
                </div>
              )}

              {/* Mentor Mode Glowing Current Price Line */}
              {isMentorMode && (
                <div className="absolute inset-x-0 h-[2px] bg-[#00FF41] shadow-[0_0_15px_#00FF41] top-1/2 pointer-events-none z-20 animate-pulse flex items-center justify-start pl-4">
                  <div className="bg-[#00FF41]/90 border border-[#00FF41]/30 backdrop-blur-md text-black text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-lg">
                    Current Price: Active Mentor Scan Zone
                  </div>
                </div>
              )}

              {/* Holographic Candles */}
              <div className="absolute inset-x-0 top-1/4 bottom-1/4 flex items-center justify-around px-8 pointer-events-none z-30">
                {activeCandles.map((candle, idx) => {
                  const isHovered = hoveredIdx === idx;
                  const isGreen = candle.close >= candle.open;
                  const slice = activeCandles.slice(Math.max(0, idx - 2), idx + 1);
                  const pattern = detectPatterns(slice);
                  
                  // Dimensional heights
                  const candleHeight = Math.abs(candle.close - candle.open) * 3;
                  const wickHeight = (candle.high - candle.low) * 3;
                  
                  return (
                    <div 
                      key={idx}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      className="relative flex flex-col items-center justify-center w-8 h-48 pointer-events-auto group/candle cursor-pointer"
                    >
                      {/* Wick Line */}
                      <div 
                        className={`absolute w-[1.5px] transition-all duration-300 ${isGreen ? 'bg-[#00FF41]/40' : 'bg-[#FF3131]/40'} ${isHovered ? 'bg-[#FFBF00] shadow-[0_0_8px_#FFBF00]' : ''}`}
                        style={{ height: `${wickHeight}px` }}
                      />

                      {/* Candle Body */}
                      <div 
                        className={`w-3 transition-all duration-300 relative border ${isGreen ? 'bg-[#00FF41]/10 border-[#00FF41]/50' : 'bg-[#FF3131]/10 border-[#FF3131]/50'} ${isHovered ? 'shadow-[0_0_15px_#FFBF00] border-[#FFBF00] bg-[#FFBF00]/10 scale-110 z-50' : ''}`}
                        style={{ height: `${candleHeight}px` }}
                      >
                        {/* Subtle Pattern Glow Ring */}
                        {pattern && !isHovered && (
                          <div className={`absolute -inset-1 rounded-sm border border-dashed animate-pulse pointer-events-none ${pattern.isBullish ? 'border-[#00FF41]/30 shadow-[0_0_6px_rgba(0,255,65,0.2)]' : 'border-[#FF3131]/30 shadow-[0_0_6px_rgba(255,49,49,0.2)]'}`} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Sentinel Tooltip */}
              <AnimatePresence>
                {isScanning && (isMentorMode ? (hoveredCandle && mentorFeedback) : activePattern) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute z-50 bg-black/95 border border-[#FFBF00]/30 p-4 rounded-xl shadow-[0_0_25px_rgba(255,191,0,0.25)] pointer-events-none font-mono max-w-[280px]"
                    style={{ left: Math.min(mousePos.x + 15, containerRef.current?.getBoundingClientRect().width - 300), top: mousePos.y - 140 }}
                  >
                    {isMentorMode ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center border-b border-white/10 pb-1 mb-1">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Mentor Strategic Scan</span>
                          <GraduationCap size={12} className="text-[#00FF41] animate-bounce" />
                        </div>
                        {activeNews ? (
                          <>
                            <span className="text-xs font-black tracking-wide text-red-500 animate-pulse">SHOCKWAVE RISK STATE</span>
                            <div className="bg-red-500/10 border border-red-500/20 p-2 rounded text-[8px] font-mono text-red-400 font-bold leading-normal uppercase">
                              {activeNews.action}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs font-black tracking-wide" style={{ color: mentorFeedback.color }}>{mentorFeedback.zone}</span>
                        )}
                        
                        <div className="mt-1 flex gap-1 flex-wrap">
                          <span className="text-[8px] font-mono text-gray-500 bg-white/5 px-1 py-0.5 rounded">O: {hoveredCandle.open}</span>
                          <span className="text-[8px] font-mono text-gray-500 bg-white/5 px-1 py-0.5 rounded">H: {hoveredCandle.high}</span>
                          <span className="text-[8px] font-mono text-gray-500 bg-white/5 px-1 py-0.5 rounded">L: {hoveredCandle.low}</span>
                          <span className="text-[8px] font-mono text-gray-500 bg-white/5 px-1 py-0.5 rounded">C: {hoveredCandle.close}</span>
                        </div>
                        
                        <p className="text-[9.5px] text-gray-300 leading-relaxed mt-2 border-t border-white/5 pt-2 font-bold">
                          {activeNews ? `Market volatility is extreme due to the ${activeNews.title}. Whales are aggressively positioning.` : mentorFeedback.text}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 w-48">
                        <div className="flex justify-between items-center border-b border-white/10 pb-1 mb-1">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Sentinel Scan</span>
                          <Eye size={10} className="text-[#FFBF00]" />
                        </div>
                        <span className="text-xs font-black text-[#FFBF00] tracking-wide">{activePattern.name}</span>
                        
                        <div className="mt-1">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm tracking-widest ${activePattern.isBullish ? 'bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/20' : 'bg-[#FF3131]/10 text-[#FF3131] border border-[#FF3131]/20'}`}>
                            {activePattern.sentiment}
                          </span>
                        </div>
                        
                        <p className="text-[9px] text-gray-400 leading-normal mt-1.5 border-t border-white/5 pt-1.5">
                          {activePattern.psychology}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="split-pane-container h-full bg-[#111]">
            {/* Split Panes render as normal */}
          </div>
        )}
      </div>

      {/* Tactical Briefing / Learning Goal Widget */}
      {!splitMode && (
        <div className={`absolute bottom-3 right-3 bg-black/90 border border-white/5 backdrop-blur-md p-2.5 rounded-md z-40 w-64 shadow-2xl pointer-events-none font-mono transition-all duration-300 ${isMentorMode ? 'border-[#00FF41]/20 shadow-[0_0_15px_rgba(0,255,65,0.1)]' : ''}`}>
          {isMentorMode ? (
            <>
              <div className="flex items-center gap-1.5 mb-1 text-[#00FF41]">
                <GraduationCap size={11} className="animate-pulse" />
                <span className="text-[8px] font-black tracking-widest uppercase">Learning Goal ({activeTimeframe})</span>
              </div>
              <p className="text-[9px] text-gray-300 leading-relaxed font-bold mb-1.5">
                {MENTOR_GOALS[activeTimeframe]}
              </p>
              <p className="text-[8px] text-gray-400 italic font-medium">
                {MENTOR_BRIEFINGS[activeTimeframe]}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 mb-1 text-[#D4AF37]">
                <Clock size={11} />
                <span className="text-[8px] font-black tracking-widest uppercase">Tactical Briefing ({activeTimeframe})</span>
              </div>
              <p className="text-[9px] text-gray-400 leading-relaxed font-bold">
                {BRIEFINGS[activeTimeframe]}
              </p>
            </>
          )}
        </div>
      )}

      {!splitMode && (
        <div className="absolute bottom-3 left-4 flex items-center gap-2 text-[8px] uppercase tracking-widest text-[#D4AF37]/30 pointer-events-none z-40 font-black">
          <Info size={10} />
          {isMentorMode ? "Mentor Mode Active · Hover Candlesticks for Strategic Insights" : "Intelligence Overlay Alpha Active · Hover Chart to Scan Candlesticks"}
        </div>
      )}

      {/* Indicator Playbook (only when Mentor Mode is active) */}
      {isMentorMode && (
        <div className="mt-4 p-4 bg-black/80 border border-[#00FF41]/30 rounded-xl font-mono relative overflow-hidden shadow-[0_0_15px_rgba(0,255,65,0.1)] mx-3 mb-3">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF41]/5 blur-3xl pointer-events-none" />
          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3">
            <div className="flex items-center gap-2 text-[#00FF41]">
              <BookOpen size={14} className="animate-pulse" />
              <span className="text-[10px] font-black tracking-widest uppercase">Indicator Playbook (Mentor Module)</span>
            </div>
            {/* Active Indicator selector tabs */}
            <div className="flex gap-1.5 bg-white/5 p-0.5 rounded-md border border-white/5 pointer-events-auto relative z-50">
              {["EMA 50", "RSI"].map(ind => (
                <button
                  key={ind}
                  onClick={() => setActiveIndTab(ind)}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${activeIndTab === ind ? 'bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]' : 'text-gray-500 hover:text-white'}`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-gray-300 leading-relaxed font-bold">
            {activeIndTab === "EMA 50" 
              ? "This line is the market's 'Supply Wall'. Buy when price is above it and approaching it. Sell when price is below and approaching it. Perfect for structural trend following."
              : "If RSI < 30 (Bottom Area): Market is over-discounted; look to BUY. If RSI > 70 (Top Area): Market is over-valued; look to SELL."
            }
          </p>
        </div>
      )}
    </div>
  );
}
