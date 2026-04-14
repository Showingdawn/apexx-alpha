"use client";
import { useMemo } from "react";

export default function MarketDepth({ price }) {
  const depthData = useMemo(() => {
    if (!price) return null;
    const bids = [];
    const asks = [];
    const spread = price * 0.0002;

    for (let i = 1; i <= 5; i++) {
      const bidPrice = price - (spread * i);
      const askPrice = price + (spread * i);
      bids.push({ price: bidPrice, qty: Math.floor(Math.random() * 5000) + 1000, color: 'bg-[#00FF94]/10' });
      asks.push({ price: askPrice, qty: Math.floor(Math.random() * 5000) + 1000, color: 'bg-[#FF3131]/10' });
    }
    return { bids, asks };
  }, [price]);

  if (!depthData) return null;

  return (
    <div className="glass-panel p-4 border-white/5 bg-black/40">
      <div className="flex justify-between items-center mb-3">
         <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Market Depth (L2)</h3>
         <span className="text-[9px] font-mono text-[#D4AF37]">Spread: 0.02%</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Bids */}
        <div>
          <div className="flex justify-between text-[8px] text-gray-600 font-black uppercase mb-1">
             <span>Bid Price</span>
             <span>Qty</span>
          </div>
          {depthData.bids.map((b, i) => (
            <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5 font-mono text-[11px] relative">
               <span className="text-[#00FF94] z-10">{b.price.toFixed(2)}</span>
               <span className="text-white z-10">{b.qty}</span>
               <div className={`absolute left-0 top-0 bottom-0 ${b.color}`} style={{ width: `${(b.qty / 6000) * 100}%` }}></div>
            </div>
          ))}
        </div>

        {/* Asks */}
        <div>
          <div className="flex justify-between text-[8px] text-gray-600 font-black uppercase mb-1">
             <span>Ask Price</span>
             <span>Qty</span>
          </div>
          {depthData.asks.map((a, i) => (
            <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5 font-mono text-[11px] relative">
               <span className="text-[#FF3131] z-10">{a.price.toFixed(2)}</span>
               <span className="text-white z-10">{a.qty}</span>
               <div className={`absolute right-0 top-0 bottom-0 ${a.color}`} style={{ width: `${(a.qty / 6000) * 100}%` }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
