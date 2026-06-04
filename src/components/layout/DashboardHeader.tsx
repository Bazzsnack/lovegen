import React from 'react';
import { Bell, User } from 'lucide-react';

export function DashboardHeader({ title = "Dashboard" }: { title?: string }) {
  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-40">
      <div>
        <h1 className="text-2xl font-display font-medium text-white">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-love-500"></span>
        </button>
        
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-love-400 to-love-600 flex items-center justify-center text-white cursor-pointer shadow-lg">
          <User size={20} />
        </div>
      </div>
    </header>
  );
}
