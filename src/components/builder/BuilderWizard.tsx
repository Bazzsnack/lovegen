'use client';

import React, { useState } from 'react';
import { ContentStep } from './ContentStep';
import { MediaStep } from './MediaStep';
import { StyleStep } from './StyleStep';
import { QRCodeStep } from './QRCodeStep';
import { PublishStep } from './PublishStep';
import { GlassPanel } from '../ui/GlassPanel';
import { Button } from '../ui/Button';

const STEPS = [
  { id: 'content', label: '1. Content' },
  { id: 'media', label: '2. Media' },
  { id: 'style', label: '3. Style' },
  { id: 'qr', label: '4. QR Code' },
  { id: 'publish', label: '5. Publish' },
];

export function BuilderWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Minimal form state to pass between steps
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    phrases: [] as string[],
    theme: 'rose-petal',
    particleSpeed: 'medium',
    particleDensity: 'normal',
    fontPairing: 'playfair-inter',
  });

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(i => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(i => i - 1);
    }
  };

  const renderStep = () => {
    switch (currentStepIndex) {
      case 0:
        return <ContentStep data={formData} onChange={data => setFormData({ ...formData, ...data })} />;
      case 1:
        return <MediaStep />;
      case 2:
        return <StyleStep data={formData} onChange={data => setFormData({ ...formData, ...data })} />;
      case 3:
        return <QRCodeStep />;
      case 4:
        return <PublishStep />;
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
                    px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                    ${isActive ? 'bg-love-500 text-white shadow-lg shadow-love-500/25' : 
                      isCompleted ? 'bg-white/10 text-white hover:bg-white/20' : 
                      'text-white/40 hover:text-white/70'}
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
      <GlassPanel className="flex-1 p-8 mb-8 min-h-[500px]">
        {renderStep()}
      </GlassPanel>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between mt-auto">
        <Button 
          variant="outline" 
          onClick={handlePrev} 
          disabled={currentStepIndex === 0}
        >
          Previous Step
        </Button>
        <Button 
          variant="primary" 
          onClick={handleNext} 
          disabled={currentStepIndex === STEPS.length - 1}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
