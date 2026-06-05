import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Sparkles } from 'lucide-react';
import { SceneCanvas } from '@/components/canvas/SceneCanvas';
import { PageConfig } from '@/lib/types';

// Data dummy agar air terjun 3D-nya langsung jalan di halaman awal!
const demoPageData = {
  id: 'demo',
  user_id: 'demo',
  title: 'I Love You',
  subtitle: 'I Love You',
  phrases: [],
  theme: 'rose-petal',
  image_urls: [
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=500',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=500',
    'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&q=80&w=500'
  ],
} as unknown as PageConfig;

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        <div className="absolute inset-0 transform scale-110 blur-md opacity-60 pointer-events-none">
          <SceneCanvas pageData={demoPageData} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80 z-10 pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-20">
          <h1 className="text-4xl md:text-6xl font-serif italic font-light text-white max-w-4xl tracking-wide mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Bikin ayang salting brutal pake <span className="text-transparent bg-clip-text bg-gradient-to-r from-love-300 to-purple-300">web buatan sendiri!</span>
          </h1>
          
          <p className="text-xs md:text-sm text-white/50 tracking-widest uppercase mb-12 animate-fade-in font-sans" style={{ animationDelay: '200ms' }}>
            made with abbas
          </p>

          <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Link href="/dashboard">
              <button className="px-10 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-lg text-white font-medium tracking-widest text-sm hover:bg-white/10 hover:border-white/30 transition-all shadow-[0_0_30px_rgba(255,255,255,0.03)] uppercase">
                GAS BIKIN
              </button>
            </Link>
          </div>
        </div>
        
        {/* Decorative Floor */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </main>
  );
}
