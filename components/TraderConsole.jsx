"use client";
import { useMemo } from "react";
import { Zap, Target, BarChart, ShieldAlert } from "lucide-react";

export default function TraderConsole({ history }) {
  const stats = useMemo(() => {
    if (!history || history.length === 0) return { drawdown: 0, streak: 0, avgProfit: 0 };
    
    let maxDrawdown = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let totalProfit = 0;
    let closedTrades = history.filter(t => t.status === 'CLOSED');

    closedTrades.forEach(t => {
      totalProfit += (t.pnl || 0);
      if ((t.pnl || 0) > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return {
      drawdown: 0.12, // Simulated for demo
      streak: maxStreak,
      avgProfit: closedTrades.length > 0 ? totalProfit / closedTrades.length : 0,
      totalTrades: closedTrades.length
    };
  }, [history]);

  return (
    <div className="glass-panel p-6 border-white/5 bg-black/40">
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
         <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
            <Target size={16} />
         </div>
         <div>
           <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Financial DNA</h3>
           <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Zerodha Console v2.0</p>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
         <div>
            <div className="flex items-center gap-2 mb-1">
               <ShieldAlert size={12} className="text-[#FF3131]" />
               <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Max Drawdown</span>
            </div>
            <p className="text-xl font-mono font-black text-white">{(stats.drawdown * 100).toFixed(2)}%</p>
         </div>
         <div>
            <div className="flex items-center gap-2 mb-1">
               <Zap size={12} className="text-[#00FF94]" />
               <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Win Streak</span>
            </div>
            <p className="text-xl font-mono font-black text-white">{stats.streak} <span className="text-[10px] text-gray-600">TRADES</span></p>
         </div>
         <div>
            <div className="flex items-center gap-2 mb-1">
               <BarChart size={12} className="text-[#D4AF37]" />
               <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Avg Profit/Trade</span>
            </div>
            <p className="text-xl font-mono font-black text-white">
              {stats.avgProfit >= 0 ? '+' : ''}${Math.abs(stats.avgProfit).toFixed(2)}
            </p>
         </div>
         <div>
            <div className="flex items-center gap-2 mb-1">
               <Target size={12} className="text-blue-400" />
               <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Total Volume</span>
            </div>
            <p className="text-xl font-mono font-black text-white">{(stats.totalTrades * 1000).toLocaleString()}</p>
         </div>
      </div>
    </div>
  );
}
