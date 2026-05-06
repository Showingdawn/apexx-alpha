"use client";
import { useMemo } from "react";

export default function MarketDepth({ price }) {
  const depthData = useMemo(() => {
    if (!price) return null;
    const bids = [];
    const asks = [];
    const spread = price * 0.00015;

    for (let i = 1; i <= 8; i++) {
      const bidPrice = price - (spread * i);
      const askPrice = price + (spread * i);
      const bidQty = Math.floor(Math.random() * 8000) + 2000;
      const askQty = Math.floor(Math.random() * 8000) + 2000;
      bids.push({ price: bidPrice, qty: bidQty });
      asks.push({ price: askPrice, qty: askQty });
    }
    return { bids, asks };
  }, [price]);

  if (!depthData) return null;

  const maxQty = 10000;

  return (
    <div className="w-full font-body">
      <div className="flex justify-between items-center mb-6">
         <div>
            <h3 className="text-[10px] font-header font-black uppercase tracking-[0.2em] text-[#f0c040]">Liquid Depth L2</h3>
            <p className="text-[8px] text-gray-600 font-mono uppercase tracking-widest mt-1">Real-time Order Flow</p>
         </div>
         <div className="text-right">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Spread</span>
            <p className="text-[11px] font-mono text-[#f0c040] font-black">0.015%</p>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-10">
        {/* Bids */}
        <div>
          <div className="flex justify-between text-[8px] text-gray-700 font-header font-black uppercase mb-3 tracking-widest">
             <span>Bid Price</span>
             <span>Volume</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {depthData.bids.map((b, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 px-2 font-mono text-[11px] relative overflow-hidden group">
                 <span className="text-[#00e676] font-black z-10 group-hover:scale-105 transition-transform">{b.price.toFixed(2)}</span>
                 <span className="text-white/80 z-10">{b.qty.toLocaleString()}</span>
                 <div 
                   className="absolute left-0 top-0 bottom-0 depth-bid border-r border-[#00e676]/20" 
                   style={{ width: `${(b.qty / maxQty) * 100}%`, transition: 'width 0.5s ease-out' }} 
                 />
              </div>
            ))}
          </div>
        </div>

        {/* Asks */}
        <div>
          <div className="flex justify-between text-[8px] text-gray-700 font-header font-black uppercase mb-3 tracking-widest">
             <span>Volume</span>
             <span>Ask Price</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {depthData.asks.map((a, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 px-2 font-mono text-[11px] relative overflow-hidden group">
                 <span className="text-white/80 z-10">{a.qty.toLocaleString()}</span>
                 <span className="text-[#ff1744] font-black z-10 group-hover:scale-105 transition-transform">{a.price.toFixed(2)}</span>
                 <div 
                   className="absolute right-0 top-0 bottom-0 depth-ask border-l border-[#ff1744]/20" 
                   style={{ width: `${(a.qty / maxQty) * 100}%`, transition: 'width 0.5s ease-out' }} 
                 />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
