import React from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { BuilderWizard } from '@/components/builder/BuilderWizard';

export default function CreatePage() {
  return (
    <>
      <DashboardHeader title="Buat Web Baru" />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <BuilderWizard />
        </div>
      </div>
    </>
  );
}
