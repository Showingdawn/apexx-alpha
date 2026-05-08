"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, TrendingUp, TrendingDown, Eye, Activity, Award, CheckCircle2, ChevronRight, Filter, Flame, Globe } from "lucide-react";
import toast from "react-hot-toast";

const MOCK_NEWS_STORIES = [
  {
    id: 1,
    title: "RELIANCE INDUSTRIES: Strategic Retail Expansion Drives Massive 3.5% Surge",
    category: "STOCKS",
    time: "2 mins ago",
    impact: "HIGHLY BULLISH",
    impactPercent: "+3.5%",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    source: "NSE Pulse",
    summary: "Reliance Industries announced a series of strategic retail partnerships across major metropolitan nodes. Institutional buying limit orders clustered heavily around the $2,420 coordinate, sparking a high-velocity momentum breakout.",
    tacticalTip: "Look for price to test the newly established support at $2,440. Whales are stacking asks at $2,500."
  },
  {
    id: 2,
    title: "NIFTY 50: Breaches Historical 22,500 Resistance on High-Volume Option Sweeps",
    category: "STOCKS",
    time: "15 mins ago",
    impact: "EXTREME BULLISH",
    impactPercent: "+1.8%",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    source: "Bloomberg Alpha",
    summary: "Nifty 50 breached its critical psychological resistance wall at 22,500. Option chain telemetry indicates a major short-covering rally as retail call writers are forced to liquidate positions.",
    tacticalTip: "Avoid shorting the momentum. A retest of 22,480 is an optimal long continuation entry floor."
  },
  {
    id: 3,
    title: "CPI INFLATION: Cools Down to 2.8% Triggering Global Equity Buying Wave",
    category: "MACRO",
    time: "32 mins ago",
    impact: "BULLISH BREAKOUT",
    impactPercent: "+2.1%",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10 border-cyan-500/20",
    source: "Reuters Desk",
    summary: "Global inflation cooling faster than consensus expectations has led to aggressive speculation of rate cuts. Whales are shifting capital from defensive bonds back into high-growth equities.",
    tacticalTip: "A high-beta stocks rally is underway. Leverage can be amplified moderately as risk floors stabilize."
  },
  {
    id: 4,
    title: "TATA MOTORS: Production Bottlenecks Lead to Short-Term Selling Pressure",
    category: "STOCKS",
    time: "1 hour ago",
    impact: "MODERATE BEARISH",
    impactPercent: "-2.4%",
    color: "text-red-500",
    bgColor: "bg-red-500/10 border-red-500/20",
    source: "NSE Pulse",
    summary: "Temporary supply chain constraints inside the microchip division have stalled delivery targets, triggering high-frequency algo sells. However, long-term buy orders remain active near the $910 floor.",
    tacticalTip: "Wait for the sell volume to dissipate near $905 before evaluating fresh buy triggers."
  },
  {
    id: 5,
    title: "BITCOIN: Whales Sweep Active Sell Walls at $64,000 as Halving Looming",
    category: "CRYPTO",
    time: "2 hours ago",
    impact: "HIGH VOLATILITY",
    impactPercent: "+4.8%",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    source: "Sovereign Feed",
    summary: "Over $120M in short liquidations cascade as Bitcoin price rockets past $64,200. Order book analytics show massive spot buying blocks from spot ETF custodians.",
    tacticalTip: "Keep tight stops on short leverages. Margin squeeze levels are highly sensitive at $65k."
  },
  {
    id: 6,
    title: "HDFC BANK: Foreign Institutional Investors (FII) Absorb Heavy Sell blocks",
    category: "STOCKS",
    time: "3 hours ago",
    impact: "ACCUMULATION PHASE",
    impactPercent: "+0.8%",
    color: "text-[#FFBF00]",
    bgColor: "bg-[#FFBF00]/10 border-[#FFBF00]/20",
    source: "Bloomberg Alpha",
    summary: "FII blocks have absorbed large selling pressure from domestic retail accounts. FII accumulation implies a strong conviction floor is being established for a medium-term bull rally.",
    tacticalTip: "Accumulate along the $1,420 - $1,440 channel to coordinate with institutional positioning."
  }
];

