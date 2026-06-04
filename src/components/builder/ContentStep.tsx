'use client';

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Plus, X } from 'lucide-react';

interface ContentStepProps {
  data: {
    title: string;
    subtitle: string;
    phrases: string[];
  };
  onChange: (data: Partial<ContentStepProps['data']>) => void;
}

export function ContentStep({ data, onChange }: ContentStepProps) {
  const [newPhrase, setNewPhrase] = useState('');

  const addPhrase = () => {
    if (newPhrase.trim() && data.phrases.length < 5) {
      onChange({ phrases: [...data.phrases, newPhrase.trim()] });
      setNewPhrase('');
    }
  };

  const removePhrase = (index: number) => {
    const updated = [...data.phrases];
    updated.splice(index, 1);
    onChange({ phrases: updated });
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-display font-medium text-white mb-2">The Content</h2>
        <p className="text-white/60">What do you want to say? These words will float in the 3D space.</p>
      </div>

      <div className="flex flex-col gap-6">
        <Input 
          label="Main Title" 
          placeholder="e.g. Happy Anniversary, My Love" 
          value={data.title}
          onChange={e => onChange({ title: e.target.value })}
        />
        <Input 
          label="Subtitle (Optional)" 
          placeholder="e.g. 5 beautiful years together" 
          value={data.subtitle}
          onChange={e => onChange({ subtitle: e.target.value })}
        />

        <div className="space-y-4">
          <label className="text-sm font-medium text-white/90">Love Phrases (Up to 5)</label>
          
          <div className="flex gap-2">
            <Input 
              placeholder="e.g. You are my everything" 
              value={newPhrase}
              onChange={e => setNewPhrase(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPhrase()}
              disabled={data.phrases.length >= 5}
            />
            <Button 
              variant="secondary" 
              onClick={addPhrase}
              disabled={!newPhrase.trim() || data.phrases.length >= 5}
            >
              <Plus size={18} />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {data.phrases.map((phrase, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2"
              >
                <span className="text-sm text-white">{phrase}</span>
                <button 
                  onClick={() => removePhrase(idx)}
                  className="text-white/50 hover:text-white transition-colors ml-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/40">{5 - data.phrases.length} phrases remaining</p>
        </div>
      </div>
    </div>
  );
}
