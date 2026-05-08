"use client";
import { useState, useEffect } from "react";

export default function MarketDepth({ price }) {
  const [depthData, setDepthData] = useState(null);

  useEffect(() => {
    if (!price) return;
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
    setTimeout(() => {
      setDepthData({ bids, asks });
    }, 0);
  }, [price]);

  if (!depthData) return null;

  const maxQty = 10000;

  return (
    <div className="w-full font-body">
      <div className="flex justify-between items-center mb-6">
         <div>
            <h3 className="text-[10px] font-header font-black uppercase tracking-[0.2em] text-[#ffffff]">Liquid Depth L2</h3>
            <p className="text-[8px] text-gray-600 font-mono uppercase tracking-widest mt-1">Real-time Order Flow</p>
         </div>
         <div className="text-right">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Spread</span>
            <p className="text-[11px] font-mono text-[#ffffff] font-black">0.015%</p>
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
                 <span className="text-[#00FF41] font-black z-10 group-hover:scale-105 transition-transform">{b.price.toFixed(2)}</span>
                 <span className="text-white/80 z-10">{b.qty.toLocaleString()}</span>
                 <div 
                   className="absolute left-0 top-0 bottom-0 bg-[#00FF41]/10 border-r border-[#00FF41]/20" 
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
                 <span className="text-[#FF3131] font-black z-10 group-hover:scale-105 transition-transform">{a.price.toFixed(2)}</span>
                 <div 
                   className="absolute right-0 top-0 bottom-0 bg-[#FF3131]/10 border-l border-[#FF3131]/20" 
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
