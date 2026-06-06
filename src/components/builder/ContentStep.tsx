'use client';

import React from 'react';
import { Input } from '../ui/Input';

interface ContentStepProps {
  data: {
    title: string;
    subtitle: string;
    headphoneText?: string;
  };
  onChange: (data: Partial<ContentStepProps['data']>) => void;
}

export function ContentStep({ data, onChange }: ContentStepProps) {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-display font-medium text-white mb-2">Ayo Berkreasi</h2>
        <p className="text-white/60">Tulis pesanmu untuk dia :3</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/90">Headline</label>
          <p className="text-xs text-white/40 mb-1">Teks besar yang muncul pertama kali saat halaman dibuka.</p>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Contoh: Happy Birthday Sayang 💕"
            className="h-14 w-full rounded-xl border border-white/20 bg-black/40 px-4 py-2 text-lg text-white font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-love-400 placeholder:text-white/20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/90">Subtitle</label>
          <p className="text-xs text-white/40 mb-1">Satu kalimat pendek yang akan ikut berjatuhan bersama fotomu.</p>
          <input
            type="text"
            value={data.subtitle}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            placeholder="Contoh: Aku cinta kamu selamanya ❤️"
            className="h-14 w-full rounded-xl border border-white/20 bg-black/40 px-4 py-2 text-lg text-white font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-love-400 placeholder:text-white/20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/90">Pesan Awal (Opsional)</label>
          <p className="text-xs text-white/40 mb-1">Teks sebelum masuk. Default: "Put on your headphones for the best experience."</p>
          <input
            type="text"
            value={data.headphoneText}
            onChange={(e) => onChange({ headphoneText: e.target.value })}
            placeholder="Contoh: Pakai headset ya biar makin baper!"
            className="h-14 w-full rounded-xl border border-white/20 bg-black/40 px-4 py-2 text-lg text-white font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-love-400 placeholder:text-white/20"
          />
        </div>
      </div>

    </div>
  );
}
