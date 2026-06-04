'use client';

import React, { useState } from 'react';
import { FileUpload } from '../ui/FileUpload';
import { Music, Image as ImageIcon } from 'lucide-react';

export function MediaStep() {
  const [images, setImages] = useState<File[]>([]);
  const [audio, setAudio] = useState<File | null>(null);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-display font-medium text-white mb-2">Media Upload</h2>
        <p className="text-white/60">Upload your favorite memories and a romantic soundtrack.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-love-400">
            <ImageIcon size={20} />
            <h3 className="font-medium text-white">Images</h3>
          </div>
          <FileUpload 
            label="Upload up to 10 images (JPEG, PNG, WebP)"
            accept="image/*"
            multiple={true}
            maxFiles={10}
            onFileSelect={files => setImages(prev => [...prev, ...files].slice(0, 10))}
          />
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {images.map((file, i) => (
                <div key={i} className="text-xs bg-white/10 rounded px-2 py-1 flex items-center">
                  <span className="truncate max-w-[120px]">{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-love-400">
            <Music size={20} />
            <h3 className="font-medium text-white">Background Music</h3>
          </div>
          <FileUpload 
            label="Upload 1 audio file (MP3, WAV)"
            accept="audio/*"
            multiple={false}
            onFileSelect={files => setAudio(files[0])}
          />
          {audio && (
            <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music className="text-love-400" size={20} />
                <span className="text-sm font-medium text-white">{audio.name}</span>
              </div>
              <button 
                onClick={() => setAudio(null)}
                className="text-xs text-love-400 hover:text-love-300"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
