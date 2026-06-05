'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function publishPage(formData: any, slug: string) {
  try {
    const cookieStore = await cookies();
    
    // We use the Service Role key here to bypass RLS temporarily 
    // since we haven't built the Login/Auth system yet!
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    );

    // 1. Insert into pages table
    const { data: pageData, error: pageError } = await supabase
      .from('pages')
      .insert({
        // user_id is null for now (anonymous)
        title: formData.title,
        subtitle: formData.subtitle,
        phrases: formData.subtitle ? [formData.subtitle] : [],
        theme: formData.theme,
        particle_speed: formData.particleSpeed,
        particle_density: formData.particleDensity,
        font_pairing: formData.fontPairing,
        audio_url: formData.audioUrl,
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
    return { success: false, error: error.message || "Failed to publish" };
  }
}
