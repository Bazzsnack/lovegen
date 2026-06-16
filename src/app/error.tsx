'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white/10 border border-red-500/30 rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-xl font-display text-white mb-4">Ups, ada yang salah! ??</h2>
        <p className="text-white/60 text-sm mb-6">
          Sepertinya browser HP kamu mengalami kendala (Mungkin dibuka lewat link Instagram/TikTok/WhatsApp?). Coba buka langsung lewat Google Chrome!
        </p>
        
        <div className="bg-black/50 border border-white/10 rounded-lg p-4 mb-6 text-left overflow-auto max-h-40">
          <p className="text-red-400 font-mono text-xs break-words">
            {error.name}: {error.message}
          </p>
        </div>

        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-love-500 hover:bg-love-600 text-white rounded-full font-medium transition-colors">
          Coba Muat Ulang
        </button>
      </div>
    </div>
  );
}
