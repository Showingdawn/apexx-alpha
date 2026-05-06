"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { motion } from "framer-motion";
import { Globe, Activity, Zap } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [marketStatus, setMarketStatus] = useState({
    nse: "REGULAR",
    nyse: "CLOSED",
    crypto: "REGULAR"
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const fetchStatus = async () => {
      try {
        const [nseRes, btcRes] = await Promise.all([
          fetch(`http://localhost:3001/api/market/snapshot?symbol=${encodeURIComponent('^NSEI')}`),
          fetch(`http://localhost:3001/api/market/snapshot?symbol=${encodeURIComponent('BTC-USD')}`)
        ]);
        const nseData = await nseRes.json();
        const btcData = await btcRes.json();
        setMarketStatus(prev => ({
          ...prev,
          nse: nseData.marketState,
          crypto: btcData.marketState
        }));
      } catch (err) {
        console.error("Status fetch failed:", err);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Check every 30s
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  return (
    <motion.nav 
      className="flex justify-between items-center bg-transparent z-50 w-full"
    >
      <div className="flex items-center gap-6">
        <Link href="/">
          <h1 className="text-[#D4AF37] text-2xl font-black tracking-tighter glow-gold transition-all hover:scale-105 active:scale-95 cursor-pointer">
            APEX ALPHA <span className="text-[10px] font-mono border border-[#D4AF37]/30 px-1 bg-[#D4AF37]/10 ml-1 rounded">NG</span>
          </h1>
        </Link>
        
        {/* Market Pulse */}
        <div className="hidden md:flex items-center gap-4 bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-1.5 rounded-full">
          <div className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full ${marketStatus.nse === 'REGULAR' ? 'bg-[#00FF94] animate-pulse' : 'bg-gray-600'}`}></div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">NSE:</span>
            <span className={`text-[10px] font-bold ${marketStatus.nse === 'REGULAR' ? 'text-[#00FF94]' : 'text-gray-500'}`}>
              {marketStatus.nse === 'REGULAR' ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
          <div className="w-px h-3 bg-[#222]"></div>
          <div className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full ${marketStatus.crypto === 'REGULAR' ? 'bg-[#D4AF37] animate-pulse' : 'bg-gray-600'}`}></div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">CRYPTO:</span>
            <span className="text-[10px] font-bold text-[#D4AF37]">24/7</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {user ? (
          <>
            <Link href="/trade" className="text-white/60 hover:text-[#f0c040] transition font-header font-black text-[10px] uppercase tracking-[0.2em]">Trade</Link>
            <Link href="/portfolio" className="text-white/60 hover:text-[#f0c040] transition font-header font-black text-[10px] uppercase tracking-[0.2em]">Vault</Link>
            <Link href="/performance" className="text-white/60 hover:text-[#f0c040] transition font-header font-black text-[10px] uppercase tracking-[0.2em]">Audit</Link>
            <Link href="/ib" className="text-[#f0c040] hover:brightness-125 transition font-header font-black text-[10px] uppercase tracking-[0.2em] border-b border-[#f0c040]/30 py-1">Partner</Link>
            <div className="h-5 w-px bg-white/10 mx-2"></div>
            <button 
              onClick={handleLogout} 
              className="text-[#f0c040] hover:bg-[#f0c040]/10 font-header font-black text-[10px] border border-[#f0c040]/30 px-6 py-2.5 rounded-none transition-all uppercase tracking-[0.2em]"
            >
              Terminate Session
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-white/60 hover:text-white transition font-header font-black text-[10px] uppercase tracking-[0.2em]">Log In</Link>
            <Link href="/signup" className="glass-panel text-white px-8 py-2.5 font-header font-black text-[10px] uppercase tracking-[0.2em] transition-all border-[#f0c040]/30 hover:border-[#f0c040]">Sign Up</Link>
          </>
        )}
      </div>
    </motion.nav>
  );
}

