import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader title="My Sites" />
      <div className="p-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-medium text-white mb-1">Welcome back</h2>
            <p className="text-white/60">Manage your romantic micro-sites or create a new one.</p>
          </div>
          <Link href="/dashboard/create">
            <Button variant="primary" className="gap-2">
              <Plus size={18} />
              Create New Site
            </Button>
          </Link>
        </div>

        {/* Empty State */}
        <GlassPanel className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/20">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-love-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No sites yet</h3>
          <p className="text-white/60 mb-6 max-w-md">
            You haven't created any micro-sites yet. Start your journey by creating a beautiful 3D experience for someone special.
          </p>
          <Link href="/dashboard/create">
            <Button variant="outline">Create your first site</Button>
          </Link>
        </GlassPanel>
      </div>
    </>
  );
}
