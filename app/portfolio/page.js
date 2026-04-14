"use client";
import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import TradeHistory from "@/components/TradeHistory";
import { useState } from "react";

export default function PortfolioPage() {
  const [trades, setTrades] = useState([]); // This will be fetched from API later

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 p-4 flex flex-col gap-6 max-w-7xl mx-auto w-full mt-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Portfolio Overview</h2>
          <StatsBar />
        </div>
        
        <div>
          <TradeHistory optimisticTrades={trades} setOptimisticTrades={setTrades} />
        </div>
      </div>
    </div>
  );
}
