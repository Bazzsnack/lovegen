'use client';

import React, { useState, useEffect, useRef } from 'react';

export function AuraLogo({ className = "w-8 h-8" }: { className?: string }) {
  const [showImage, setShowImage] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  // Only attempt to show the image after client mount to prevent hydration mismatch
  useEffect(() => {
    setShowImage(true);
  }, []);

  const fallback = (
    <span className="text-love-400 font-serif font-bold text-lg leading-none" style={{ textShadow: '0 0 5px rgba(255,255,255,0.8)' }}>
      LW
    </span>
  );

  return (
    <div className={`${className} flex items-center justify-center`} suppressHydrationWarning>
      {showImage && !imgFailed ? (
        <img 
          src="/logo.jpg" 
          alt="Lovegen Logo"
          className="w-full h-full object-contain"
          style={{
            filter: 'invert(1) sepia(1) saturate(5) hue-rotate(270deg) drop-shadow(0 0 4px rgba(255,255,255,0.8))',
            mixBlendMode: 'screen', 
          }}
          onError={() => setImgFailed(true)}
        />
      ) : fallback}
    </div>
  );
}

