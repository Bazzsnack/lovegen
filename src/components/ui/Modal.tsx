import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { GlassPanel } from './GlassPanel';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps) {
  // Prevent scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`relative w-full max-w-4xl z-10 ${className}`}
          >
            <GlassPanel className="flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                {title && <h2 className="text-xl font-display font-medium text-white">{title}</h2>}
                <button 
                  onClick={onClose}
                  className="p-2 -mr-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                {children}
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
