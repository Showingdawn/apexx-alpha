"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[Sovereign-System] Critical Failure:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-12 bg-[#020205] border border-[#ff1744]/20 glass-panel">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border border-[#ff1744]/30 text-[#ff1744] flex items-center justify-center mx-auto mb-8">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-white font-header font-black uppercase tracking-[0.4em] text-sm mb-4">Spectral Instability Detected</h2>
            <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mb-10 max-w-xs mx-auto leading-loose">
              The neural link has drifted outside operational parameters. 
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 hover:border-[#f0c040]/40 text-[#f0c040] font-header font-black text-[10px] uppercase tracking-[0.2em] transition-all group mx-auto"
            >
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
              System Re-Calibrating
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
