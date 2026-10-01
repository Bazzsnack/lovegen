import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  console.log('[Proxy] Fetching:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LovegenProxy/1.0)',
        'Accept': 'image/*,*/*',
      },
      redirect: 'follow',
    });

    console.log('[Proxy] Response status:', response.status, 'Content-Type:', response.headers.get('Content-Type'));

    if (!response.ok) {
      console.error('[Proxy] Fetch failed:', response.status, response.statusText);
      return new NextResponse(`Upstream error: ${response.status}`, { status: 502 });
    }

    const buffer = await response.arrayBuffer();
    console.log('[Proxy] Success, size:', buffer.byteLength, 'bytes');
    
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error) {
    console.error('[Proxy] Error:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}

// Handle preflight CORS requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
