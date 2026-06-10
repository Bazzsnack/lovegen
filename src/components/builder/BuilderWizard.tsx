'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentStep } from './ContentStep';
import { MediaStep } from './MediaStep';
import { StyleStep } from './StyleStep';
import { PublishStep } from './PublishStep';
import { GlassPanel } from '../ui/GlassPanel';
import { Button } from '../ui/Button';

const STEPS = [
  { id: 'content', label: '1. Teks & Ucapan' },
  { id: 'media', label: '2. Foto & Lagu' },
  { id: 'style', label: '3. Tema Warna' },
  { id: 'publish', label: '4. Selesai' },
];

export function BuilderWizard() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    theme: 'rose-petal',
    particleSpeed: 'medium',
    particleDensity: 'normal',
    fontPairing: 'playfair-inter',
    images: [] as File[],
    audioUrl: '/daftar_music/old_love.mp3',
  });

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(i => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(i => i - 1);
    } else {
      router.push('/');
    }
  };

  const renderStep = () => {
    switch (currentStepIndex) {
      case 0:
        return <ContentStep data={formData} onChange={data => setFormData({ ...formData, ...data })} />;
      case 1:
        return <MediaStep data={formData} onChange={data => setFormData({ ...formData, ...data })} />;
      case 2:
        return <StyleStep data={formData} onChange={data => setFormData({ ...formData, ...data })} />;
      case 3:
        return <PublishStep data={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
        <div className="flex items-center gap-2">
          {STEPS.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setCurrentStepIndex(index)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border
                    ${isActive ? 'bg-white/10 backdrop-blur-md border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 
                      isCompleted ? 'bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10' : 
                      'border-transparent text-white/40 hover:text-white/70'}
                  `}
                >
                  {step.label}
                </button>
                {index < STEPS.length - 1 && (
                  <div className="w-8 h-px bg-white/10" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <GlassPanel className="flex-1 p-4 md:p-8 mb-8 min-h-[500px] w-full max-w-full overflow-hidden">
        {renderStep()}
      </GlassPanel>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between mt-auto">
        <Button 
          variant="outline" 
          onClick={handlePrev} 
        >
          Kembali
        </Button>
        {currentStepIndex < STEPS.length - 1 && (
          <Button 
            variant="primary" 
            onClick={handleNext}
          >
            Lanjut
          </Button>
        )}
      </div>
    </div>
  );
}
