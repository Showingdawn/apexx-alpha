"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import TradeHistory from "@/components/TradeHistory";
import { Shield, Lock, Zap } from "lucide-react";

export default function PortfolioPage() {
  const [trades, setTrades] = useState([]); 

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
    <div className="min-h-screen bg-[#020205] text-white font-body selection:bg-[#f0c040]/30 overflow-x-hidden">
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="px-6 py-4 border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-50"
      >
        <Navbar />
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1600px] mx-auto px-6 py-12"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
           <div>
              <div className="flex items-center gap-4 mb-3">
                 <div className="p-3 border border-[#f0c040]/30 text-[#f0c040]">
                    <Shield size={24} />
                 </div>
                 <div>
                    <h1 className="text-3xl font-header font-black tracking-[0.1em] uppercase text-white">Sovereign Vault</h1>
                    <p className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.3em] mt-1">Institutional Asset Management</p>
                 </div>
              </div>
              <div className="h-px w-64 bg-gradient-to-r from-[#f0c040]/40 to-transparent mt-4" />
           </div>
           
           <div className="flex gap-4">
              <div className="glass-panel px-6 py-3 border-white/5 flex items-center gap-3">
                 <Lock size={14} className="text-[#f0c040]" />
                 <span className="text-[10px] font-header font-black uppercase tracking-widest text-white/40">Encryption: Tier 5 Active</span>
              </div>
           </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Stats Section */}
          <motion.div variants={itemVariants} className="lg:col-span-12">
            <div className="glass-panel p-1 border-white/10 shadow-3xl">
               <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                  <h2 className="text-[10px] font-header font-black text-gray-400 uppercase tracking-[0.2em]">Inventory Matrix</h2>
               </div>
               <StatsBar />
            </div>
          </motion.div>
          
          {/* History Section */}
          <motion.div variants={itemVariants} className="lg:col-span-12">
            <div className="glass-panel border-white/10 shadow-3xl overflow-hidden relative">
               <div className="absolute inset-0 pointer-events-none opacity-[0.02] scanlines" />
               <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center relative z-10">
                  <h2 className="text-[10px] font-header font-black text-gray-400 uppercase tracking-[0.2em]">Ledger Synchronization</h2>
                  <div className="flex items-center gap-2">
                     <Zap size={10} className="text-[#f0c040] animate-pulse" />
                     <span className="text-[9px] font-mono text-[#f0c040]/60 uppercase tracking-widest">Live Updates Linked</span>
                  </div>
               </div>
               <div className="p-2">
                  <TradeHistory optimisticTrades={trades} setOptimisticTrades={setTrades} />
               </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Ticker Bottom Decor */}
      <div className="fixed bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#f0c040]/30 to-transparent opacity-50" />
      <div className="fixed inset-0 pointer-events-none z-[100] scanlines opacity-[0.03]" />
    </div>
  );
}
