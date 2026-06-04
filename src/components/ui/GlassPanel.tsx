import React from 'react';

export function GlassPanel({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl
      bg-white/5 backdrop-blur-xl
      border border-white/10
      shadow-xl shadow-black/20
      ${className}
    `}>
      {/* Subtle gradient shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}
