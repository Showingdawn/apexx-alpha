"use client";
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { TrendingUp, ShieldCheck, Zap, Activity, Globe } from "lucide-react";

// ─── Magnetic Button Component ───────────────────────────
function MagneticButton({ children, className, href }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    // Magnetic pull radius 50px
    const radius = 50;
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
    
    if (distance < radius) {
      x.set(distanceX * 0.4);
      y.set(distanceY * 0.4);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Content = (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );

  return href ? <Link href={href}>{Content}</Link> : Content;
}

// ─── Main Landing Page ───────────────────────────────────
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      setStars(Array.from({ length: 50 }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 2}px`,
        height: `${Math.random() * 2}px`,
        boxShadow: `0 0 ${Math.random() * 5}px rgba(255, 255, 255, 0.5)`,
        opacity: Math.random(),
        scale: Math.random(),
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 5
      })));
    }, 0);
  }, []);

  if (!mounted) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020205] text-white overflow-hidden relative selection:bg-[#f0c040]/30 selection:text-white font-body">
      
      {/* 3D Depth: Parallax Starfield */}
      <div className="absolute inset-0 z-0">
        <div className="stars-layer-1 absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
        <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, rgba(240, 192, 64, 0.05) 0%, transparent 70%)" />
        
        {/* Layered Stars (CSS Generated) */}
        {stars.map((star, i) => (
          <motion.div
            key={i}
            initial={{ opacity: star.opacity, scale: star.scale }}
            animate={{ 
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: star.duration, 
              repeat: Infinity,
              delay: star.delay
            }}
            className="absolute rounded-full bg-white"
            style={{
              top: star.top,
              left: star.left,
              width: star.width,
              height: star.height,
              boxShadow: star.boxShadow
            }}
          />
        ))}
      </div>

      {/* Top Ticker (Sovereign Upgrade) */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "circOut" }}
        className="fixed top-0 w-full z-50 px-8 py-2 glass-panel border-x-0 border-t-0 flex items-center justify-between backdrop-blur-3xl bg-[#020205]/40"
      >
        <div className="flex items-center gap-8 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Index Variance</span>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-[#00e676] animate-pulse" />
              <span className="text-[11px] font-mono text-[#00e676] font-black">18.42VIX</span>
            </div>
          </div>
          
          <div className="h-4 w-px bg-white/5" />

          {/* Core Assets */}
          <div className="flex items-center gap-8">
             {[
               { symbol: "BTC", price: "68,421.50", change: "+1.42%", up: true },
               { symbol: "ETH", price: "3,452.12", change: "+2.11%", up: true },
               { symbol: "XAU/USD", price: "2,350.80", change: "-0.15%", up: false },
             ].map((ticker, i) => (
                <div key={i} className="flex items-center gap-3">
                   <span className="text-[9px] font-mono text-gray-500 uppercase font-black">{ticker.symbol}</span>
                   <span className="text-[11px] font-mono text-white font-black tracking-tight">{ticker.price}</span>
                   <div className={`flex items-center gap-1.5 px-1.5 py-0.5 border ${ticker.up ? 'border-[#00e676]/30 text-[#00e676]' : 'border-[#ff1744]/30 text-[#ff1744]'}`}>
                      <div className={`h-1 w-1 rounded-full ${ticker.up ? 'bg-[#00e676]' : 'bg-[#ff1744]'} animate-pulse`} />
                      <span className="text-[9px] font-mono font-black">{ticker.change}</span>
                   </div>
                </div>
             ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 text-[10px] font-mono text-[#f0c040] font-black tracking-widest uppercase">
              <Zap size={12} className="animate-pulse" />
              <span>Sovereign Node: <span className="text-white">Active</span></span>
           </div>
           <div className="h-4 w-px bg-white/5" />
           <div className="flex items-center gap-4 text-[9px] font-mono text-gray-500 font-bold uppercase tracking-[0.2em]">
              <Globe size={12} />
              <span>Global Latency: 0.4ms</span>
           </div>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-5xl px-6 relative z-10"
      >
        <motion.div variants={itemVariants} className="mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 glass-panel mb-12">
            <Zap size={14} className="text-[#f0c040] fill-[#f0c040]/30" />
            <span className="text-[10px] font-header font-black uppercase tracking-[0.3em] text-[#f0c040]">Quantum Ledger Active v9.0</span>
          </div>

          <h1 className="text-8xl md:text-[160px] font-header font-black text-white mb-6 leading-[0.8] tracking-[-5px]">
            APEX ALPHA
          </h1>
          <div className="text-2xl md:text-5xl font-header font-black uppercase tracking-[0.2em] mb-12">
            <span className="shimmer-text">NEW GEN</span>
          </div>
          
          <p className="text-lg md:text-xl text-gray-400 mb-16 max-w-2xl mx-auto font-body font-medium leading-relaxed opacity-80">
            Institutional-grade liquidity simulations for the sovereign elite. 
            Calibrate your edge with sub-millisecond neural intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="relative group">
               {/* Neural Pulse Ring */}
               <motion.div 
                 animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute inset-0 rounded-none border border-[#f0c040] blur-xl -m-4 pointer-events-none"
               />
               
               <MagneticButton 
                 href="/signup"
                 className="px-12 py-5 bg-[#f0c040] text-black font-header font-black rounded-none transition-all shadow-[0_30px_60px_rgba(240,192,64,0.3)] overflow-hidden group border border-[#f0c040] relative"
               >
                  <span className="relative z-10 flex items-center gap-3 uppercase tracking-widest text-sm">
                    Initialize Terminal <TrendingUp size={18} />
                  </span>
                  {/* Shimmer Effect */}
                  <motion.div 
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 z-20 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 origin-bottom" />
               </MagneticButton>
            </div>
            
            <MagneticButton 
              href="/login"
              className="px-12 py-5 bg-transparent text-white font-header font-black rounded-none transition-all border border-white/20 glass-panel uppercase tracking-widest text-sm"
            >
              Authenticate
            </MagneticButton>
          </div>
        </motion.div>

        {/* Feature Grid Staggered */}
        <motion.div variants={itemVariants} className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-1 px-8">
           {[
             { icon: Zap, title: "Nano-Sec Execution", desc: "Liquid architecture with sub-1ms trade clearing simulation." },
             { icon: Activity, title: "Neural Synthesis", desc: "AI-driven order flow visualizations and sentiment heatmaps." },
             { icon: ShieldCheck, title: "Vanguard Security", desc: "Military-grade encryption for proprietary strategy data." }
           ].map((feature, idx) => (
             <div key={idx} className="glass-panel p-8 text-left border-white/5 hover:border-[#f0c040]/30 transition-colors">
                <div className="w-10 h-10 rounded-none border border-[#f0c040]/30 flex items-center justify-center text-[#f0c040] mb-6">
                   <feature.icon size={20} />
                </div>
                <h3 className="text-white font-header font-black uppercase text-xs tracking-[0.2em] mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-[11px] leading-relaxed font-body">{feature.desc}</p>
             </div>
           ))}
        </motion.div>
      </motion.div>

      <div className="fixed bottom-8 text-[10px] font-mono font-black uppercase tracking-[0.8em] text-gray-700 opacity-30 select-none">
        System Protocol: Sovereign Elite Tier // Access Level 10
      </div>

      {/* Global Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] scanlines" />
    </div>
  );
}

