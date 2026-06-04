'use client';

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { CheckCircle2, Globe } from 'lucide-react';

export function PublishStep() {
  const [slug, setSlug] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const checkSlug = (val: string) => {
    setSlug(val);
    // Mock availability check
    if (val.length > 2) {
      setIsAvailable(val !== 'admin' && val !== 'test');
    } else {
      setIsAvailable(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 text-center items-center">
      <div className="w-16 h-16 rounded-full bg-love-500/20 flex items-center justify-center mb-2">
        <Globe className="w-8 h-8 text-love-400" />
      </div>
      
      <div>
        <h2 className="text-3xl font-display font-medium text-white mb-2">Ready to Publish</h2>
        <p className="text-white/60 max-w-md mx-auto">
          Choose a custom web address for your page. This is the link you'll share with your special someone.
        </p>
      </div>

      <div className="w-full mt-4 flex flex-col gap-4 text-left">
        <label className="text-sm font-medium text-white/90">Claim your URL</label>
        <div className="flex relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 select-none">
            lovegen.app/
          </div>
          <input
            type="text"
            value={slug}
            onChange={(e) => checkSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="flex h-14 w-full rounded-xl border border-white/20 bg-black/40 pl-32 pr-12 py-2 text-lg text-white font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-love-400"
            placeholder="your-custom-name"
          />
          {isAvailable === true && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400">
              <CheckCircle2 size={20} />
            </div>
          )}
        </div>
        
        {isAvailable === true && (
          <p className="text-sm text-green-400">This URL is available!</p>
        )}
        {isAvailable === false && (
          <p className="text-sm text-red-400">This URL is already taken.</p>
        )}
      </div>

      <Button 
        variant="primary" 
        size="lg" 
        className="w-full mt-8 text-lg"
        disabled={!isAvailable}
      >
        Publish Page Now ✨
      </Button>
    </div>
  );
}
