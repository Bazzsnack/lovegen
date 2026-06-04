import React from 'react';
import Link from 'next/link';
import { AuraLogo } from '../ui/AuraLogo';
import { Button } from '../ui/Button';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
            <AuraLogo className="w-6 h-6" />
            <span className="text-lg font-display font-semibold text-white tracking-wide">Aura</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/dashboard/create">
            <Button variant="glass" size="sm">Create Page</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
