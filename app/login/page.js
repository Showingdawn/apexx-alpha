"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Zap } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    // Dramatic delay for "System Calibrating" effect
    await new Promise(r => setTimeout(r, 800));
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Identity Verified. Access Granted.");
      window.location.href = "/trade"; 
    } catch (err) {
      toast.error("Handshake Failed: " + err.message.replace("Firebase: ", ""));
      setProcessing(false);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setProcessing(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      toast.success("Google Auth Verified.");
      window.location.href = "/trade";
    } catch (err) {
      toast.error("Auth Failure: " + err.message.replace("Firebase: ", ""));
      setProcessing(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020205] px-4 relative overflow-hidden font-body selection:bg-[#f0c040]/30 selection:text-white">
      {/* Background Starfield */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#f0c040] opacity-[0.02] blur-[150px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Sovereign Neural Pulse Ring */}
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 border border-[#f0c040]/30 blur-2xl -m-8 pointer-events-none rounded-none"
        />

        {/* Quantum Pulse Container with Digital Noise */}
        <motion.div
           animate={{ 
             boxShadow: [
               "0 0 20px rgba(240,192,64,0.05)", 
               "0 0 50px rgba(240,192,64,0.15)", 
               "0 0 20px rgba(240,192,64,0.05)"
             ] 
           }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
           className="bg-black/60 backdrop-blur-3xl p-10 sm:p-12 border border-white/5 relative overflow-hidden shadow-2xl group"
        >
          {/* Sovereign Digital Noise Layer */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] noise-bg group-hover:opacity-[0.08] transition-opacity duration-1000" />
          
          {/* Internal Scanlines */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] scanlines" />
          
          {/* Processing Bar */}
          <AnimatePresence>
            {processing && (
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute top-0 left-0 right-0 h-[2px] bg-[#f0c040] shadow-[0_0_10px_#f0c040] origin-left z-50"
              />
            )}
          </AnimatePresence>

          <div className="text-center mb-10">
            <Link href="/" className="inline-block mb-6 group">
              <h1 className="text-[#f0c040] text-3xl font-header font-black tracking-[0.2em] group-hover:brightness-125 transition-all">
                APEX<span className="text-white">ALPHA</span>
              </h1>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[#f0c040]/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </Link>
            <h2 className="text-xs font-header font-black text-gray-500 uppercase tracking-[0.4em] mb-2">Security Handshake</h2>
            <p className="text-[10px] text-gray-700 font-mono uppercase tracking-widest italic">Terminal Access Restricted to Sovereign Tier</p>
          </div>
          
          <button 
            onClick={handleGoogleSignIn}
            disabled={processing}
            className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-header font-black py-4 px-4 transition-all disabled:opacity-30 mb-8 uppercase tracking-widest text-[10px]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#f0c040"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#ffffff" opacity="0.1"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#f0c040" opacity="0.6"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#f0c040" opacity="0.4"/>
            </svg>
            Continue with G-Cloud
          </button>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-[#f0c040] transition-colors" />
              <input 
                type="email" 
                placeholder="Identity Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/5 py-4 pl-12 pr-4 focus:outline-none focus:border-[#f0c040]/40 text-white transition-all text-[11px] font-mono tracking-widest placeholder:text-gray-800"
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-[#f0c040] transition-colors" />
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Secure Cipher"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/5 py-4 pl-12 pr-12 focus:outline-none focus:border-[#f0c040]/40 text-white transition-all text-[11px] font-mono tracking-widest placeholder:text-gray-800"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-800 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={processing}
              className="w-full bg-transparent border border-[#f0c040]/40 hover:bg-[#f0c040]/10 text-[#f0c040] font-header font-black py-5 mt-4 transition-all uppercase tracking-[0.3em] text-[11px] disabled:opacity-30 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[#f0c040] translate-y-full group-hover:translate-y-0 text-black transition-transform duration-300 flex items-center justify-center">
                 Access Terminal
              </div>
              <span className={processing ? "animate-pulse" : ""}>
                {processing ? "Decrypting..." : "Initialize Link"}
              </span>
            </button>
          </form>

          <p className="text-center text-gray-700 mt-10 text-[9px] uppercase tracking-[0.2em] font-mono">
            Unregistered Entity? <Link href="/signup" className="text-white hover:text-[#f0c040] transition-colors">Apply for Sovereignty</Link>
          </p>
        </motion.div>
        
        {/* Footer Metrics */}
        <div className="mt-8 flex justify-between items-center opacity-20">
           <div className="flex items-center gap-2 text-[8px] font-mono text-white tracking-widest">
              <ShieldCheck size={10} />
              AES-512 ACTIVE
           </div>
           <div className="flex items-center gap-2 text-[8px] font-mono text-white tracking-widest uppercase">
              <Zap size={10} />
              Latency: 0.12ms
           </div>
        </div>
      </motion.div>

      {/* Ticker Bottom Decor */}
      <div className="fixed bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#f0c040]/30 to-transparent opacity-50" />
      <div className="fixed inset-0 pointer-events-none z-[100] scanlines opacity-[0.03]" />
    </div>
  );
}
