import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();
    const { formData, slug } = body;

    if (!slug || !formData) {
      return NextResponse.json(
        { success: false, error: 'Missing slug or form data' },
        { status: 400 }
      );
    }

    // 1. Insert into pages table
    const { data: pageData, error: pageError } = await supabase
      .from('pages')
      .insert({
        title: formData.title || 'Untitled',
        subtitle: formData.subtitle || null,
        phrases: formData.subtitle ? [formData.subtitle] : [],
        theme: formData.theme || 'rose-petal',
        particle_speed: formData.particleSpeed || 'medium',
        particle_density: formData.particleDensity || 'normal',
        font_pairing: formData.fontPairing || 'playfair-inter',
        audio_url: formData.audioUrl || null,
        image_urls: formData.imageUrls || [],
        qr_config: {},
        is_published: true,
        published_at: new Date().toISOString()
      })
      .select()
      .single();

    if (pageError) {
      console.error('Page insert error:', pageError);
      return NextResponse.json(
        { success: false, error: pageError.message },
        { status: 400 }
      );
    }

    // 2. Insert into slugs table
    const { error: slugError } = await supabase
      .from('slugs')
      .insert({
        slug: slug,
        page_id: pageData.id,
      });

    if (slugError) {
      console.error('Slug insert error:', slugError);
      return NextResponse.json(
        { success: false, error: slugError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, url: `/${slug}` });
  } catch (error: any) {
    console.error('Publish API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
