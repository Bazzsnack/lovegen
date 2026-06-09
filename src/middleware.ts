import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RESERVED_SLUGS } from '@/lib/constants';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip system routes, static files, API, and auth routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/font') ||
    pathname.startsWith('/v') ||
    pathname === '/not-found' ||
    pathname === '/' ||
    RESERVED_SLUGS.includes(pathname.replace('/', ''))
  ) {
    return NextResponse.next();
  }

  const slug = pathname.replace('/', '');

  // Don't process slugs with dots (likely static files)
  if (slug.includes('.') || !slug) {
    return NextResponse.next();
  }

  try {
    // Use plain fetch instead of Supabase client (Edge Runtime compatible)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const res = await fetch(
      `${supabaseUrl}/rest/v1/slugs?slug=eq.${slug}&is_active=eq.true&select=page_id&limit=1`,
      {
        headers: {
          'apikey': supabaseKey || '',
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0 && data[0].page_id) {
        const url = request.nextUrl.clone();
        url.pathname = `/view/${data[0].page_id}`;
        return NextResponse.rewrite(url);
      }
    }
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }

  // If slug not found, show 404
  const url = request.nextUrl.clone();
  url.pathname = '/not-found';
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|font|daftar_music|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|wav|ogg|mp4|webm|ico|otf|ttf|woff|woff2)$).*)',
  ],
};

