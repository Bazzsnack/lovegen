'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { CheckCircle2, Globe, Loader2, AlertCircle, ExternalLink, Copy, Check, Heart, Coffee, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import QRCodeStyling from 'qr-code-styling';
import { compressToEncodedURIComponent } from 'lz-string';

interface PublishStepProps {
  data?: any;
}

export function PublishStep({ data }: PublishStepProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Success state
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrWrapperRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  // Generate QR code when published
  useEffect(() => {
    if (publishedUrl && qrRef.current) {
      qrRef.current.innerHTML = '';
      
      qrCodeInstance.current = new QRCodeStyling({
        width: 280,
        height: 280,
        data: publishedUrl,
        margin: 8,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte' as any,
          errorCorrectionLevel: 'L'
        },
        dotsOptions: {
          color: '#ff1e46',
          type: 'rounded' as any
        },
        backgroundOptions: {
          color: '#1a1a1a',
        },
        cornersSquareOptions: {
          color: '#ff1e46',
          type: 'extra-rounded' as any
        },
        cornersDotOptions: {
          color: '#ff1e46',
          type: 'dot' as any
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 10
        }
      });
      
      qrCodeInstance.current.append(qrRef.current);
    }
  }, [publishedUrl]);

  const handleDownloadQR = async () => {
    if (!qrWrapperRef.current) return;
    try {
      const dataUrl = await toPng(qrWrapperRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `lovegen-qr.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      if (qrCodeInstance.current) {
        qrCodeInstance.current.download({ name: `lovegen-qr`, extension: 'png' });
      }
    }
  };

  const handleCopyUrl = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePublish = async () => {
    if (!data) return;
    setIsPublishing(true);
    setError(null);
    
    try {
      let imageUrls: string[] = [];
      const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      
      if (data.images && data.images.length > 0) {
        if (!imgbbKey) {
           throw new Error("ImgBB API Key belum diatur. Silakan tambahkan NEXT_PUBLIC_IMGBB_API_KEY di .env.local untuk mengunggah foto.");
        }
        setPublishStatus('Mengunggah foto...');
        
        for (const file of data.images) {
          const formData = new FormData();
          formData.append('image', file);
          
          const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
            method: 'POST',
            body: formData,
          });
          
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            imageUrls.push(uploadData.data.url);
          } else {
            throw new Error("Gagal mengunggah foto ke server. Coba lagi nanti.");
          }
        }
      }
      
      setPublishStatus('Membuat link rahasia...');
      
      const payload = {
        t: data.title || '',
        s: data.subtitle || '',
        i: imageUrls[0] || '', 
        a: data.audioUrl || '',
        th: data.theme || 'stars',
        p: data.particleDensity || 50
      };
      
      const jsonStr = JSON.stringify(payload);
      const compressed = compressToEncodedURIComponent(jsonStr);
      const fullUrl = `${window.location.origin}/v?d=${compressed}`;
      setPublishedUrl(fullUrl);
      
    } catch (e: any) {
      setError(e?.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsPublishing(false);
      setPublishStatus('');
    }
  };

  // ═══════════════════════════════════════════
  // SUCCESS VIEW
  // ═══════════════════════════════════════════
  if (publishedUrl) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-10 items-center">
        
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-3xl font-display font-medium text-white mb-2">Kado Berhasil Dibuat! 🎉</h2>
          <p className="text-white/60">Link rahasia sudah siap dikirimkan ke orang spesialmu.</p>
        </div>

        {/* Beautiful QR Wrapper with 3D Ribbons */}
        <div 
          ref={qrWrapperRef}
          className="relative bg-[#111111] w-[320px] h-[320px] rounded-[2rem] flex items-center justify-center overflow-hidden shadow-2xl border border-white/5"
        >
          {/* Top-Left 3D Bow with Diagonal Ribbon */}
          <div className="absolute -top-1 -left-1 w-24 h-24 overflow-hidden z-20 pointer-events-none rounded-tl-[1.8rem] flex items-center justify-center">
            {/* The diagonal ribbon stripe behind the bow */}
            <div className="absolute top-4 -left-8 w-40 h-8 bg-gradient-to-t from-[#ff9eb1] via-[#ff1e46] to-[#a0001d] -rotate-45 shadow-[0_4px_15px_rgba(0,0,0,0.6)] border-b border-[#ff9eb1]/50">
            </div>
            {/* The Bow on top, rotated to match the slant */}
            <div className="absolute top-0 left-0 w-full h-full -rotate-45 flex items-center justify-center">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 -mt-6 drop-shadow-2xl">
                <defs>
                  <radialGradient id="bowGloss" cx="40%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#ff9eb1"/>
                    <stop offset="40%" stopColor="#ff1e46"/>
                    <stop offset="100%" stopColor="#a0001d"/>
                  </radialGradient>
                  <linearGradient id="ribbonShade" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff1e46"/>
                    <stop offset="50%" stopColor="#d00024"/>
                    <stop offset="100%" stopColor="#700010"/>
                  </linearGradient>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000" floodOpacity="0.8"/>
                  </filter>
                </defs>

                <g filter="url(#shadow)">
                  <path d="M 100 110 L 30 185 C 50 195, 70 185, 90 150 C 95 135, 98 120, 100 110 Z" fill="url(#ribbonShade)"/>
                  <path d="M 100 110 L 170 185 C 150 195, 130 185, 110 150 C 105 135, 102 120, 100 110 Z" fill="url(#ribbonShade)"/>
                  <path d="M 100 100 C 0 20, -20 140, 80 120 C 90 115, 95 110, 100 100 Z" fill="url(#bowGloss)"/>
                  <path d="M 100 100 C 200 20, 220 140, 120 120 C 110 115, 105 110, 100 100 Z" fill="url(#bowGloss)"/>
                  <rect x="80" y="82" width="40" height="45" rx="15" fill="url(#bowGloss)"/>
                  <path d="M 85 90 Q 100 80 115 90" stroke="#ff9eb1" strokeWidth="4" strokeLinecap="round"/>
                </g>
              </svg>
            </div>
          </div>

          {/* Bottom-Right Ribbon Wrapping Effect */}
          <div className="absolute -bottom-1 -right-1 w-24 h-24 overflow-hidden z-20 pointer-events-none rounded-br-[1.8rem]">
            <div className="absolute top-10 -left-6 w-40 h-8 bg-gradient-to-b from-[#ff9eb1] via-[#ff1e46] to-[#a0001d] -rotate-45 shadow-[0_-4px_15px_rgba(0,0,0,0.6)] border-t border-[#ff9eb1]/50">
            </div>
          </div>

          <div className="relative z-0">
            <div ref={qrRef} />
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row gap-4 items-center justify-center max-w-md">
          <Button 
            variant="primary" 
            className="w-full flex items-center justify-center gap-2 shadow-lg shadow-love-500/30"
            onClick={handleDownloadQR}
          >
            <Download size={18} />
            Unduh QR Code
          </Button>
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 bg-white/5"
            onClick={handleCopyUrl}
          >
            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
            Salin Link
          </Button>
        </div>

        <div className="w-full max-w-lg p-4 rounded-xl bg-black/60 border border-white/10 flex items-center gap-3 mt-2">
          <span className="flex-1 text-left text-white/80 font-medium truncate text-sm">{publishedUrl}</span>
          <a 
            href={publishedUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
            title="Buka Halaman"
          >
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Trakteer Section - Elegant Layout */}
        <div className="w-full bg-gradient-to-br from-love-500/10 via-rose-500/5 to-orange-500/10 border border-love-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 mt-4">
          <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
            <h3 className="text-2xl font-display font-medium text-white flex items-center justify-center md:justify-start gap-2">
              Dukung Kreator <Heart className="text-love-400 fill-love-400 animate-pulse" size={24} />
            </h3>
            <p className="text-white/80 leading-relaxed text-sm">
              Lovegen dibuat gratis agar kamu bisa bebas berekspresi. Jika proyek ini membantumu, dukungan secangkir kopi akan sangat berarti untuk menjaga server tetap hidup.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
              <img src="/qr.jpeg" alt="QR Trakteer" className="w-28 h-28 rounded-lg object-cover" />
            </div>
            <span className="text-xs font-medium text-love-200 bg-love-500/20 px-4 py-1.5 rounded-full flex items-center gap-1.5 border border-love-500/30">
              <Coffee size={12} /> Scan Trakteer
            </span>
          </div>
        </div>

      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PUBLISH FORM VIEW
  // ═══════════════════════════════════════════
  return (
    <div className="max-w-xl mx-auto flex flex-col gap-8 text-center items-center">
      <div>
        <h2 className="text-2xl font-display font-medium text-white mb-2">Langkah Terakhir</h2>
        <p className="text-white/60">Generate link rahasiamu secara instan, gratis tanpa batas.</p>
      </div>

      <div className="w-full flex flex-col gap-6">
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-left">
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <Button 
          variant="primary" 
          size="lg" 
          onClick={handlePublish}
          disabled={isPublishing}
          className="w-full h-16 text-lg relative overflow-hidden group shadow-lg shadow-love-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-love-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center justify-center gap-2 w-full">
            {isPublishing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {publishStatus}
              </>
            ) : (
              <>
                <Globe size={20} />
                Generate Link Sekarang ✨
              </>
            )}
          </span>
        </Button>

        <p className="text-xs text-white/40 leading-relaxed px-4">
          Dengan klik tombol di atas, kamu setuju foto akan diproses secara anonim. Link kado akan dienkripsi tanpa menyentuh database demi menjaga privasi.
        </p>
      </div>
    </div>
  );
}
