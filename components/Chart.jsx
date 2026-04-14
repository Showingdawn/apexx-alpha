"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Info, LayoutTemplate, Grid2X2, Square } from "lucide-react";

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
    // Clean up previous widget
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

// Mini pane header with symbol selector
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

export default function Chart({ selectedAsset, onAssetSearch, slPrice, tpPrice, setSlPrice, setTpPrice, splitMode, onSplitChange }) {
  const containerRef = useRef(null);
  const chartAreaRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [slY, setSlY] = useState(450);
  const [tpY, setTpY] = useState(150);

  // Per-pane symbols for split view
  const [paneSymbols, setPaneSymbols] = useState(() => {
    const defaults = ["BTC-USD", "Nifty 50", "ETH-USD", "Bank Nifty"];
    return defaults;
  });

  // Sync pane[0] with parent selectedAsset
  useEffect(() => {
    setPaneSymbols(prev => {
      const next = [...prev];
      next[0] = selectedAsset;
      return next;
    });
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

  // Single chart widget
  useEffect(() => {
    if (splitMode || !scriptLoaded || !window.TradingView || !containerRef.current) return;
    containerRef.current.innerHTML = "";
    new window.TradingView.widget({
      ...TV_CONFIG,
      symbol: mapToTVSymbol(selectedAsset),
      container_id: "tv_chart_single",
    });
  }, [selectedAsset, scriptLoaded, splitMode]);

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    const pair = searchInput.toUpperCase().trim();
    const finalPair = pair.indexOf(":") === -1 ? `OANDA:${pair}` : pair;
    onAssetSearch(finalPair);
    setSearchInput("");
  };

  const paneCount = splitMode === "4" ? 4 : splitMode === "2" ? 2 : 1;

  return (
    <div className="bento-card border-[#1a1a1a] flex flex-col transition-all relative overflow-hidden" style={{ height: splitMode === "4" ? 620 : 600 }}>
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
            <div className="relative flex-1 max-w-[280px]">
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
              className="bg-[#D4AF37] hover:brightness-110 text-black font-black py-2 px-5 rounded-xl transition-all text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Analyze
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
      <div className="flex-1 relative overflow-hidden">
        {!splitMode && (
          <div id="tv_chart_single" ref={containerRef} className="w-full h-full bg-[#050505]" />
        )}

        {(splitMode === "2" || splitMode === "4") && (
          <div className={`split-pane-container ${splitMode === "2" ? "split-2" : "split-4"} h-full`}>
            {Array.from({ length: paneCount }, (_, i) => (
              <div key={i} className="split-pane relative">
                <PaneHeader
                  symbol={paneSymbols[i] || selectedAsset}
                  paneIdx={i}
                  onSymbolChange={sym => setPaneSymbols(prev => { const n = [...prev]; n[i] = sym; return n; })}
                />
                <div className="absolute inset-0 pt-7">
                  <TVPane
                    id={`tv_chart_pane_${i}`}
                    symbol={paneSymbols[i] || selectedAsset}
                    scriptLoaded={scriptLoaded}
                    compact={paneCount > 2}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!splitMode && (
        <div className="absolute bottom-2 left-4 flex items-center gap-2 text-[8px] uppercase tracking-widest text-[#D4AF37]/30 pointer-events-none z-10 font-black">
          <Info size={10} />
          Intelligence Overlay Alpha Active
        </div>
      )}
    </div>
  );
}
