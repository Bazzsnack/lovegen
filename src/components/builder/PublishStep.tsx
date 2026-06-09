'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { CheckCircle2, Globe, Loader2, AlertCircle, Download, ExternalLink, Copy, Check, Heart, Coffee } from 'lucide-react';
import { toPng } from 'html-to-image';
import QRCodeStyling from 'qr-code-styling';

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
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  // Generate QR code when published
  useEffect(() => {
    if (publishedUrl && qrRef.current) {
      qrRef.current.innerHTML = '';
      
      qrCodeInstance.current = new QRCodeStyling({
        width: 180,
        height: 180,
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
        }
      });
      
      qrCodeInstance.current.append(qrRef.current);
    }
  }, [publishedUrl]);

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
      // Step 1: Upload images if any via ImgBB (Client-side)
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
      
      // Step 2: Construct Stateless Payload & Base64 Encode
      setPublishStatus('Membuat link rahasia...');
      
      const payload = {
        t: data.title || '',
        s: data.subtitle || '',
        i: imageUrls[0] || '', // we only use 1 image in the new flow
        a: data.audioUrl || '',
        th: data.theme || 'stars',
        p: data.particleDensity || 50
      };
      
      const jsonStr = JSON.stringify(payload);
      // Encode to base64, handling unicode characters properly
      const base64Str = btoa(encodeURIComponent(jsonStr));
      
      const fullUrl = `${window.location.origin}/v?d=${base64Str}`;
      setPublishedUrl(fullUrl);
      
    } catch (e: any) {
      setError(e?.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsPublishing(false);
      setPublishStatus('');
    }
  };

  // ═══════════════════════════════════════════
  // SUCCESS VIEW - Link & Traktiran
  // ═══════════════════════════════════════════
  if (publishedUrl) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-10 items-center">
        
        {/* Success Header */}
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-3xl font-display font-medium text-white mb-2">Kado Berhasil Dibuat! 🎉</h2>
          <p className="text-white/60">Link rahasia sudah siap dikirimkan ke orang spesialmu.</p>
        </div>

        {/* Share Section */}
        <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center">
          <div ref={qrRef} className="shrink-0 p-2 bg-[#1a1a1a] rounded-xl shadow-xl border border-white/10" />
          
          <div className="flex flex-col gap-4 w-full">
            <h3 className="font-medium text-white text-lg">Bagikan Link Ini:</h3>
            <div className="w-full flex items-center gap-2 p-3 rounded-xl bg-black/60 border border-white/10">
              <span className="flex-1 text-left text-white/80 font-medium truncate text-sm">{publishedUrl}</span>
              <button 
                onClick={handleCopyUrl}
                className="p-2 rounded-lg bg-love-500 hover:bg-love-600 text-white transition-colors shrink-0 flex items-center justify-center"
                title="Copy Link"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <a 
                href={publishedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                title="Buka Halaman"
              >
                <ExternalLink size={16} />
              </a>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              *Link ini gratis dan tidak akan pernah kadaluarsa. Data kado dienkripsi langsung di dalam link untuk menjamin privasi.
            </p>
          </div>
        </div>

        {/* Monetization / Support Section */}
        <div className="w-full bg-gradient-to-br from-love-500/10 to-orange-500/10 border border-love-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-love-500/20 blur-3xl rounded-full" />
          
          <div className="flex-1 flex flex-col gap-4 text-center md:text-left z-10">
            <h3 className="text-2xl font-display font-medium text-white flex items-center justify-center md:justify-start gap-2">
              Dukung Kreator <Heart className="text-love-400 fill-love-400" size={20} />
            </h3>
            <p className="text-white/80 leading-relaxed text-sm">
              Lovegen dibuat 100% gratis tanpa iklan yang mengganggu agar kamu bisa membahagiakan orang tersayang.
            </p>
            <p className="text-white/60 text-xs">
              Kalau kamu suka dengan hasilnya, traktiran secangkir kopi akan sangat membantu kami membayar biaya server agar web ini terus hidup! ☕
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-3 z-10">
            <div className="bg-white p-2 rounded-xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
              <img src="/qr.jpeg" alt="QR Trakteer" className="w-32 h-32 rounded-lg object-cover" />
            </div>
            <span className="text-xs font-medium text-white/50 bg-black/40 px-3 py-1 rounded-full flex items-center gap-1">
              <Coffee size={12} /> Scan QR Trakteer
            </span>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={() => {
            setPublishedUrl(null);
            setCopied(false);
          }}
        >
          Buat Kado Baru
        </Button>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PUBLISH VIEW - Generate Link
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
          className="w-full h-16 text-lg relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-love-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center gap-2">
            {isPublishing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {publishStatus}
              </>
            ) : (
              <>
                <Globe size={20} />
                Generate Link Sekarang
              </>
            )}
          </span>
        </Button>

        <p className="text-xs text-white/40">
          Dengan klik tombol di atas, kamu setuju bahwa foto akan diunggah ke server anonim (ImgBB) dan link kado tidak dapat dihapus.
        </p>
      </div>
    </div>
  );
}
