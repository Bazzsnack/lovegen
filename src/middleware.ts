import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
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
    pathname === '/not-found' ||
    pathname === '/' ||
    RESERVED_SLUGS.includes(pathname.replace('/', ''))
  ) {
    return NextResponse.next();
  }

  const slug = pathname.replace('/', '');

  // Don't process slugs with dots (likely static files)
  if (slug.includes('.')) {
    return NextResponse.next();
  }

  try {
    // Initialize Supabase client for middleware
    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: any[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Check if slug exists in the database
    const { data: slugData } = await supabase
      .from('slugs')
      .select('page_id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (slugData && slugData.page_id) {
      // Rewrite to the internal view route with the page ID
      const url = request.nextUrl.clone();
      url.pathname = `/view/${slugData.page_id}`;
      return NextResponse.rewrite(url);
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // If middleware fails, just pass through
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

