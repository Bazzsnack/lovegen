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

export function AudioEntryOverlay({ title, audioUrl, onEnter }: AudioEntryOverlayProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    setIsOpen(false);
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

  return (
    <>
      {/* Entry Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex flex-col items-center text-center p-8 max-w-md"
            >
              <h1 className="text-4xl md:text-5xl font-display font-medium text-white mb-10 drop-shadow-lg">
                {title}
              </h1>
              
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleEnter}
                className="group gap-3 px-8 shadow-2xl shadow-white/30"
              >
                <Play size={20} className="group-hover:scale-110 transition-transform" fill="currentColor" />
                <span>Pencet dong</span>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Audio Control - visible after entering */}
      <AnimatePresence>
        {!isOpen && audioUrl && (
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
