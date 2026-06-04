'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { Button } from '../ui/Button';

interface AudioEntryOverlayProps {
  title: string;
  audioUrl?: string | null;
  onEnter: () => void;
}

export function AudioEntryOverlay({ title, audioUrl, onEnter }: AudioEntryOverlayProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl) {
      const a = new Audio(audioUrl);
      a.loop = true;
      setAudio(a);
    }
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audioUrl]);

  const handleEnter = () => {
    setIsOpen(false);
    if (audio) {
      audio.play().catch(e => console.error("Audio play blocked:", e));
    }
    onEnter();
  };

  return (
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
            <h1 className="text-4xl md:text-5xl font-display font-medium text-white mb-6 drop-shadow-lg">
              {title}
            </h1>
            <p className="text-white/80 mb-10 text-lg">
              Put on your headphones for the best experience.
            </p>
            
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleEnter}
              className="group gap-3 px-8 shadow-2xl shadow-love-500/20"
            >
              <Play size={20} className="group-hover:scale-110 transition-transform" fill="currentColor" />
              <span>Enter Experience</span>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