export default function NewsPage() {
  const [selectedStory, setSelectedStory] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL STORIES");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStories = MOCK_NEWS_STORIES.filter(s => {
    const matchesTab = activeTab === "ALL STORIES" || s.category === activeTab;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#020205] text-white flex flex-col relative font-mono overflow-y-auto">
      {/* Background Cyber-Vectors */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#FFBF00]/5 via-transparent to-transparent pointer-events-none z-0" />
      
      {/* Top Navigation */}
      <div className="px-8 py-4 border-b border-white/5 bg-black/60 backdrop-blur-2xl z-50">
        <Navbar />
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-6 grid grid-cols-1 xl:grid-cols-4 gap-6 z-10">
        
        {/* COLUMN 1: LIVE SENTIMENT & FEEDS */}
        <div className="flex flex-col gap-6 xl:col-span-1">
          {/* Sentiment Meter Panel */}
          <div className="glass-panel border-[#FFBF00]/20 bg-[#030307]/80 p-5 rounded-none flex flex-col gap-4 relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFBF00]/30 to-transparent" />
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-[#FFBF00] animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFBF00]">MARKET SENTIMENT COGNITION</h3>
            </div>
            
            <div className="flex flex-col items-center justify-center py-6 border border-white/5 bg-black/40 rounded-lg">
              <span className="text-4xl font-black text-[#00e676] tracking-tighter">78/100</span>
              <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">GREED CONVICTION</span>
              <div className="w-[80%] bg-white/5 h-1.5 mt-4 rounded-full overflow-hidden border border-white/10">
                <div className="bg-[#00e676] h-full w-[78%] rounded-full shadow-[0_0_8px_rgba(0,230,118,0.4)]" />
              </div>
            </div>

            <div className="text-[9px] text-gray-400 leading-relaxed border-t border-white/5 pt-3">
              Institutional buy limits vastly outperform sell allocations across the NSE and Crypto sectors. Bullish expansion continues.
            </div>
          </div>

          {/* Active News Feeds status */}
          <div className="glass-panel border-white/10 bg-[#030307]/50 p-5 rounded-none flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Globe size={12} className="text-gray-400" />
              <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-400">ACTIVE FEED CHANNELS</h3>
            </div>
            {[
              { name: "NSE Live Trade Stream", latency: "42ms", state: "STABLE" },
              { name: "Bloomberg Alpha Wire", latency: "110ms", state: "STABLE" },
              { name: "Reuters Institutional Desk", latency: "95ms", state: "STABLE" },
              { name: "Sovereign Intelligence Node", latency: "15ms", state: "SYNCED" }
            ].map((feed, idx) => (
              <div key={idx} className="flex justify-between items-center text-[9px] border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <span className="text-gray-300 font-bold">{feed.name}</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-gray-500">{feed.latency}</span>
                  <span className="h-1 w-1 rounded-full bg-[#00e676]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNS 2-4: MAIN NEWS STORY STREAM */}
        <div className="xl:col-span-3 flex flex-col gap-5">
          {/* Filtering bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-white/5 pb-4">
            <div className="flex flex-wrap gap-2">
              {["ALL STORIES", "STOCKS", "MACRO", "CRYPTO"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); }}
                  className={`px-4 py-1.5 text-[9px] uppercase font-black tracking-widest transition-all border ${activeTab === tab ? 'bg-[#FFBF00]/10 border-[#FFBF00] text-[#FFBF00] shadow-[0_0_10px_rgba(255,191,0,0.15)]' : 'bg-black/40 border-white/5 text-gray-500 hover:text-white hover:border-white/20'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Live Search input */}
            <div className="w-full md:w-64 relative">
              <input
                type="text"
                placeholder="Search Stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 text-[10px] font-mono px-3.5 py-1.5 focus:outline-none focus:border-[#FFBF00] transition-colors rounded-none"
              />
            </div>
          </div>

          {/* Stories List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence mode="wait">
              {filteredStories.map((story) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setSelectedStory(story)}
                  className="glass-panel border-white/10 bg-[#030307]/90 hover:border-[#FFBF00]/30 transition-all cursor-pointer p-5 flex flex-col gap-3 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFBF00]/2 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl pointer-events-none" />
                  
                  {/* Category & Impact Row */}
                  <div className="flex justify-between items-center text-[8px] font-bold">
                    <span className="text-[#FFBF00] bg-[#FFBF00]/5 border border-[#FFBF00]/20 px-2 py-0.5 uppercase tracking-widest font-black rounded-sm">
                      {story.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500 font-mono uppercase">{story.time}</span>
                      <span className="h-1 w-1 rounded-full bg-white/20" />
                      <span className={`px-2 py-0.5 uppercase border ${story.color} ${story.bgColor}`}>
                        {story.impact} ({story.impactPercent})
                      </span>
                    </div>
                  </div>

                  {/* Headline Title */}
                  <h4 className="text-[12px] font-header font-black text-white leading-relaxed group-hover:text-[#FFBF00] transition-colors mt-1 uppercase">
                    {story.title}
                  </h4>

                  {/* Short Summary */}
                  <p className="text-[10px] text-gray-400 leading-relaxed font-mono line-clamp-2">
                    {story.summary}
                  </p>

                  {/* Card Footer */}
                  <div className="border-t border-white/5 pt-3 mt-1 flex justify-between items-center text-[8px] font-mono uppercase text-gray-500">
                    <span className="font-bold">FEED SOURCE: {story.source}</span>
                    <span className="text-[#FFBF00] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      DEEP ANALYSIS <ChevronRight size={10} />
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* INSTITUTIONAL NEWS DETAIL MODAL */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="max-w-2xl w-full bg-[#030307] border border-[#FFBF00]/30 p-6 relative flex flex-col gap-4 font-mono shadow-[0_0_50px_rgba(0,0,0,0.9)]"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div>
                  <span className="text-[8px] font-black text-[#FFBF00] bg-[#FFBF00]/5 border border-[#FFBF00]/20 px-2 py-0.5 uppercase tracking-widest rounded-sm">
                    {selectedStory.category}
                  </span>
                  <h3 className="text-sm font-header font-black text-white uppercase mt-2">
                    {selectedStory.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="text-gray-500 hover:text-white text-xs font-bold transition font-mono"
                >
                  [CLOSE]
                </button>
              </div>

              {/* Body summary */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4 text-[9px] text-gray-500">
                  <p>FEED: <span className="text-white font-bold">{selectedStory.source}</span></p>
                  <p>TIME: <span className="text-white font-bold">{selectedStory.time}</span></p>
                  <p>IMPACT SCORE: <span className="text-emerald-400 font-bold">{selectedStory.impactPercent}</span></p>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed bg-black/40 border border-white/5 p-3.5 rounded-lg">
                  {selectedStory.summary}
                </p>
              </div>

              {/* Technical / Tactical advice */}
              <div className="border-t border-[#FFBF00]/10 pt-4 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-[10px] text-[#FFBF00] font-black">
                  <Award size={12} />
                  <span>TACTICAL INSTITUTIONAL ADVICE</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed italic bg-[#FFBF00]/2 border border-[#FFBF00]/10 p-3 rounded-lg">
                  "{selectedStory.tacticalTip}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <button
                  onClick={() => {
                    toast.success("Holographic chart simulation triggered on trade floor!");
                    setSelectedStory(null);
                  }}
                  className="py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[9px] font-black uppercase tracking-widest transition-all rounded-sm"
                >
                  Simulate Impact
                </button>
                <button
                  onClick={() => {
                    setSelectedStory(null);
                    window.location.href = "/trade";
                  }}
                  className="py-2 bg-[#FFBF00] hover:brightness-110 text-black text-[9px] font-black uppercase tracking-widest transition-all rounded-sm shadow-[0_0_15px_rgba(255,191,0,0.25)]"
                >
                  Enter Trade Floor
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
