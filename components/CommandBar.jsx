"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Search, Zap, TrendingUp, Globe, Cpu, Moon, Sun,
  RotateCcw, X, ArrowRight, BarChart3, ShoppingCart,
  Command, ChevronRight
} from "lucide-react";

const PINNED_COMMANDS = [
  { id: "performance", icon: BarChart3, label: "Open Performance DNA", sub: "Analytics", color: "text-[#D4AF37]", tag: "page" },
  { id: "portfolio",  icon: TrendingUp,  label: "Open Portfolio",       sub: "Overview", color: "text-[#00FF94]", tag: "page" },
  { id: "split2",     icon: BarChart3,   label: "Split Chart — 2 Windows", sub: "Layout", color: "text-blue-400",  tag: "layout" },
  { id: "split4",     icon: BarChart3,   label: "Split Chart — 4 Windows", sub: "Layout", color: "text-blue-400",  tag: "layout" },
  { id: "splitoff",   icon: X,           label: "Reset to Single Chart",   sub: "Layout", color: "text-gray-400",  tag: "layout" },
  { id: "theme",      icon: Moon,        label: "Toggle Theme",            sub: "Display", color: "text-purple-400", tag: "system" },
  { id: "reset",      icon: RotateCcw,   label: "Reset Balance to $10,000","sub": "Danger", color: "text-[#FF3131]", tag: "system" },
];

const TYPE_ICON = { EQUITY: TrendingUp, CRYPTOCURRENCY: Cpu, INDEX: Globe };
const TYPE_COLOR = { EQUITY: "text-blue-400", CRYPTOCURRENCY: "text-[#D4AF37]", INDEX: "text-[#00FF94]", default: "text-gray-400" };

export default function CommandBar({ isOpen, onClose, onAction }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:3001/api/market/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.slice(0, 8));
        setActiveIdx(0);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 280);
    return () => clearTimeout(timer);
  }, [query]);

  const visibleCommands = query.trim()
    ? PINNED_COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : PINNED_COMMANDS;

  const allItems = useMemo(() => [...visibleCommands, ...results], [visibleCommands, results]);
  const total = allItems.length;

  const handleSelect = useCallback((item) => {
    if (item.tag) {
      // It's a pinned command
      onAction(item.id, null);
    } else {
      // It's an asset search result
      onAction("selectAsset", item.symbol);
    }
    onClose();
  }, [onAction, onClose]);

  // Keyboard nav
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, total - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && total > 0) {
        e.preventDefault();
        handleSelect(allItems[activeIdx]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, activeIdx, total, allItems, handleSelect, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="cmd-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="cmd-card"
            onClick={e => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <Command size={16} />
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search assets, run commands..."
                className="flex-1 bg-transparent outline-none text-[14px] text-white placeholder-gray-600 font-medium"
              />
              {loading && (
                <div className="w-4 h-4 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
              )}
              {!loading && query && (
                <button onClick={() => setQuery("")} className="text-gray-600 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              )}
              <kbd className="text-[9px] text-gray-700 border border-gray-800 rounded px-1.5 py-0.5 font-mono">ESC</kbd>
            </div>

            {/* Results list */}
            <div ref={listRef} className="max-h-[380px] overflow-y-auto custom-scrollbar py-2">
              {/* Section: Commands */}
              {visibleCommands.length > 0 && (
                <div>
                  <p className="text-[9px] text-gray-700 uppercase tracking-[0.2em] font-black px-4 py-2">
                    {query ? "Commands" : "Quick Actions"}
                  </p>
                  {visibleCommands.map((cmd, i) => {
                    const Icon = cmd.icon;
                    const isActive = activeIdx === i;
                    return (
                      <button
                        key={cmd.id}
                        data-idx={i}
                        onClick={() => handleSelect(cmd)}
                        onMouseEnter={() => setActiveIdx(i)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 transition-all ${isActive ? "bg-[#D4AF37]/10" : "hover:bg-white/3"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg bg-white/5 ${cmd.color}`}>
                            <Icon size={13} />
                          </div>
                          <div className="text-left">
                            <p className="text-[13px] text-white font-medium">{cmd.label}</p>
                            <p className="text-[10px] text-gray-600">{cmd.sub}</p>
                          </div>
                        </div>
                        <ChevronRight size={12} className={`transition-opacity ${isActive ? "opacity-100 text-[#D4AF37]" : "opacity-0"}`} />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Section: Asset Results */}
              {results.length > 0 && (
                <div>
                  <p className="text-[9px] text-gray-700 uppercase tracking-[0.2em] font-black px-4 py-2 mt-1 border-t border-white/5">
                    Market Results
                  </p>
                  {results.map((r, ri) => {
                    const globalIdx = visibleCommands.length + ri;
                    const isActive = activeIdx === globalIdx;
                    const Icon = TYPE_ICON[r.type] || Globe;
                    const col = TYPE_COLOR[r.type] || TYPE_COLOR.default;
                    return (
                      <button
                        key={r.symbol}
                        data-idx={globalIdx}
                        onClick={() => handleSelect(r)}
                        onMouseEnter={() => setActiveIdx(globalIdx)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 transition-all ${isActive ? "bg-[#D4AF37]/10" : "hover:bg-white/3"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg bg-white/5 ${col}`}>
                            <Icon size={13} />
                          </div>
                          <div className="text-left">
                            <p className="text-[13px] text-white font-medium">{r.name || r.symbol}</p>
                            <p className="text-[10px] text-gray-600 font-mono">{r.symbol} · {r.exchange}</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded border ${col} border-current/30 opacity-60`}>
                          <ArrowRight size={10} />
                          Switch
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {!loading && query.length > 1 && results.length === 0 && visibleCommands.length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-gray-700 text-[12px] font-bold">No results for &quot;{query}&quot;</p>
                </div>
              )}

              {/* No query yet */}
              {!query && (
                <div className="px-4 pt-1 pb-3">
                  <p className="text-[10px] text-gray-700 leading-relaxed">
                    Type an asset name to search · Use ↑↓ to navigate · Enter to select
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between">
              <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest">Apex Command Engine</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-700">
                  <kbd className="border border-gray-800 rounded px-1 py-0.5 font-mono text-[8px]">↑↓</kbd> navigate
                </span>
                <span className="text-[9px] text-gray-700">
                  <kbd className="border border-gray-800 rounded px-1 py-0.5 font-mono text-[8px]">↵</kbd> select
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
