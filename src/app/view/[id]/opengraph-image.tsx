import { ImageResponse } from 'next/og';
import { createServerClient } from '@/lib/supabase/server';

export const alt = 'Preview of Lovegen Micro-site';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';
export const revalidate = 60; // cache for 60 seconds

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  
  const { data: pageData } = await supabase
    .from('pages')
    .select('title, subtitle')
    .eq('id', id)
    .single();

  const title = pageData?.title || 'A Special Message For You';
  const subtitle = pageData?.subtitle || 'Tap to open your 3D experience';
  
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a000a', // very dark pink/black
          backgroundImage: 'radial-gradient(circle at 50% 50%, #4a154b 0%, #0a000a 80%)',
          color: 'white',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <div 
          style={{ 
            fontSize: 80, 
            fontWeight: 'bold', 
            marginBottom: 20,
            textShadow: '0 0 20px rgba(255,102,178,0.8)',
            color: '#ffffff',
            display: 'flex'
          }}
        >
          {title}
        </div>
        <div 
          style={{ 
            fontSize: 40, 
            color: '#ffb3d9',
            fontStyle: 'italic',
            display: 'flex'
          }}
        >
          {subtitle}
        </div>
        
        {/* Footer / Watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 24,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            display: 'flex'
          }}
        >
          Created with Lovegen
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
