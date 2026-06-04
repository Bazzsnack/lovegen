import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { slugSchema } from '@/lib/validations/slug';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
  }

  // Validate format
  const validation = slugSchema.safeParse(slug);
  if (!validation.success) {
    return NextResponse.json({ 
      available: false, 
      error: validation.error.errors[0].message 
    }, { status: 400 });
  }

  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('slugs')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned, which is good (available)
      throw error;
    }

    // If data exists, the slug is taken
    const available = !data;

    return NextResponse.json({ available });
  } catch (error) {
    console.error('Slug check error:', error);
    return NextResponse.json({ error: 'Failed to check slug availability' }, { status: 500 });
  }
}
