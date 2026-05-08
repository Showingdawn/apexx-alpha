"use client";
import { motion } from "framer-motion";

export default function PortfolioHeatmap({ trades }) {
  // Take last 20 trades or session trades
  const heatmapData = trades.slice(0, 20);
  
  return (
    <div className="glass-panel p-4 border-white/5 bg-black/40">
      <div className="flex justify-between items-center mb-4">
         <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Session Heatmap (Insights)</h3>
         <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded bg-[#00FF94]"></div>
            <span className="text-[8px] text-gray-500 font-bold uppercase">Profitable</span>
            <div className="h-2 w-2 rounded bg-[#FF3131] ml-2"></div>
            <span className="text-[8px] text-gray-500 font-bold uppercase">Loss</span>
         </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {heatmapData.length === 0 ? (
          <div className="w-full py-8 text-center border border-dashed border-white/10 rounded-xl">
             <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">Awaiting session data...</p>
          </div>
        ) : (
          heatmapData.map((trade, i) => (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={trade.id || i}
              className={`h-12 w-12 rounded-lg ${trade.pnl >= 0 ? 'bg-[#00FF94]/20 border border-[#00FF94]/40' : 'bg-[#FF3131]/20 border border-[#FF3131]/40'} flex items-center justify-center relative group cursor-help`}
            >
               <span className={`text-[9px] font-black ${trade.pnl >= 0 ? 'text-[#00FF94]' : 'text-[#FF3131]'}`}>
                 {trade.pnl >= 0 ? '+' : ''}{Math.abs(trade.pnl).toFixed(0)}
               </span>
               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#111] border border-white/10 rounded text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {trade.asset} {'//'} {trade.type} @ {new Date(trade.createdAt).toLocaleTimeString()}
               </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
