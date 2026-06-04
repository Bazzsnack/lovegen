import React from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-surface text-white overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-love-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-love-700/10 blur-[100px] rounded-full pointer-events-none" />
        
        {children}
      </main>
    </div>
  );
}
