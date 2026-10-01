'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SceneCanvas } from '@/components/canvas/SceneCanvas';
import { AudioEntryOverlay } from '@/components/canvas/AudioEntryOverlay';
import { decompressFromEncodedURIComponent } from 'lz-string';

function StatelessViewer() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('d');
  
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (!dataParam) {
      setError("Data kado tidak ditemukan di URL.");
      return;
    }

    try {
      // Decompress LZ-string encoded payload
      const decodedStr = decompressFromEncodedURIComponent(dataParam);
      if (!decodedStr) throw new Error('Decompression failed');
      const parsed = JSON.parse(decodedStr);
      
      // Reconstruct payload to match PageConfig schema (snake_case fields)
      setData({
        id: 'stateless',
        user_id: '',
        title: parsed.t || '',
        subtitle: parsed.s || '',
        phrases: [],
        theme: parsed.th || 'rose-petal',
        particle_speed: 'medium',
        particle_density: 'normal',
        font_pairing: 'default',
        image_urls: parsed.i ? [parsed.i] : [],
        audio_url: parsed.a || null,
        audio_filename: null,
        qr_config: { dotStyle: 'rounded', cornerStyle: 'extra-rounded', fgColor: '#ff1e46', bgColor: '#1a1a1a' },
        is_published: true,
        published_at: null,
        view_count: 0,
        created_at: '',
        updated_at: '',
      });
    } catch (e) {
      console.error("Base64 decode error", e);
      setError("Link kado tidak valid atau rusak.");
    }
  }, [dataParam]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-white/10 border border-white/20 rounded-2xl p-8 max-w-sm text-center">
          <h1 className="text-xl font-display text-white mb-2">Oops!</h1>
          <p className="text-white/60 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-love-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* AudioEntryOverlay must stay mounted to keep audio alive and show play/pause control */}
      <AudioEntryOverlay 
        title={data.title}
        audioUrl={data.audio_url} 
        onEnter={() => setHasEntered(true)} 
      />
      
      {/* SceneCanvas always renders behind the overlay */}
      <SceneCanvas 
        pageData={data} 
      />

      {/* Floating photo overlay - uses native HTML img for guaranteed compatibility */}
      {hasEntered && data.image_urls && data.image_urls.length > 0 && data.image_urls[0] && (
        <div className="fixed inset-0 z-20 pointer-events-none flex items-center justify-center">
          <div className="relative w-44 h-44 md:w-56 md:h-56 animate-float">
            <div className="absolute -inset-3 bg-white/10 rounded-2xl blur-xl" />
            <img 
              src={data.image_urls[0]} 
              alt="Your special photo"
              className="relative w-full h-full object-cover rounded-2xl border-2 border-white/30 shadow-2xl shadow-love-500/30"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error("Photo failed to load:", data.image_urls[0]);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function StatelessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <StatelessViewer />
    </Suspense>
  );
}
