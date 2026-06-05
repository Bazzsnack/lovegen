import React from 'react';
import Link from 'next/link';
import { AuraLogo } from '../ui/AuraLogo';
import { Button } from '../ui/Button';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <div className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
            <AuraLogo className="w-10 h-10" />
            <span className="text-[10px] font-sans font-medium text-white/70 tracking-widest uppercase">lovegen</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
