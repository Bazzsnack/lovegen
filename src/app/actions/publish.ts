'use server';

import { createClient } from '@supabase/supabase-js';

export async function publishPage(formData: any, slug: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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
      console.error("Page insert error:", pageError);
      return { success: false, error: pageError.message };
    }

    // 2. Insert into slugs table
    const { error: slugError } = await supabase
      .from('slugs')
      .insert({
        slug: slug,
        page_id: pageData.id,
      });

    if (slugError) {
      console.error("Slug insert error:", slugError);
      return { success: false, error: slugError.message };
    }

    return { success: true, url: `/${slug}` };
  } catch (error: any) {
    console.error("Publish error:", error);
    return { success: false, error: error.message || "Gagal mempublish" };
  }
}

