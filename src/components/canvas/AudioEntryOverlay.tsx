'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { Button } from '../ui/Button';

interface AudioEntryOverlayProps {
  title: string;
  audioUrl?: string | null;
  onEnter?: () => void;
}

import { Gift } from 'lucide-react';

export function AudioEntryOverlay({ title, audioUrl, onEnter }: AudioEntryOverlayProps) {
  const [introState, setIntroState] = useState<'gift' | 'dialog' | 'opened'>('gift');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [noBtnPos, setNoBtnPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (audioUrl) {
      const a = new Audio(audioUrl);
      a.loop = true;
      audioRef.current = a;
      
      a.onplay = () => setIsPlaying(true);
      a.onpause = () => setIsPlaying(false);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [audioUrl]);

  const handleEnter = () => {
    setIntroState('opened');
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play blocked:", e));
    }
    onEnter?.();
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Audio play blocked:", e));
    }
  };

  const evadeCursor = () => {
    // Generate random position within safe boundaries
    const maxX = 100;
    const maxY = 100;
    const x = (Math.random() - 0.5) * 2 * maxX;
    const y = (Math.random() - 0.5) * 2 * maxY;
    setNoBtnPos({ x, y });
  };

  return (
    <>
      {/* Persistent black backdrop - stays solid until user clicks "Of Course" */}
      {introState !== 'opened' && (
        <div className="fixed inset-0 z-40 bg-black" />
      )}

      <AnimatePresence>
        {introState === 'gift' && (
          <motion.div 
            key="gift"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="flex flex-col items-center cursor-pointer relative"
              onClick={() => setIntroState('dialog')}
            >
              {/* Box Container */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Glow */}
                <div className="absolute -inset-12 bg-love-500/20 rounded-full blur-[50px] opacity-80 animate-pulse pointer-events-none" />
                
                {/* 3D SVG Gift Box */}
                <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 overflow-visible drop-shadow-2xl">
                  <defs>
                    <linearGradient id="boxLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e11d48"/>
                      <stop offset="100%" stopColor="#881337"/>
                    </linearGradient>
                    <linearGradient id="boxRight" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fb7185"/>
                      <stop offset="100%" stopColor="#be123c"/>
                    </linearGradient>
                    <linearGradient id="boxTop" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fecdd3"/>
                      <stop offset="100%" stopColor="#fb7185"/>
                    </linearGradient>
                    <linearGradient id="ribbonLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fef08a"/>
                      <stop offset="100%" stopColor="#a16207"/>
                    </linearGradient>
                    <linearGradient id="ribbonRight" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fde047"/>
                      <stop offset="100%" stopColor="#ca8a04"/>
                    </linearGradient>
                    <linearGradient id="ribbonTop" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fef9c3"/>
                      <stop offset="100%" stopColor="#eab308"/>
                    </linearGradient>
                    <filter id="boxShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="15" stdDeviation="20" floodColor="#e11d48" floodOpacity="0.6"/>
                    </filter>
                  </defs>

                  {/* Base Box */}
                  <g filter="url(#boxShadow)">
                    <path d="M 100 160 L 40 130 L 40 80 L 100 110 Z" fill="url(#boxLeft)" stroke="#9f1239" strokeWidth="1" strokeLinejoin="round"/>
                    <path d="M 100 160 L 160 130 L 160 80 L 100 110 Z" fill="url(#boxRight)" stroke="#be123c" strokeWidth="1" strokeLinejoin="round"/>
                    <path d="M 65 142.5 L 75 147.5 L 75 97.5 L 65 92.5 Z" fill="url(#ribbonLeft)" />
                    <path d="M 135 142.5 L 125 147.5 L 125 97.5 L 135 92.5 Z" fill="url(#ribbonRight)" />
                  </g>

                  {/* Lid (Animated to float up and down) */}
                  <motion.g 
                    animate={{ y: [0, -8, 0] }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <path d="M 100 115 L 35 82.5 L 35 62.5 L 100 95 Z" fill="url(#boxLeft)" stroke="#9f1239" strokeWidth="1" strokeLinejoin="round"/>
                    <path d="M 100 115 L 165 82.5 L 165 62.5 L 100 95 Z" fill="url(#boxRight)" stroke="#be123c" strokeWidth="1" strokeLinejoin="round"/>
                    <path d="M 100 95 L 35 62.5 L 100 30 L 165 62.5 Z" fill="url(#boxTop)" stroke="#fb7185" strokeWidth="1" strokeLinejoin="round"/>
                    <path d="M 65 97.5 L 75 102.5 L 75 82.5 L 65 77.5 Z" fill="url(#ribbonLeft)" />
                    <path d="M 135 97.5 L 125 102.5 L 125 82.5 L 135 77.5 Z" fill="url(#ribbonRight)" />
                    <path d="M 65 77.5 L 75 82.5 L 140 50 L 130 45 Z" fill="url(#ribbonTop)" />
                    <path d="M 135 77.5 L 125 82.5 L 60 50 L 70 45 Z" fill="url(#ribbonTop)" />
                    <ellipse cx="100" cy="62.5" rx="20" ry="10" fill="#ca8a04" opacity="0.4" filter="blur(3px)" />
                    <path d="M 100 62.5 C 50 10, 30 50, 95 65 Z" fill="url(#ribbonLeft)" stroke="#eab308" strokeWidth="1"/>
                    <path d="M 100 62.5 C 150 10, 170 50, 105 65 Z" fill="url(#ribbonRight)" stroke="#eab308" strokeWidth="1"/>
                    <path d="M 100 65 L 75 100 L 85 102 L 103 70 Z" fill="url(#ribbonLeft)" />
                    <path d="M 100 65 L 125 100 L 115 102 L 97 70 Z" fill="url(#ribbonRight)" />
                    <ellipse cx="100" cy="62.5" rx="12" ry="9" fill="url(#ribbonTop)" stroke="#ca8a04" strokeWidth="1"/>
                  </motion.g>
                </svg>
              </div>

              <motion.p 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-white/90 font-medium tracking-widest uppercase text-sm -mt-4 drop-shadow-lg"
              >
                Tap to Open
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {introState === 'dialog' && (
          <motion.div 
            key="dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="flex flex-col items-center text-center p-8 max-w-sm mx-4 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-lg shadow-2xl"
            >
              <h1 className="text-2xl md:text-3xl font-display font-medium text-white mb-8 drop-shadow-lg leading-tight">
                {title || 'Mau lihat orang paling spesial di duniaku?'}
              </h1>
              
              <div className="flex flex-col gap-4 w-full relative">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleEnter}
                  className="w-full shadow-lg shadow-love-500/30 py-6 text-lg font-medium tracking-wide"
                >
                  Of Course 😳
                </Button>
                
                <div className="relative h-14 w-full flex items-center justify-center">
                  <motion.button
                    animate={{ x: noBtnPos.x, y: noBtnPos.y }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    onMouseEnter={evadeCursor}
                    onTouchStart={evadeCursor}
                    onClick={evadeCursor}
                    className="absolute px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white/80 transition-colors text-sm font-medium tracking-wide"
                  >
                    No 🤪
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Audio Control - visible after entering */}
      <AnimatePresence>
        {introState === 'opened' && audioUrl && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 1, duration: 0.5 }}
            onClick={toggleAudio}
            className="fixed top-5 right-5 z-40 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg"
            title={isPlaying ? 'Pause Music' : 'Play Music'}
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
            
            {/* Animated ring when playing */}
            {isPlaying && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-love-400/50 pointer-events-none"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
