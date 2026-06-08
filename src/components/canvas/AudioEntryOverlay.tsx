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
      <AnimatePresence mode="wait">
        {introState === 'gift' && (
          <motion.div 
            key="gift"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="flex flex-col items-center gap-4 cursor-pointer"
              onClick={() => setIntroState('dialog')}
            >
              <div className="relative w-32 h-32 flex items-center justify-center rounded-3xl bg-love-500/20 border border-love-400/30 shadow-[0_0_50px_-12px_rgba(232,67,147,0.5)]">
                <Gift className="w-16 h-16 text-love-400" />
                <motion.div 
                  className="absolute inset-0 rounded-3xl border-2 border-love-400/50"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <p className="text-white/80 font-medium tracking-wide">Ada pesan untukmu...</p>
            </motion.div>
          </motion.div>
        )}

        {introState === 'dialog' && (
          <motion.div 
            key="dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="flex flex-col items-center text-center p-8 max-w-sm mx-4 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-lg shadow-2xl"
            >
              <h1 className="text-2xl md:text-3xl font-display font-medium text-white mb-8 drop-shadow-lg leading-tight">
                Mau lihat orang paling spesial di duniaku?
              </h1>
              
              <div className="flex flex-col gap-4 w-full relative">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleEnter}
                  className="w-full shadow-lg shadow-love-500/30 py-6 text-lg"
                >
                  Tentu saja 😍
                </Button>
                
                <div className="relative h-14 w-full flex items-center justify-center">
                  <motion.button
                    animate={{ x: noBtnPos.x, y: noBtnPos.y }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    onMouseEnter={evadeCursor}
                    onTouchStart={evadeCursor}
                    onClick={evadeCursor}
                    className="absolute px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white/80 transition-colors text-sm font-medium"
                  >
                    Nggak dulu 😜
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
