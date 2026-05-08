"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Lock, BookOpen, Target, Cpu, CheckCircle, Clock } from "lucide-react";
import AcademyPlayer, { LEVEL_03_VIDEOS } from "@/components/AcademyPlayer";

export default function ApexAcademy() {
  const [activeVideo, setActiveVideo] = useState(null);
  const [lvl1Progress, setLvl1Progress] = useState(0);
  const [lvl3Progress, setLvl3Progress] = useState(0);
  const [lvl3VideoIndex, setLvl3VideoIndex] = useState(0);

  // Load simulated "Learning Velocity" progress from local storage
  useEffect(() => {
    const savedLvl1 = localStorage.getItem("apex_lvl1_progress");
    if (savedLvl1) setLvl1Progress(Number(savedLvl1));

    const savedLvl3Idx = localStorage.getItem("apex_lvl3_index");
    if (savedLvl3Idx) {
      const idx = Number(savedLvl3Idx);
      setLvl3VideoIndex(idx);
      setLvl3Progress(Math.round((idx / LEVEL_03_VIDEOS.length) * 100));
    }
  }, []);

  const handleCloseModal = () => {
    // Simulate learning velocity update when closing the video player
    if (activeVideo === "lvl1") {
      const newProgress = Math.min(100, lvl1Progress + 15);
      setLvl1Progress(newProgress);
      localStorage.setItem("apex_lvl1_progress", newProgress.toString());
    }
    setActiveVideo(null);
  };

  const modules = [
    {
      id: "lvl1",
      level: "Level 01",
      title: "Trading Foundations: Zero to Hero",
      focus: "Master the core mechanics of the financial markets. Learn about Candlesticks, Order Types, and the fundamental mindset required for institutional-grade trading.",
      progress: lvl1Progress,
      icon: BookOpen,
      locked: false,
      isVerified: true,
      videoUrl: "https://www.youtube.com/embed/videoseries?list=PLxNHpNhDaEFLngQFq3dIQvQO2hPZdAE8t&autoplay=1",
    },
    {
      id: "lvl2",
      level: "Level 02",
      title: "Risk Architecture & Strategic Survival",
      focus: "Move beyond speculation. Learn the mathematics of Risk-Adjusted Returns, the psychology of uncertainty, and why surviving the market is more important than the perfect entry.",
      keyPoints: [
        { title: "The Trading Tripod", desc: "Technique, Psychology, and Risk Management", time: "03:46" },
        { title: "Asymmetry of Wins/Losses", desc: "Why a 50% loss requires a 100% gain", time: "18:29" },
        { title: "Risk Transformation", desc: "Turn Capital Risk into Positional Risk", time: "54:10" },
        { title: "Anti-Fragility", desc: "Thriving in market chaos vs surviving it", time: "01:06:58" },
      ],
      progress: 45,
      icon: Target,
      locked: false,
      videoUrl: "https://www.youtube.com/embed/qN0-ltRAcV4?autoplay=1",
    },
    {
      id: "lvl3",
      level: "Level 03",
      title: "Alpha Generation",
      focus: "Algorithmic Logic, Sentiment Analysis, Hedging Strategies",
      keyPoints: LEVEL_03_VIDEOS.map(v => ({ title: v.title, desc: "Strategic Module", time: "Video" })),
      progress: lvl3Progress,
      icon: Cpu,
      locked: false, // Unlocked now
      videoUrl: "academy_player",
    }
  ];

  const activeModule = modules.find(m => m.id === activeVideo);

  return (
    <div className="min-h-screen bg-[#020205] text-white flex flex-col font-body selection:bg-[#f0c040]/30 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] scanlines" />
      
      {/* Header / Navbar */}
      <div className="px-6 py-4 border-b border-white/5 bg-black/60 backdrop-blur-2xl z-50">
        <Navbar />
      </div>

      <div className="flex-1 overflow-y-auto p-8 lg:p-16 custom-scrollbar relative z-10">
        <div className="max-w-6xl mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-header font-black uppercase tracking-[0.2em] text-[#f0c040] mb-4 glow-gold">
              Mastering the Markets
            </h1>
            <p className="text-gray-400 font-mono tracking-widest uppercase text-xs md:text-sm">
              From Theoretical Foundations to Quantitative Execution.
            </p>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-panel p-6 border relative overflow-hidden flex flex-col justify-between min-h-[400px] ${mod.locked ? 'border-white/5 opacity-50' : 'border-[#f0c040]/30 hover:shadow-[0_0_30px_rgba(240,192,64,0.1)]'}`}
              >
                {/* Content */}
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-header font-black tracking-[0.2em] uppercase text-[#f0c040] bg-[#f0c040]/10 px-2 py-1 flex items-center gap-2">
                      {mod.level}
                      {mod.isVerified && (
                        <span className="text-[#00FF41] flex items-center gap-1 bg-[#00FF41]/10 px-1 rounded-sm">
                          <CheckCircle size={10} /> Verified Content
                        </span>
                      )}
                    </span>
                    <mod.icon size={20} className={mod.locked ? 'text-gray-600' : 'text-[#f0c040]'} />
                  </div>
                  
                  <h2 className="text-xl font-header font-black uppercase tracking-wider mb-2">
                    {mod.title}
                  </h2>
                  <p className="text-xs text-gray-400 font-mono leading-relaxed mb-4">
                    {mod.focus}
                  </p>
                  
                  {mod.keyPoints && (
                    <div className="flex flex-col gap-2 mb-8">
                      {mod.keyPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-white/5 p-2 rounded-sm border border-white/5">
                          <Clock size={12} className="text-[#f0c040] mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-white leading-tight">{point.title} <span className="text-[#f0c040]">[{point.time}]</span></p>
                            <p className="text-[9px] text-gray-400 leading-tight">{point.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions & Progress */}
                <div className="mt-auto">
                  <button
                    onClick={() => !mod.locked && setActiveVideo(mod.id)}
                    disabled={mod.locked}
                    className={`w-full py-4 mb-6 font-header font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 ${mod.locked ? 'bg-white/5 text-gray-500 cursor-not-allowed' : 'bg-[#f0c040] hover:bg-[#f0c040]/90 text-black'}`}
                  >
                    {mod.locked ? <><Lock size={12} /> Locked</> : <><Play size={12} /> Start Module</>}
                  </button>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-gray-500">
                      <span>Completion</span>
                      <span className={mod.progress === 100 ? 'text-[#00FF41]' : 'text-[#f0c040]'}>{mod.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${mod.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full ${mod.progress === 100 ? 'bg-[#00FF41]' : 'bg-[#f0c040]'}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && activeModule && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 lg:p-12"
          >
            <div className="max-w-5xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-header font-black uppercase tracking-[0.2em] text-[#f0c040]">
                  {activeModule.level} Execution Module
                </h3>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-white transition font-mono text-sm"
                >
                  Close [X]
                </button>
              </div>
              <div className="glass-panel border-[#f0c040]/30 aspect-video w-full bg-black relative flex items-center justify-center overflow-hidden">
                {activeModule.videoUrl === "academy_player" ? (
                  <AcademyPlayer 
                    startVideoIndex={lvl3VideoIndex}
                    onProgress={(prog, idx) => {
                      setLvl3Progress(prog);
                      setLvl3VideoIndex(idx);
                      localStorage.setItem("apex_lvl3_index", idx.toString());
                    }}
                    onComplete={() => {
                      setLvl3Progress(100);
                      localStorage.setItem("apex_lvl3_index", LEVEL_03_VIDEOS.length.toString());
                    }}
                  />
                ) : (
                  <iframe 
                    className="absolute inset-0 w-full h-full"
                    src={activeModule.videoUrl} 
                    title="Apex Academy Video Player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
