"use client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Trophy, Globe, Users, TrendingUp, Zap, Diamond, Award } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const TIER_DATA = [
  { name: "Completed", value: 65, color: "#f0c040" },
  { name: "Remaining", value: 35, color: "rgba(255,255,255,0.05)" },
];

export default function IBPartnerPortal() {
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
                            data={TIER_DATA}
                            innerRadius={85}
                            outerRadius={100}
                            startAngle={90}
                            endAngle={450}
                            dataKey="value"
                            stroke="none"
                         >
                            {TIER_DATA.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                         </Pie>
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-4xl font-mono font-black text-white">65%</p>
                      <p className="text-[10px] text-[#f0c040] font-header font-black mt-2">GOLD TIER</p>
                   </div>
                </div>

                <div className="mt-8 w-full flex justify-between items-center px-4">
                   <div className="text-left">
                      <p className="text-[9px] text-gray-600 font-header font-black uppercase">Current</p>
                      <p className="text-sm font-header font-black text-white">SILVER</p>
                   </div>
                   <div className="h-8 w-px bg-white/10" />
                   <div className="text-right text-[#f0c040]">
                      <p className="text-[9px] text-[#f0c040]/60 font-header font-black uppercase">Next</p>
                      <p className="text-sm font-header font-black">DIAMOND</p>
                   </div>
                </div>

                <button className="w-full mt-8 py-4 border border-[#f0c040]/30 hover:bg-[#f0c040]/5 transition-all text-[10px] font-header font-black uppercase tracking-[0.2em] text-[#f0c040]">
                   Requirement Details
                </button>
             </div>

             <div className="glass-panel p-6 border-white/10 grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/2">
                   <p className="text-[9px] text-gray-600 font-header font-black uppercase">Active Nodes</p>
                   <p className="text-2xl font-mono font-black text-white mt-1">142</p>
                </div>
                <div className="p-4 bg-white/2">
                   <p className="text-[9px] text-gray-600 font-header font-black uppercase">Volume Attrib</p>
                   <p className="text-2xl font-mono font-black text-[#00e676] mt-1">$4.2M</p>
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

                {/* SVG Heatmap Placeholder */}
                <div className="w-full h-[300px] relative opacity-60">
                   <svg viewBox="0 0 1000 500" className="w-full h-full fill-white/10">
                      <path d="M150,200 Q200,100 300,200 T450,200 T600,200 T800,200" fill="none" stroke="rgba(240,192,64,0.1)" strokeWidth="1" />
                      <circle cx="200" cy="150" r="3" fill="#f0c040">
                         <animate attributeName="opacity" values="0.2;1;0.2" dur="3s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="450" cy="250" r="5" fill="#f0c040">
                         <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="700" cy="180" r="4" fill="#f0c040">
                         <animate attributeName="opacity" values="0.2;1;0.2" dur="4s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="300" cy="300" r="2" fill="#f0c040" />
                      <circle cx="850" cy="350" r="6" fill="#f0c040">
                         <animate attributeName="opacity" values="0.2;1;0.2" dur="2.5s" repeatCount="indefinite" />
                      </circle>
                      {/* Placeholder World Map Shape */}
                      <path d="M100,100 L200,120 L300,100 L400,150 L350,200 L250,250 L150,200 Z" fill="rgba(255,255,255,0.03)" />
                      <path d="M600,100 L800,120 L900,250 L800,400 L600,350 L550,250 Z" fill="rgba(255,255,255,0.03)" />
                   </svg>
                   <div className="absolute inset-0 scanlines opacity-10" />
                </div>

                <div className="grid grid-cols-4 gap-4 mt-8">
                   {['Singapore', 'London', 'New York', 'Mumbai'].map(city => (
                      <div key={city} className="text-center">
                         <p className="text-[10px] font-mono text-white/80">{city}</p>
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
                         {[1, 2, 3, 4].map(i => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-all">
                               <td className="px-6 py-4 font-mono text-[10px] text-white/60">0x{Math.random().toString(16).slice(2, 10)}...</td>
                               <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                     <Zap size={10} className="text-[#f0c040]" />
                                     <span className="text-[10px] font-header font-black uppercase">Liquidity Div</span>
                                  </div>
                               </td>
                               <td className="px-6 py-4 text-right font-mono font-black text-[#00e676] text-[11px]">+{(Math.random() * 500).toFixed(2)}</td>
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
            Global Partner Activity Detected // Terminal ID: {Math.random().toString(36).slice(2, 8).toUpperCase()} // Yield Optimization Protocol Active // Node Synchronized
         </motion.div>
      </div>
      
      {/* Visual background elements */}
      <div className="fixed inset-0 pointer-events-none z-[100] scanlines opacity-5" />
    </div>
  );
}
