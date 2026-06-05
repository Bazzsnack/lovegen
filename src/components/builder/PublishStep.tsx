'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { CheckCircle2, Globe, Loader2, AlertCircle, Download, ExternalLink, Copy, Check } from 'lucide-react';
import { publishPage } from '@/app/actions/publish';
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
        width: 300,
        height: 300,
        data: publishedUrl,
        margin: 10,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte' as any,
          errorCorrectionLevel: 'H'
        },
        dotsOptions: {
          color: '#e84393',
          type: 'rounded' as any
        },
        backgroundOptions: {
          color: '#ffffff',
        },
        cornersSquareOptions: {
          color: '#e84393',
          type: 'extra-rounded' as any
        },
        cornersDotOptions: {
          color: '#d63384',
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

  const handleDownloadQR = () => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.download({
        name: `qr-${slug}`,
        extension: 'png'
      });
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
      
      // Step 2: Publish page
      setPublishStatus('Mempublish halamanmu...');
      const result = await publishPage({ ...data, imageUrls }, slug);
      
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

        {/* QR Code */}
        <div className="p-6 bg-white rounded-2xl shadow-2xl shadow-love-500/10">
          <div ref={qrRef} />
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
