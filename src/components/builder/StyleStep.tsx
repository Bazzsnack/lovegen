'use client';

import React from 'react';

interface StyleStepProps {
  data: {
    theme: string;
    particleSpeed: string;
    particleDensity: string;
    fontPairing: string;
  };
  onChange: (data: Partial<StyleStepProps['data']>) => void;
}

const THEMES = [
  { id: 'rose-petal', name: 'Rose Petal', color: 'bg-red-500' },
  { id: 'ocean-breeze', name: 'Ocean Breeze', color: 'bg-blue-400' },
  { id: 'golden-hour', name: 'Golden Hour', color: 'bg-yellow-400' },
  { id: 'midnight-bloom', name: 'Midnight Bloom', color: 'bg-purple-500' },
  { id: 'starlight', name: 'Starlight', color: 'bg-white' },
];

export function StyleStep({ data, onChange }: StyleStepProps) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-display font-medium text-white mb-2">Pilih Tema Warna</h2>
        <p className="text-white/60">Pilih warna cahaya dan nuansa untuk canvas 3D Anda.</p>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => onChange({ theme: theme.id })}
                className={`
                  relative p-4 rounded-xl border flex flex-col items-center gap-3 transition-all
                  ${data.theme === theme.id ? 'border-love-400 bg-love-500/10 scale-105' : 'border-white/10 hover:border-white/30 bg-black/20'}
                `}
              >
                <div className={`w-10 h-10 rounded-full ${theme.color} shadow-lg ${theme.id === 'pure-white' ? 'border border-white/20' : ''}`} />
                <span className="text-sm font-medium text-white text-center">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
