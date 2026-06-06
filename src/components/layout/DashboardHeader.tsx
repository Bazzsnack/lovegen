import React from 'react';
import { User } from 'lucide-react';
import Link from 'next/link';
import { AuraLogo } from '../ui/AuraLogo';

export function DashboardHeader({ title = "Dashboard" }: { title?: string }) {
  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Logo removed as requested */}
      </div>
      
    </header>
  );
}
