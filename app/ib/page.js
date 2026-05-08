"use client";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Trophy, Globe, Users, TrendingUp, Zap, Diamond, Award } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";

const TIER_DATA = [
  { name: "Completed", value: 65, color: "#f0c040" },
  { name: "Remaining", value: 35, color: "rgba(255,255,255,0.05)" },
];

const CITIES = [
  { name: "Singapore", cx: 720, cy: 300, nodeType: "Core Gateway", latency: "14ms", volume: "$1.8M", color: "#f0c040" },
  { name: "London", cx: 480, cy: 160, nodeType: "Relay Node", latency: "68ms", volume: "$950K", color: "#00e676" },
  { name: "New York", cx: 280, cy: 180, nodeType: "Liquidity Relay", latency: "72ms", volume: "$1.1M", color: "#00FFFF" },
  { name: "Mumbai", cx: 640, cy: 240, nodeType: "Edge Gateway", latency: "38ms", volume: "$450K", color: "#E040FB" },
];

export default function IBPartnerPortal() {
  const [randomData, setRandomData] = useState([]);
  const [terminalId, setTerminalId] = useState("");
  const [hoveredCity, setHoveredCity] = useState(null);

  // Escalation simulation states
  const [completionValue, setCompletionValue] = useState(65);
  const [activeNodes, setActiveNodes] = useState(142);
  const [volumeAttrib, setVolumeAttrib] = useState(4.2);
  const [isEscalating, setIsEscalating] = useState(false);

  const triggerEscalationSimulation = () => {
    if (isEscalating) return;
    setIsEscalating(true);
    let currentPct = completionValue;
    let currentNodes = activeNodes;
    let currentVol = volumeAttrib;

    const interval = setInterval(() => {
      if (currentPct < 100) {
        currentPct += 1;
        currentNodes = Math.min(250, currentNodes + 3);
        currentVol = Math.min(8.5, currentVol + 0.12);

        setCompletionValue(currentPct);
        setActiveNodes(currentNodes);
        setVolumeAttrib(parseFloat(currentVol.toFixed(2)));
      } else {
        clearInterval(interval);
        setIsEscalating(false);
      }
    }, 40);
  };

  const tierData = [
    { name: "Completed", value: completionValue, color: completionValue >= 100 ? "#00FF41" : "#f0c040" },
    { name: "Remaining", value: 100 - completionValue, color: "rgba(255,255,255,0.05)" },
  ];

  useEffect(() => {
    setTerminalId(Math.random().toString(36).slice(2, 8).toUpperCase());
    setRandomData([1, 2, 3, 4, 5].map(() => ({
      hash: Math.random().toString(16).slice(2, 10),
      yieldAmt: (Math.random() * 400 + 50).toFixed(2)
    })));

    const streamInterval = setInterval(() => {
      setRandomData(prev => {
        const nextHash = Math.random().toString(16).slice(2, 10);
        const nextYield = (Math.random() * 400 + 50).toFixed(2);
        return [{ hash: nextHash, yieldAmt: nextYield }, ...prev.slice(0, 4)];
      });
    }, 3500);

    return () => clearInterval(streamInterval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white font-body overflow-x-hidden">
      <div className="px-6 py-4 border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
        <Navbar />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 py-12"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex items-center gap-4 mb-3">
             <div className="p-3 border border-[#f0c040]/30 text-[#f0c040]">
                <Trophy size={24} />
             </div>
             <div>
                <h1 className="text-3xl font-header font-black tracking-[0.1em] uppercase">Elite Partner Portal</h1>
                <p className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.3em] mt-1">Sovereign IB Tier Management</p>
             </div>
          </div>
          <div className="h-px bg-gradient-to-r from-[#f0c040]/40 to-transparent mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
           {/* LEFT: TIER PROGRESS (Radial) */}
           <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-8">
              <div className="glass-panel p-8 border-white/10 flex flex-col items-center text-center relative overflow-hidden">
                 <div className="absolute top-4 right-4 text-[#f0c040]/20">
                    <Diamond size={80} strokeWidth={1} />
                 </div>

                 <h2 className="text-[10px] font-header font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Tier Escalation</h2>
                 
                 <div className="relative w-64 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={tierData}
                             innerRadius={85}
                             outerRadius={100}
                             startAngle={90}
                             endAngle={450}
                             dataKey="value"
                             stroke="none"
                          >
                             {tierData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <p className="text-4xl font-mono font-black text-white">{completionValue}%</p>
                       <p className="text-[10px] text-[#f0c040] font-header font-black mt-2 uppercase tracking-widest">
                         {completionValue >= 100 ? "DIAMOND TIER" : "GOLD TIER"}
                       </p>
                    </div>
                 </div>

                 <div className="mt-8 w-full flex justify-between items-center px-4">
                    <div className="text-left">
                       <p className="text-[9px] text-gray-600 font-header font-black uppercase">Current</p>
                       <p className="text-sm font-header font-black text-white">{completionValue >= 100 ? "DIAMOND" : "SILVER"}</p>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="text-right text-[#f0c040]">
                       <p className="text-[9px] text-[#f0c040]/60 font-header font-black uppercase">Next</p>
                       <p className="text-sm font-header font-black">{completionValue >= 100 ? "ELITE" : "DIAMOND"}</p>
                    </div>
                 </div>

                 <button
                    onClick={triggerEscalationSimulation}
                    disabled={isEscalating}
                    className="w-full mt-8 py-4 border border-[#f0c040]/30 hover:bg-[#f0c040]/5 disabled:opacity-50 transition-all text-[10px] font-header font-black uppercase tracking-[0.2em] text-[#f0c040]"
                 >
                    {isEscalating ? "Node Expansion Cycle..." : completionValue >= 100 ? "Escalation Cycle Complete" : "PROMPT ESCALATION CYCLE"}
                 </button>
              </div>

              <div className="glass-panel p-6 border-white/10 grid grid-cols-2 gap-4">
                 <div className="p-4 bg-white/2">
                    <p className="text-[9px] text-gray-600 font-header font-black uppercase">Active Nodes</p>
                    <p className="text-2xl font-mono font-black text-white mt-1">{activeNodes}</p>
                 </div>
                 <div className="p-4 bg-white/2">
                    <p className="text-[9px] text-gray-600 font-header font-black uppercase">Volume Attrib</p>
                    <p className="text-2xl font-mono font-black text-[#00e676] mt-1">${volumeAttrib}M</p>
                 </div>
              </div>
           </motion.div>

          {/* RIGHT: GLOBAL HEATMAP & ACTIVITY */}
          <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col gap-8 text-white">
             {/* Global Heatmap Placeholder */}
             <div className="glass-panel p-8 border-white/10 relative h-[450px]">
                <div className="flex justify-between items-center mb-8">
                   <div>
                      <h2 className="text-[10px] font-header font-black text-white uppercase tracking-[0.3em]">Network Propagation Map</h2>
                      <p className="text-[8px] text-gray-600 font-mono uppercase tracking-widest mt-1">Real-time Node Activity</p>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                         <div className="h-1.5 w-1.5 rounded-full bg-[#f0c040] animate-pulse" />
                         <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Live Feed Access</span>
                      </div>
                   </div>
                </div>

                 {/* SVG Heatmap & Dynamic Interactive Laser Grid */}
                 <div className="w-full h-[300px] relative">
                    <svg viewBox="0 0 1000 500" className="w-full h-full fill-white/5 relative z-10">
                       {/* Background global link network lines */}
                       <path d="M150,200 Q200,100 300,200 T450,200 T600,200 T800,200" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                       <path d="M280,180 Q480,160 640,240 T720,300" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4 4" />
                       
                       {/* Active laser connector if a city is hovered */}
                       {hoveredCity && (
                          <motion.line
                             x1={hoveredCity.cx}
                             y1={hoveredCity.cy}
                             x2={720} // Center Core: Singapore
                             y2={300}
                             stroke={hoveredCity.color}
                             strokeWidth="1.5"
                             strokeDasharray="6 3"
                             initial={{ strokeDashoffset: 0 }}
                             animate={{ strokeDashoffset: -20 }}
                             transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                       )}

                       {/* Interactive nodes plotting */}
                       {CITIES.map((city, index) => (
                          <g 
                             key={index} 
                             onMouseEnter={() => setHoveredCity(city)}
                             onMouseLeave={() => setHoveredCity(null)}
                             className="cursor-pointer group"
                          >
                             <circle cx={city.cx} cy={city.cy} r={hoveredCity?.name === city.name ? "12" : "6"} fill="none" stroke={city.color} strokeWidth="1" className="transition-all duration-300 opacity-30 animate-pulse" />
                             <circle cx={city.cx} cy={city.cy} r={hoveredCity?.name === city.name ? "6" : "4"} fill={city.color} className="transition-all duration-300" />
                          </g>
                       ))}

                       {/* Placeholder World Map Shape */}
                       <path d="M100,100 L200,120 L300,100 L400,150 L350,200 L250,250 L150,200 Z" fill="rgba(255,255,255,0.02)" />
                       <path d="M600,100 L800,120 L900,250 L800,400 L600,350 L550,250 Z" fill="rgba(255,255,255,0.02)" />
                    </svg>

                    {/* Glowing HUD Overlay inside map */}
                    <AnimatePresence>
                       {hoveredCity && (
                          <motion.div
                             initial={{ opacity: 0, y: 10, scale: 0.95 }}
                             animate={{ opacity: 1, y: 0, scale: 1 }}
                             exit={{ opacity: 0, y: 10, scale: 0.95 }}
                             className="absolute bottom-4 left-4 bg-black/90 border border-white/10 p-4 font-mono w-60 z-20 shadow-2xl"
                          >
                             <span className="text-[7px] text-gray-500 uppercase tracking-widest block mb-1">NODE HANDSHAKE ACTIVE</span>
                             <h4 className="text-[12px] font-black uppercase text-white tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: hoveredCity.color }} /> {hoveredCity.name}
                             </h4>
                             <div className="h-[1px] bg-white/5 my-2" />
                             <div className="grid grid-cols-2 gap-2 text-[8px] text-gray-400">
                                <div>
                                   <p className="text-[7px] text-gray-600 uppercase">PROTOCOL TYPE</p>
                                   <p className="text-white font-bold mt-0.5">{hoveredCity.nodeType}</p>
                                </div>
                                <div>
                                   <p className="text-[7px] text-gray-600 uppercase">LATENCY</p>
                                   <p className="text-[#00e676] font-bold mt-0.5">{hoveredCity.latency}</p>
                                </div>
                                <div className="col-span-2">
                                   <p className="text-[7px] text-gray-600 uppercase">VOLUME ALLOCATED</p>
                                   <p className="text-[#f0c040] font-black mt-0.5">{hoveredCity.volume}</p>
                                </div>
                             </div>
                          </motion.div>
                       )}
                    </AnimatePresence>

                    <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />
                 </div>

                 <div className="grid grid-cols-4 gap-4 mt-8">
                    {CITIES.map(city => (
                       <div 
                          key={city.name} 
                          onMouseEnter={() => setHoveredCity(city)}
                          onMouseLeave={() => setHoveredCity(null)}
                          className={`text-center py-2 border transition-all duration-300 cursor-pointer ${hoveredCity?.name === city.name ? "border-[#f0c040]/50 bg-[#f0c040]/5" : "border-white/5 bg-transparent"}`}
                       >
                          <p className="text-[10px] font-mono font-bold text-white/80">{city.name}</p>
                          <p className="text-[8px] text-[#f0c040] font-black mt-1 uppercase tracking-widest">Active Node</p>
                       </div>
                    ))}
                 </div>
             </div>

             {/* Earnings Table Overhaul */}
             <div className="glass-panel border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                   <h2 className="text-[10px] font-header font-black text-white uppercase tracking-[0.3em]">Quantum Revenue Stream</h2>
                   <div className="flex items-center gap-2 text-[#00e676] font-mono text-xs">
                      <TrendingUp size={14} /> +12.4% MoM
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="text-gray-600 uppercase tracking-[0.2em] text-[8px] font-header font-black border-b border-white/5">
                            <th className="px-6 py-4">Transaction hash</th>
                            <th className="px-6 py-4">Protocol</th>
                            <th className="px-6 py-4 text-right">Yield (USDT)</th>
                            <th className="px-6 py-4 text-center">Status</th>
                         </tr>
                      </thead>
                      <tbody>
                         {randomData.map((data, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-all">
                               <td className="px-6 py-4 font-mono text-[10px] text-white/60">0x{data.hash}...</td>
                               <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                     <Zap size={10} className="text-[#f0c040]" />
                                     <span className="text-[10px] font-header font-black uppercase">Liquidity Div</span>
                                  </div>
                               </td>
                               <td className="px-6 py-4 text-right font-mono font-black text-[#00e676] text-[11px]">+{data.yieldAmt}</td>
                               <td className="px-6 py-4 text-center">
                                  <span className="text-[8px] font-header font-black uppercase border border-[#00e676]/30 text-[#00e676] px-2 py-0.5 rounded-none">Confirmed</span>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Ticker Bottom */}
      <div className="fixed bottom-0 w-full py-2 bg-black/80 backdrop-blur-xl border-t border-white/5 z-50 overflow-hidden">
         <motion.div 
           initial={{ x: "100%" }} 
           animate={{ x: "-100%" }} 
           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           className="flex gap-12 whitespace-nowrap text-[9px] font-mono font-black uppercase tracking-[0.4em] text-[#f0c040]/30"
         >
            Global Partner Activity Detected {'//'} Terminal ID: {terminalId || '000000'} {'//'} Yield Optimization Protocol Active {'//'} Node Synchronized
         </motion.div>
      </div>
      
      {/* Visual background elements */}
      <div className="fixed inset-0 pointer-events-none z-[100] scanlines opacity-5" />
    </div>
  );
}
