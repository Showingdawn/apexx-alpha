"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const SYMBOLS = [
  { id: 'BTC-USD',  label: 'BTC/USD' },
  { id: 'ETH-USD',  label: 'ETH/USD' },
  { id: 'GC=F',     label: 'XAU/USD' },
  { id: 'EURUSD=X', label: 'EUR/USD' }
];

export default function TopBarTicker() {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const promises = SYMBOLS.map(s => 
        axios.get(`/api/market/snapshot?symbol=${encodeURIComponent(s.id)}`)
          .then(res => ({ id: s.id, ...res.data }))
          .catch(() => null)
      );
      
      const results = await Promise.all(promises);
      const nextData = {};
      results.forEach(r => { if(r) nextData[r.id] = r; });
      setData(nextData);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-8 overflow-hidden px-4">
      <div className="flex items-center gap-2 text-[8px] font-header font-black text-gray-700 uppercase tracking-[0.2em] mr-4">
        <Activity size={10} className="text-[#f0c040]" />
        Market Pulse
      </div>
      
      {SYMBOLS.map(s => {
        const item = data[s.id];
        if (!item || item.price === undefined || item.changePercent === undefined) return null;
        const isUp = item.changePercent >= 0;

        return (
          <motion.div 
            key={s.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 whitespace-nowrap"
          >
            <span className="text-[10px] font-header font-black text-white/40 uppercase tracking-widest">{s.label}</span>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono font-black ${isUp ? 'text-[#00e676]' : 'text-[#ff1744]'}`}>
                {item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`flex items-center gap-1 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${isUp ? 'bg-[#00e676]/10 text-[#00e676]' : 'bg-[#ff1744]/10 text-[#ff1744]'}`}
              >
                {isUp ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                {isUp ? '+' : ''}{item.changePercent.toFixed(2)}%
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
