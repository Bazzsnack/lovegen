'use server';

import { createServerClient } from '@/lib/supabase/server';

export async function deletePage(pageId: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  // RLS will ensure the user can only delete their own page
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', pageId);

  if (error) {
    console.error('Page delete error:', error);
    throw new Error('Failed to delete page.');
  }

  return { success: true };
}
