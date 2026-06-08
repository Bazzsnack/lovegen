'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { CheckCircle2, Globe, Loader2, AlertCircle, Download, ExternalLink, Copy, Check } from 'lucide-react';
// import { publishPage } from '@/app/actions/publish';
import { toPng } from 'html-to-image';
import QRCodeStyling from 'qr-code-styling';

interface PublishStepProps {
  data?: any;
}

export function PublishStep({ data }: PublishStepProps) {
  const [slug, setSlug] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Success state
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrWrapperRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  const checkSlug = (val: string) => {
    setSlug(val);
    if (val.length > 2) {
      setIsAvailable(val !== 'admin' && val !== 'test');
    } else {
      setIsAvailable(null);
    }
    setError(null);
  };

  // Generate QR code when published
  useEffect(() => {
    if (publishedUrl && qrRef.current) {
      qrRef.current.innerHTML = '';
      
      qrCodeInstance.current = new QRCodeStyling({
        width: 200,
        height: 200,
        data: publishedUrl,
        margin: 0,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte' as any,
          errorCorrectionLevel: 'H'
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
      link.download = `lovegen-qr-${slug}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      // Fallback
      if (qrCodeInstance.current) {
        qrCodeInstance.current.download({ name: `qr-${slug}`, extension: 'png' });
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
      // Step 1: Upload images if any
      let imageUrls: string[] = [];
      if (data.images && data.images.length > 0) {
        setPublishStatus('Mengunggah foto...');
        const formData = new FormData();
        for (const file of data.images) {
          formData.append('files', file);
        }
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrls = uploadData.urls || [];
        }
      }
      
      // Step 2: Publish page via API route instead of Server Action
      setPublishStatus('Mempublish halamanmu...');
      const publishRes = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: { ...data, imageUrls },
          slug,
        }),
      });

      const result = await publishRes.json();
      
      if (result.success) {
        // Build full URL for QR code
        const fullUrl = `${window.location.origin}/${slug}`;
        setPublishedUrl(fullUrl);
      } else {
        setError(result.error || "Gagal mempublish halaman.");
      }
    } catch (e: any) {
      setError(e?.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsPublishing(false);
      setPublishStatus('');
    }
  };

  // ═══════════════════════════════════════════
  // SUCCESS VIEW - QR Code + Download
  // ═══════════════════════════════════════════
  if (publishedUrl) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-6 text-center items-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        
        <div>
          <h2 className="text-3xl font-display font-medium text-white mb-2">Berhasil Dipublish! 🎉</h2>
          <p className="text-white/60">Halaman romantismu sudah live. Bagikan ke orang spesialmu!</p>
        </div>

        {/* URL Display */}
        <div className="w-full flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-white/10">
          <span className="flex-1 text-left text-white font-medium truncate">{publishedUrl}</span>
          <button 
            onClick={handleCopyUrl}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
          <a 
            href={publishedUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
          >
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Styled QR Code Wrapper for Download */}
        <div 
          ref={qrWrapperRef}
          className="relative bg-[#111111] w-[320px] h-[320px] rounded-[2rem] flex items-center justify-center overflow-hidden inline-flex shadow-2xl"
        >
          {/* Top-Left 3D Bow Overlay */}
          <div className="absolute -top-6 -left-6 w-28 h-28 pointer-events-none z-20">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="bowGloss" cx="40%" cy="30%" r="70%">
                  <stop offset="0%" stop-color="#ff9eb1"/>
                  <stop offset="40%" stop-color="#ff1e46"/>
                  <stop offset="100%" stop-color="#a0001d"/>
                </radialGradient>
                <linearGradient id="ribbonShade" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#ff1e46"/>
                  <stop offset="50%" stop-color="#d00024"/>
                  <stop offset="100%" stop-color="#700010"/>
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="4" dy="8" stdDeviation="5" floodColor="#000" floodOpacity="0.8"/>
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

          {/* Bottom-Right Ribbon Wrapping Effect */}
          <div className="absolute -bottom-1 -right-1 w-24 h-24 overflow-hidden z-20 pointer-events-none">
            <div className="absolute top-10 -left-6 w-40 h-8 bg-gradient-to-b from-[#ff9eb1] via-[#ff1e46] to-[#a0001d] -rotate-45 shadow-[0_-4px_15px_rgba(0,0,0,0.6)] border-t border-[#ff9eb1]/50">
            </div>
          </div>

          {/* Centered QR Code */}
          <div className="relative z-0">
            <div ref={qrRef} />
          </div>
        </div>
        <p className="text-xs text-white/40">Scan QR code ini untuk langsung membuka halaman</p>

        {/* Download Button */}
        <Button 
          variant="primary" 
          size="lg" 
          className="w-full max-w-xs flex items-center justify-center gap-2"
          onClick={handleDownloadQR}
        >
          <Download size={18} />
          Unduh QR Code
        </Button>

        {/* Visit Page */}
        <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="w-full max-w-xs">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full flex items-center justify-center gap-2"
          >
            <ExternalLink size={18} />
            Lihat Halaman
          </Button>
        </a>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PUBLISH FORM VIEW
  // ═══════════════════════════════════════════
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 text-center items-center">
      <div className="w-16 h-16 rounded-full bg-love-500/20 flex items-center justify-center mb-2">
        <Globe className="w-8 h-8 text-love-400" />
      </div>
      
      <div>
        <h2 className="text-3xl font-display font-medium text-white mb-2">Siap Dipublish</h2>
        <p className="text-white/60 max-w-md mx-auto">
          Pilih alamat web unik untuk halamanmu. Link ini yang akan kamu bagikan.
        </p>
      </div>

      <div className="w-full mt-4 flex flex-col gap-4 text-left">
        <label className="text-sm font-medium text-white/90">Pilih URL Kamu</label>
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
            disabled={isPublishing}
          />
          {isAvailable === true && !isPublishing && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400">
              <CheckCircle2 size={20} />
            </div>
          )}
        </div>
        
        {isAvailable === true && !error && (
          <p className="text-sm text-green-400">URL ini tersedia!</p>
        )}
        {isAvailable === false && !error && (
          <p className="text-sm text-red-400">URL ini sudah dipakai.</p>
        )}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm mt-2 text-left">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <Button 
        variant="primary" 
        size="lg" 
        className="w-full mt-8 text-lg flex items-center justify-center gap-2"
        disabled={!isAvailable || isPublishing}
        onClick={handlePublish}
      >
        {isPublishing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {publishStatus || 'Mempublish...'}
          </>
        ) : (
          'Publish Halaman Sekarang ✨'
        )}
      </Button>
    </div>
  );
}
