import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-surface text-white overflow-hidden">
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        {/* Ambient background glow - lightweight for mobile */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-love-500/5 rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[250px] h-[250px] bg-love-700/5 rounded-full pointer-events-none" />
        
        {children}
      </main>
    </div>
  );
}
