'use client';

import React from 'react';
import { Select } from '../ui/Select';

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
  { id: 'rose-petal', name: 'Rose Petal', color: 'bg-pink-500' },
  { id: 'starlight', name: 'Starlight', color: 'bg-blue-400' },
  { id: 'ocean-breeze', name: 'Ocean Breeze', color: 'bg-teal-400' },
  { id: 'golden-hour', name: 'Golden Hour', color: 'bg-yellow-500' },
  { id: 'midnight-bloom', name: 'Midnight Bloom', color: 'bg-purple-500' },
  { id: 'aurora', name: 'Aurora', color: 'bg-green-400' },
];

export function StyleStep({ data, onChange }: StyleStepProps) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-display font-medium text-white mb-2">Visual Style</h2>
        <p className="text-white/60">Customize the look and feel of your 3D canvas.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="flex flex-col gap-6">
          <div>
            <label className="text-sm font-medium text-white/90 mb-3 block">Color Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => onChange({ theme: theme.id })}
                  className={`
                    relative p-3 rounded-xl border flex flex-col items-center gap-2 transition-all
                    ${data.theme === theme.id ? 'border-love-400 bg-love-500/10' : 'border-white/10 hover:border-white/30 bg-black/20'}
                  `}
                >
                  <div className={`w-8 h-8 rounded-full ${theme.color} shadow-lg`} />
                  <span className="text-xs font-medium text-white text-center">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Select 
            label="Particle Speed"
            value={data.particleSpeed}
            onChange={e => onChange({ particleSpeed: e.target.value })}
          >
            <option value="slow">Slow & Gentle</option>
            <option value="medium">Medium</option>
            <option value="fast">Fast & Dynamic</option>
          </Select>

          <Select 
            label="Particle Density"
            value={data.particleDensity}
            onChange={e => onChange({ particleDensity: e.target.value })}
          >
            <option value="sparse">Sparse (Minimalist)</option>
            <option value="normal">Normal</option>
            <option value="dense">Dense (Immersive)</option>
          </Select>
          
          <Select 
            label="Font Pairing"
            value={data.fontPairing}
            onChange={e => onChange({ fontPairing: e.target.value })}
          >
            <option value="playfair-inter">Playfair Display & Inter</option>
            <option value="dancing-inter">Dancing Script & Inter</option>
          </Select>
        </div>
      </div>
    </div>
  );
}
