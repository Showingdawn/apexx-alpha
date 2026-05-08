"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const LEVEL_03_VIDEOS = [
  { id: "94Vph1miSYg", title: "Indicator Mastery" },
  { id: "q5cDgSN0pyg", title: "Hedging & Risk Neutrality" },
  { id: "PxBbTvu-xTQ", title: "Liquidity Secrets" },
  { id: "EY5lwbCCaAM", title: "Arbitrage Strategies" },
  { id: "2M2L5nGlfJY", title: "Volatility Navigation" },
  { id: "JwL8Sy-156Q", title: "Smart Money Concepts (Price Action)" },
  { id: "FAt3PiB8-cM", title: "ICT Masterclass" }
];

export default function AcademyPlayer({ onComplete, onProgress, startVideoIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(startVideoIndex);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const playerRef = useRef(null);

  useEffect(() => {
    // Global callback for YT
    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else if (window.YT && window.YT.Player) {
      initPlayer();
    }

    function initPlayer() {
      // Delay slightly to ensure DOM element is ready
      setTimeout(() => {
        playerRef.current = new window.YT.Player("youtube-player", {
          videoId: LEVEL_03_VIDEOS[startVideoIndex].id,
          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            modestbranding: 1
          },
          events: {
            onStateChange: handlePlayerStateChange
          }
        });
      }, 100);
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (playerRef.current && playerRef.current.loadVideoById && !showCountdown) {
      playerRef.current.loadVideoById(LEVEL_03_VIDEOS[currentIndex].id);
    }
  }, [currentIndex]);

  const handlePlayerStateChange = (event) => {
    // 0 = ended
    if (event.data === window.YT.PlayerState.ENDED) {
      handleVideoEnd();
    }
  };

  const handleVideoEnd = () => {
    if (currentIndex < LEVEL_03_VIDEOS.length - 1) {
      setShowCountdown(true);
      setCountdown(5);
      
      let timer = 5;
      const interval = setInterval(() => {
        timer -= 1;
        setCountdown(timer);
        if (timer <= 0) {
          clearInterval(interval);
          setShowCountdown(false);
          const nextIndex = currentIndex + 1;
          setCurrentIndex(nextIndex);
          onProgress(Math.round(((nextIndex) / LEVEL_03_VIDEOS.length) * 100), nextIndex);
        }
      }, 1000);
    } else {
      // Completed all
      onProgress(100, LEVEL_03_VIDEOS.length);
      onComplete();
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      <div id="youtube-player" className="absolute inset-0 w-full h-full pointer-events-auto z-10" />
      
      <AnimatePresence>
        {showCountdown && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <h3 className="text-[#f0c040] font-header font-black uppercase tracking-[0.2em] text-2xl mb-4 text-center">
              Alpha Unlocked
            </h3>
            <p className="text-gray-300 font-mono mb-8 text-sm text-center">
              Proceeding to next Strategic Briefing...<br/>
              <span className="text-white font-bold">{LEVEL_03_VIDEOS[currentIndex + 1]?.title}</span>
            </p>
            <div className="text-[#00FF41] text-6xl font-black font-mono">
              {countdown}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
