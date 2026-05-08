"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Zap, Shield, Target, Trophy, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const TITLES = [
  "Novice Analyst",
  "Chart Whisperer",
  "Liquidity Raider",
  "Volatility Native",
  "Sovereign Market Maker"
];

const INITIAL_QUESTS = [
  { id: 1, title: "Scalping Mastery", description: "Execute 3 successful scalp trades on the 1m chart.", xp: 250, completed: false, claimed: false },
  { id: 2, title: "Candle Sentry", description: "Spot a reversal pattern under Mentor Mode.", xp: 350, completed: true, claimed: false },
  { id: 3, title: "Capital Survival", description: "Navigate a Macro Shockwave without liquidation.", xp: 450, completed: false, claimed: false },
  { id: 4, title: "Liquidity Raid", description: "Execute a panic order with >$5k buying power.", xp: 500, completed: true, claimed: false },
];

export default function AlphaQuests() {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(350);
  const [quests, setQuests] = useState(INITIAL_QUESTS);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    const savedLevel = localStorage.getItem("apex_rpg_level");
    const savedXp = localStorage.getItem("apex_rpg_xp");
    const savedQuests = localStorage.getItem("apex_rpg_quests");

    if (savedLevel) setLevel(Number(savedLevel));
    if (savedXp) setXp(Number(savedXp));
    if (savedQuests) {
      try { setQuests(JSON.parse(savedQuests)); } catch (e) {}
    }

    const forceLevelUp = () => {
      setLevel(prev => {
        const nextLvl = Math.min(TITLES.length, prev + 1);
        localStorage.setItem("apex_rpg_level", nextLvl.toString());
        return nextLvl;
      });
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 5000);
    };

    window.addEventListener("apex_trigger_levelup", forceLevelUp);
    return () => window.removeEventListener("apex_trigger_levelup", forceLevelUp);
  }, []);

  const saveState = (newLvl, newXp, newQ) => {
    localStorage.setItem("apex_rpg_level", newLvl);
    localStorage.setItem("apex_rpg_xp", newXp);
    localStorage.setItem("apex_rpg_quests", JSON.stringify(newQ));
  };

  const handleClaim = (questId) => {
    const updated = quests.map(q => q.id === questId ? { ...q, claimed: true } : q);
    const target = quests.find(q => q.id === questId);
    if (!target) return;

    let nextXp = xp + target.xp;
    let nextLvl = level;

    toast.success(`CLAIMED: +${target.xp} XP for ${target.title}!`, {
      style: {
        background: '#020205',
        color: '#FFBF00',
        border: '1px solid rgba(255,191,0,0.3)',
        fontFamily: 'monospace'
      }
    });

    if (nextXp >= 1000) {
      nextXp -= 1000;
      nextLvl = Math.min(TITLES.length, nextLvl + 1);
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 5000);
    }

    setLevel(nextLvl);
    setXp(nextXp);
    setQuests(updated);
    saveState(nextLvl, nextXp, updated);
  };

  const handleSimulateQuest = (questId) => {
    const updated = quests.map(q => q.id === questId ? { ...q, completed: true } : q);
    setQuests(updated);
    saveState(level, xp, updated);
    toast.success(`Quest Completed: "${quests.find(q => q.id === questId)?.title}" is now claimable!`);
  };

  return (
    <div className="flex flex-col h-full font-mono text-white relative">
      {/* Quests Scroll List */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
        {quests.map(quest => (
          <div 
            key={quest.id} 
            className={`border p-3 transition-all relative overflow-hidden ${quest.claimed ? 'border-white/5 bg-white/1 opacity-40' : quest.completed ? 'border-[#FFBF00]/30 bg-[#FFBF00]/5' : 'border-white/10 bg-transparent'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] font-bold uppercase tracking-wider block mb-1 px-1 py-0.5 rounded-sm w-fit" style={{ backgroundColor: quest.claimed ? 'rgba(255,255,255,0.05)' : quest.completed ? 'rgba(255,191,0,0.2)' : 'rgba(255,255,255,0.05)', color: quest.claimed ? '#666' : quest.completed ? '#FFBF00' : '#888' }}>
                  {quest.claimed ? "CLAIMED" : quest.completed ? "COMPLETED" : "IN PROGRESS"}
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">{quest.title}</h4>
                <p className="text-[9px] text-gray-500 mt-1 leading-normal font-medium">{quest.description}</p>
              </div>
              <div className="text-right pl-2 flex flex-col gap-1.5 items-end">
                <span className="text-[9px] font-black text-[#00e676]">+{quest.xp} XP</span>
                {!quest.claimed && (
                  quest.completed ? (
                    <button
                      onClick={() => handleClaim(quest.id)}
                      className="px-2 py-1 bg-[#FFBF00] hover:brightness-110 transition text-black font-black text-[8px] uppercase tracking-wider rounded-sm shadow-[0_0_10px_rgba(255,191,0,0.3)]"
                    >
                      CLAIM
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSimulateQuest(quest.id)}
                      className="px-2 py-1 border border-white/10 hover:bg-white/5 transition text-gray-400 hover:text-white font-black text-[8px] uppercase tracking-wider rounded-sm"
                    >
                      SIMULATE
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Level Up Hologram Overlay */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-black/95 border border-[#FFBF00] flex flex-col items-center justify-center text-center z-50 p-6 shadow-2xl"
          >
            <div className="p-3 border border-[#FFBF00]/30 bg-[#FFBF00]/10 text-[#FFBF00] rounded-full animate-bounce mb-4">
              <Trophy size={32} />
            </div>
            <span className="text-[8px] font-mono tracking-widest text-[#FFBF00] font-bold block uppercase mb-1">SOVEREIGN LEVEL ACHIEVED</span>
            <h2 className="text-xl font-header font-black text-white uppercase tracking-wider mb-2">
              LEVEL {level}!
            </h2>
            <p className="text-[10px] text-gray-400 max-w-xs font-mono uppercase tracking-widest mb-6 leading-relaxed">
              Unlocked "{TITLES[level - 1] || "Apex Market Maker"}" Referrals Status & Commissions Booster!
            </p>
            <button
              onClick={() => setShowLevelUp(false)}
              className="px-4 py-2 border border-[#FFBF00] text-[#FFBF00] hover:bg-[#FFBF00] hover:text-black font-black text-[9px] uppercase tracking-widest transition-all rounded-sm"
            >
              ACKNOWLEDGE Handshake
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
