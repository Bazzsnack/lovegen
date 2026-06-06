import React from 'react';
import Link from 'next/link';
import { AuraLogo } from '../ui/AuraLogo';
import { Button } from '../ui/Button';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo removed as requested */}
      </div>
    </nav>
  );
}
