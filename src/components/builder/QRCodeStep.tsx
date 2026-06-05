'use client';

import React from 'react';
import { Select } from '../ui/Select';
import { QRCodePreview } from '../qr/QRCodePreview';
import { Input } from '../ui/Input';

interface QRCodeStepProps {
  data: {
    qrConfig: {
      dotStyle: string;
      cornerStyle: string;
      fgColor: string;
      bgColor: string;
    }
  };
  onChange: (data: any) => void;
  mockUrl?: string;
}

export function QRCodeStep({ data, onChange, mockUrl = "https://lovegen.app/demo" }: QRCodeStepProps) {
  const { qrConfig } = data;

  const updateConfig = (key: string, value: string) => {
    onChange({
      qrConfig: {
        ...qrConfig,
        [key]: value
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-display font-medium text-white mb-2">QR Code Customization</h2>
        <p className="text-white/60">Design a custom QR code that links directly to your love page.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-center justify-center p-8 bg-black/20 border border-white/10 rounded-2xl">
          <div className="mb-6">
            <QRCodePreview 
              data={mockUrl}
              dotStyle={qrConfig.dotStyle}
              cornerStyle={qrConfig.cornerStyle}
              fgColor={qrConfig.fgColor}
              bgColor={qrConfig.bgColor}
              size={256}
            />
          </div>
          <p className="text-sm text-white/50 text-center">Preview will update automatically</p>
        </div>

        <div className="flex flex-col gap-6">
          <Select 
            label="Dot Style"
            value={qrConfig.dotStyle}
            onChange={(e) => updateConfig('dotStyle', e.target.value)}
          >
            <option value="rounded">Rounded</option>
            <option value="dots">Dots</option>
            <option value="square">Square</option>
            <option value="classy">Classy</option>
          </Select>

          <Select 
            label="Corner Square Style"
            value={qrConfig.cornerStyle}
            onChange={(e) => updateConfig('cornerStyle', e.target.value)}
          >
            <option value="extra-rounded">Extra Rounded</option>
            <option value="dot">Dot</option>
            <option value="square">Square</option>
          </Select>

          <div>
            <label className="text-sm font-medium text-white/90 mb-2 block">Foreground Color</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={qrConfig.fgColor} 
                onChange={(e) => updateConfig('fgColor', e.target.value)}
                className="h-10 w-20 cursor-pointer rounded bg-transparent" 
              />
              <div className="flex-1 px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white flex items-center">
                {qrConfig.fgColor}
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-white/90 mb-2 block">Background Color</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={qrConfig.bgColor} 
                onChange={(e) => updateConfig('bgColor', e.target.value)}
                className="h-10 w-20 cursor-pointer rounded bg-transparent" 
              />
              <div className="flex-1 px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white flex items-center">
                {qrConfig.bgColor}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
