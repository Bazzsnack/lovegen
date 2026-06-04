'use server';

import { createServerClient } from '@/lib/supabase/server';
import { pageSchema } from '@/lib/validations/page';

export async function updatePage(pageId: string, formData: unknown) {
  const validatedPage = pageSchema.parse(formData);
  
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Verify ownership
  const { data: existingPage } = await supabase
    .from('pages')
    .select('user_id')
    .eq('id', pageId)
    .single();

  if (!existingPage || existingPage.user_id !== user.id) {
    throw new Error('Unauthorized to edit this page');
  }

  const { error } = await supabase
    .from('pages')
    .update({
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
    })
    .eq('id', pageId);

  if (error) {
    console.error('Page update error:', error);
    throw new Error('Failed to update page.');
  }

  return { success: true };
}
