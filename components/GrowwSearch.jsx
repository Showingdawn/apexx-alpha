"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Globe, TrendingUp, Cpu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function GrowwSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        try {
          const res = await axios.get(`/api/market/search?q=${encodeURIComponent(query)}`);
          setResults(res.data);
          setIsOpen(true);
        } catch (e) {
          console.error("Search failed", e);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <div className="relative group">
         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500 group-focus-within:text-[#D4AF37] transition-colors" />
         </div>
         <input
           type="text"
           placeholder="Search Stocks, Crypto, Indices (Zerodha Speed x Groww Style)"
           value={query}
           onChange={(e) => setQuery(e.target.value)}
           className="w-full bg-black/40 border border-white/5 group-hover:bg-black/60 focus:bg-[#0a0a0a] focus:border-[#D4AF37]/40 focus:ring-4 focus:ring-[#D4AF37]/5 transition-all outline-none pl-12 pr-12 py-3.5 rounded-2xl text-[13px] font-medium text-white placeholder-gray-600 backdrop-blur-3xl shadow-2xl"
         />
         {loading && (
           <div className="absolute inset-y-0 right-4 flex items-center">
              <div className="w-4 h-4 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></div>
           </div>
         )}
         {!loading && query && (
           <button 
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-white"
           >
             <X size={16} />
           </button>
         )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-3 bg-[#0a0a0a]/95 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-3xl z-[100]"
          >
            <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {results.map((res, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onSelect(res.symbol);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="w-full text-left p-3.5 hover:bg-[#D4AF37]/10 rounded-xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-gray-400 group-hover:text-[#D4AF37] transition-all">
                       {res.type === 'EQUITY' ? <TrendingUp size={16} /> : res.type === 'CRYPTOCURRENCY' ? <Cpu size={16} /> : <Globe size={16} />}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-white mb-0.5">{res.name}</p>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{res.symbol} • {res.exchange}</p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-[9px] font-black border border-[#D4AF37]/30 text-[#D4AF37] px-2 py-1 rounded-md uppercase">Switch</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-3 bg-black/40 border-t border-white/5 flex items-center justify-center gap-4">
               <span className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em]">Powered by Apex IQ Engine</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
