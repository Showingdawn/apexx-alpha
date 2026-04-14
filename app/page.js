"use client";
import Link from 'next/link';
import { motion } from "framer-motion";
import { TrendingUp, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-[#eaecef] overflow-hidden relative selection:bg-[#D4AF37]/30">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center max-w-3xl px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-8">
            <Zap size={14} className="text-[#D4AF37]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Next-Gen Intelligence Active</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-none">
            APEX ALPHA<br />
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#f5d061] to-[#D4AF37] bg-clip-text text-transparent">NEW GEN</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-xl mx-auto font-medium leading-relaxed">
            The ultimate agentic trading simulator. Experience real-time neural market data and refine your edge with high-precision intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="group relative px-10 py-4 bg-[#D4AF37] hover:brightness-110 text-black font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)] overflow-hidden">
               <span className="relative z-10 flex items-center gap-2 uppercase tracking-widest text-sm">
                 Initialize Terminal <TrendingUp size={18} />
               </span>
               <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </Link>
            
            <Link href="/login" className="px-10 py-4 bg-transparent hover:bg-white/5 text-white font-black rounded-2xl transition-all border border-[#1a1a1a] uppercase tracking-widest text-sm">
              Authenticate
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-t border-[#1a1a1a] pt-12">
             <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                   <Zap size={16} />
                </div>
                <h3 className="text-white font-black uppercase text-xs tracking-widest">Nano-Sec Execution</h3>
                <p className="text-gray-600 text-[10px] leading-relaxed">Paper trading with real-time liquidity simulations and zero-lag response.</p>
             </div>
             <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                   <Brain size={16} />
                </div>
                <h3 className="text-white font-black uppercase text-xs tracking-widest">Agentic Insights</h3>
                <p className="text-gray-600 text-[10px] leading-relaxed">Neural sentiment analysis and intent-based nudges for every asset.</p>
             </div>
             <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                   <ShieldCheck size={16} />
                </div>
                <h3 className="text-white font-black uppercase text-xs tracking-widest">V3 Security</h3>
                <p className="text-gray-600 text-[10px] leading-relaxed">Encrypted ledger-grade authentication for global data integrity.</p>
             </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 text-[10px] font-black uppercase tracking-[0.5em] text-gray-800">
        Engine Protocol v5.1 // DeepMind Systems
      </div>
    </div>
  );
}

// Helper for Brain icon since it was used in landing page mockup
function Brain({ size, className }) {
   return (
     <svg 
       width={size} 
       height={size} 
       viewBox="0 0 24 24" 
       fill="none" 
       stroke="currentColor" 
       strokeWidth="2" 
       strokeLinecap="round" 
       strokeLinejoin="round" 
       className={className}
     >
       <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.64Z"/>
       <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.64Z"/>
     </svg>
   );
}

