"use client";
import { useState } from "react";
import { Play, Flame, Trophy, HelpCircle, Volume2 } from "lucide-react";
import { playMechanicalClick } from "@/utils/sound";
import toast from "react-hot-toast";

export default function PresentationHUD() {
  const [loading, setLoading] = useState(false);

  const dispatchEvent = (name, msg) => {
    playMechanicalClick();
    const event = new Event(name);
    window.dispatchEvent(event);
    toast.success(msg, {
      icon: "⚡",
      duration: 3000
    });
  };

  const demoTactileAudio = () => {
    playMechanicalClick();
    // Simulate mechanical typewriter / keyboard click pattern
    setTimeout(() => playMechanicalClick(), 120);
    setTimeout(() => playMechanicalClick(), 240);
    setTimeout(() => playMechanicalClick(), 300);
    toast.success("Synthesized Tactical mechanical click melody!");
  };

  return (
    <div className="glass-panel border-[#FFBF00]/30 bg-[#04040a]/95 p-4 rounded-none flex flex-col gap-3 relative shadow-[0_0_20px_rgba(255,191,0,0.1)]">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFBF00]/40 to-transparent" />
      
      <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400">SOVEREIGN PRESENTATION HUD</h4>
      </div>

      <p className="text-[8.5px] text-gray-500 font-mono leading-tight">
        Judges Quick-Launch: One-click interactive triggers to showcase Apex Alpha advanced systems instantly.
      </p>

      <div className="grid grid-cols-2 gap-2 text-[8px] font-mono">
        <button
          onClick={() => dispatchEvent("apex_trigger_shockwave", "Shockwave Simulation Loaded!")}
          className="flex items-center justify-center gap-1 py-2 border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/15 text-red-400 font-black tracking-widest transition-all uppercase rounded-sm"
        >
          <Flame size={10} /> SHOCKWAVE
        </button>

        <button
          onClick={() => dispatchEvent("apex_trigger_levelup", "Holographic Level-Up Fired!")}
          className="flex items-center justify-center gap-1 py-2 border border-[#FFBF00]/30 hover:border-[#FFBF00] bg-[#FFBF00]/5 hover:bg-[#FFBF00]/15 text-[#FFBF00] font-black tracking-widest transition-all uppercase rounded-sm"
        >
          <Trophy size={10} /> LEVEL-UP
        </button>

        <button
          onClick={() => dispatchEvent("apex_trigger_alphapedia", "Alphapedia Overlays Opened!")}
          className="flex items-center justify-center gap-1 py-2 border border-cyan-500/30 hover:border-cyan-500 bg-cyan-500/5 hover:bg-cyan-500/15 text-cyan-400 font-black tracking-widest transition-all uppercase rounded-sm"
        >
          <HelpCircle size={10} /> ALPHAPEDIA
        </button>

        <button
          onClick={demoTactileAudio}
          className="flex items-center justify-center gap-1 py-2 border border-purple-500/30 hover:border-purple-500 bg-purple-500/5 hover:bg-purple-500/15 text-purple-400 font-black tracking-widest transition-all uppercase rounded-sm"
        >
          <Volume2 size={10} /> TACTILE CLICK
        </button>
      </div>
    </div>
  );
}
