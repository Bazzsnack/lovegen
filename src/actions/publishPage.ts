'use server';

import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { pageSchema } from '@/lib/validations/page';
import { slugSchema } from '@/lib/validations/slug';

export async function publishPage(formData: unknown, slug: string) {
  // 1. Validate page data
  const validatedPage = pageSchema.parse(formData);
  
  // 2. Validate slug
  const validatedSlug = slugSchema.parse(slug);

  // 3. Authenticate
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized. Please log in to publish a page.');
  }

  // 4. Verify slug is truly available
  const { data: existingSlug } = await supabase
    .from('slugs')
    .select('id')
    .eq('slug', validatedSlug)
    .eq('is_active', true)
    .single();

  if (existingSlug) {
    throw new Error('This custom URL is already taken.');
  }

  // 5. Insert Page Record
  const { data: pageData, error: pageError } = await supabase
    .from('pages')
    .insert({
      user_id: user.id,
      title: validatedPage.title,
      subtitle: validatedPage.subtitle,
      phrases: validatedPage.phrases,
      theme: validatedPage.theme,
      particle_speed: validatedPage.particleSpeed,
      particle_density: validatedPage.particleDensity,
      font_pairing: validatedPage.fontPairing,
      image_urls: validatedPage.imageUrls,
      audio_url: validatedPage.audioUrl,
      audio_filename: validatedPage.audioFilename,
      qr_config: validatedPage.qrConfig,
      is_published: true,
      published_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (pageError || !pageData) {
    console.error('Page insert error:', pageError);
    throw new Error('Failed to create page record.');
  }

  // 6. Insert Slug Record linked to Page
  const { error: slugError } = await supabase
    .from('slugs')
    .insert({
      slug: validatedSlug,
      page_id: pageData.id,
      user_id: user.id,
      is_active: true
    });

  if (slugError) {
    console.error('Slug insert error:', slugError);
    // Attempt rollback of page
    await supabase.from('pages').delete().eq('id', pageData.id);
    throw new Error('Failed to register custom URL. Please try again.');
  }

  return { success: true, pageId: pageData.id, slug: validatedSlug };
}
