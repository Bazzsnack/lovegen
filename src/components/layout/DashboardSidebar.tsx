import React from 'react';
import Link from 'next/link';
import { Home, Edit3, Image as ImageIcon, QrCode, Settings, HelpCircle } from 'lucide-react';
import { AuraLogo } from '../ui/AuraLogo';
import { Button } from '../ui/Button';

export function DashboardSidebar() {
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen border-r border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="p-6 flex items-center gap-3">
        <AuraLogo className="w-8 h-8" />
        <span className="text-xl font-display font-semibold text-white tracking-wide">Aura</span>
      </div>

      <div className="px-4 py-2">
        <Link href="/dashboard/create">
          <Button variant="primary" className="w-full gap-2">
            <Edit3 size={18} />
            <span>Create New Site</span>
          </Button>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
        <NavItem href="/dashboard" icon={<Home size={20} />} label="Dashboard" active />
        <NavItem href="/dashboard/sites" icon={<Edit3 size={20} />} label="My Sites" />
        <NavItem href="/dashboard/assets" icon={<ImageIcon size={20} />} label="Assets" />
        <NavItem href="/dashboard/qr" icon={<QrCode size={20} />} label="QR Codes" />
        <NavItem href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" />
      </nav>

      <div className="p-4 border-t border-white/10">
        <NavItem href="/help" icon={<HelpCircle size={20} />} label="Help Center" />
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href}>
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        ${active ? 'bg-love-500/10 text-love-400' : 'text-white/60 hover:bg-white/5 hover:text-white'}
      `}>
        {icon}
        <span className="font-medium text-sm">{label}</span>
      </div>
    </Link>
  );
}
