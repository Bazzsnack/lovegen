import React from 'react';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { SceneCanvas } from '@/components/canvas/SceneCanvas';
import { AudioEntryOverlay } from '@/components/canvas/AudioEntryOverlay';
import { PageConfig } from '@/lib/types';

export const revalidate = 60; // Cache for 60 seconds

export default async function PublishedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const supabase = await createServerClient();

  const { data: pageData, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single();

  if (error || !pageData) {
    console.error('Failed to load page:', error);
    notFound();
  }

  const typedPageData = pageData as PageConfig;

  return (
    <main className="fixed inset-0 w-full h-full overflow-hidden bg-black touch-none">
      <AudioEntryOverlay 
        title={typedPageData.title} 
        audioUrl={typedPageData.audio_url}
      />
      
      <div className="absolute inset-0 z-0">
        <SceneCanvas pageData={typedPageData} />
      </div>

      {/* Optional: Add a subtle logo/watermark for free tier */}
      {/* 
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none opacity-50">
        <span className="text-white text-xs font-display">Created with Lovegen</span>
      </div> 
      */}
    </main>
  );
}
