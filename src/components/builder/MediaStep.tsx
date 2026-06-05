'use client';

import React, { useRef } from 'react';
import { FileUpload } from '../ui/FileUpload';
import { Music, Image as ImageIcon, Play, Pause, AlertCircle, X } from 'lucide-react';
import { CURATED_SONGS } from '@/lib/constants';

interface MediaStepProps {
  data: {
    images: File[];
    audioUrl: string;
  };
  onChange: (data: Partial<MediaStepProps['data']>) => void;
}

export function MediaStep({ data, onChange }: MediaStepProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = React.useState<string | null>(null);
  const [audioError, setAudioError] = React.useState<string | null>(null);

  const togglePlay = (url: string, id: string) => {
    setAudioError(null);
    
    // If already playing this song, pause it
    if (playingId === id && audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }

    // Pause any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Use the hidden <audio> element
    const audio = audioRef.current;
    if (audio) {
      audio.src = url;
      audio.load(); // Force reload the source
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlayingId(id);
          })
          .catch(() => {
            setPlayingId(null);
            setAudioError(`Gagal memutar lagu. Coba refresh halaman (F5).`);
          });
      }
    }
  };

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleEnded = () => setPlayingId(null);
    const handleError = () => {
      setPlayingId(null);
    };
    
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      {/* Hidden audio element for reliable playback */}
      <audio ref={audioRef} preload="none">
        <source type="audio/mpeg" />
      </audio>

      <div>
        <h2 className="text-2xl font-display font-medium text-white mb-2">Upload foto kamu</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-love-400">
            <ImageIcon size={20} />
            <h3 className="font-medium text-white">Foto</h3>
          </div>
          <FileUpload 
            label="Unggah maksimal 2 foto !"
            accept="image/*"
            multiple={true}
            maxFiles={2}
            onFileSelect={files => onChange({ images: [...data.images, ...files].slice(0, 2) })}
          />
          {data.images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {data.images.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group bg-black/40 border border-white/10">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      const newImages = [...data.images];
                      newImages.splice(i, 1);
                      onChange({ images: newImages });
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-love-400 mb-2">
            <Music size={20} />
            <h3 className="font-medium text-white">Musik Latar</h3>
          </div>
          
          {audioError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              <AlertCircle size={16} />
              <span>{audioError}</span>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            {CURATED_SONGS.map(song => (
              <div 
                key={song.id}
                className={`
                  flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer
                  ${data.audioUrl === song.url ? 'border-love-400 bg-love-500/10' : 'border-white/10 bg-black/20 hover:border-white/30'}
                `}
                onClick={() => onChange({ audioUrl: song.url })}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${data.audioUrl === song.url ? 'border-love-400' : 'border-white/30'}`}>
                    {data.audioUrl === song.url && <div className="w-2 h-2 rounded-full bg-love-400" />}
                  </div>
                  <span className="text-sm font-medium text-white">{song.name}</span>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay(song.url, song.id);
                  }}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                >
                  {playingId === song.id ? <Pause size={14} /> : <Play size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
