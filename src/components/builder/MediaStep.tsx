'use client';

import React, { useRef, useState, useEffect } from 'react';
import { FileUpload } from '../ui/FileUpload';
import { Music, Image as ImageIcon, Play, Pause, AlertCircle, X, Search, Loader2 } from 'lucide-react';
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
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [songsList, setSongsList] = useState<any[]>(CURATED_SONGS);
  const [isSearching, setIsSearching] = useState(false);

  const togglePlay = (url: string, id: string) => {
    setAudioError(null);
    
    if (playingId === id && audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = audioRef.current;
    if (audio) {
      audio.src = url;
      audio.load();
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setPlayingId(id))
          .catch(() => {
            setPlayingId(null);
            setAudioError(`Gagal memutar preview lagu ini.`);
          });
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleEnded = () => setPlayingId(null);
    const handleError = () => setPlayingId(null);
    
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    const searchItunes = async () => {
      if (!searchQuery.trim()) {
        setSongsList(CURATED_SONGS);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=song&limit=5`);
        const result = await res.json();
        const mapped = result.results
          .filter((r: any) => r.previewUrl)
          .map((r: any) => ({
            id: r.trackId.toString(),
            name: `${r.trackName} - ${r.artistName}`,
            url: r.previewUrl,
            thumb: r.artworkUrl60
          }));
        setSongsList(mapped);
      } catch (e) {
        console.error("iTunes search error:", e);
      } finally {
        setIsSearching(false);
      }
    };

    const delay = setTimeout(() => {
      searchItunes();
    }, 500);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <audio ref={audioRef} preload="none">
        <source type="audio/mpeg" />
      </audio>

      <div>
        <h2 className="text-2xl font-display font-medium text-white mb-2">Pilih Foto & Lagu</h2>
        <p className="text-white/60">Buat momen jadi lebih spesial :3</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* FOTO SECTION */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-love-400">
            <ImageIcon size={20} />
            <h3 className="font-medium text-white">Foto (Wajib Maks 1)</h3>
          </div>
          <FileUpload 
            label="Unggah 1 foto terbaik kalian!"
            accept="image/*"
            multiple={false}
            maxFiles={1}
            onFileSelect={files => onChange({ images: [files[0]] })}
          />
          {data.images.length > 0 && (
            <div className="grid grid-cols-1 gap-3 mt-4">
              {data.images.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group bg-black/40 border border-white/10 max-w-[200px] mx-auto">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      onChange({ images: [] });
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

        {/* MUSIK SECTION */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-love-400 mb-2">
            <div className="flex items-center gap-2">
              <Music size={20} />
              <h3 className="font-medium text-white">Cari Lagu Latar</h3>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-white/40" />
            </div>
            <input
              type="text"
              placeholder="Cari lagu di iTunes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-love-400 focus:ring-1 focus:ring-love-400 transition-all"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Loader2 size={16} className="text-love-400 animate-spin" />
              </div>
            )}
          </div>
          
          {audioError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              <AlertCircle size={16} />
              <span>{audioError}</span>
            </div>
          )}
          
          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {songsList.length === 0 && !isSearching && (
              <p className="text-white/40 text-sm text-center py-4">Lagu tidak ditemukan.</p>
            )}
            
            {songsList.map(song => (
              <div 
                key={song.id}
                className={`
                  flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer
                  ${data.audioUrl === song.url ? 'border-love-400 bg-love-500/10' : 'border-white/10 bg-black/20 hover:border-white/30'}
                `}
                onClick={() => {
                  onChange({ audioUrl: song.url });
                  togglePlay(song.url, song.id);
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                  <div className={`shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${data.audioUrl === song.url ? 'border-love-400' : 'border-white/30'}`}>
                    {data.audioUrl === song.url && <div className="w-2 h-2 rounded-full bg-love-400" />}
                  </div>
                  {song.thumb && (
                    <div className="relative shrink-0 w-8 h-8 rounded-md overflow-hidden">
                      <img src={song.thumb} alt="cover" className="w-full h-full object-cover" />
                      {playingId === song.id && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                          <div className="w-3 h-3 flex items-center justify-between">
                            <div className="w-[3px] h-full bg-love-400 animate-[bounce_1s_infinite]" />
                            <div className="w-[3px] h-full bg-love-400 animate-[bounce_1s_infinite_0.2s]" />
                            <div className="w-[3px] h-full bg-love-400 animate-[bounce_1s_infinite_0.4s]" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium text-white truncate w-full block">
                      {song.name.split(' - ')[0]}
                    </span>
                    <span className="text-xs text-white/50 truncate w-full block">
                      {song.name.split(' - ')[1] || 'Unknown Artist'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
