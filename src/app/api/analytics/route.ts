import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageId, eventType, userAgent, referrer } = body;

    if (!pageId || !eventType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get basic IP from headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : realIp || 'unknown';

    // Use admin client because inserts to analytics are protected from the client side
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('analytics')
      .insert({
        page_id: pageId,
        event_type: eventType,
        user_agent: userAgent || request.headers.get('user-agent'),
        referrer: referrer || request.headers.get('referer'),
        visitor_ip: ip === 'unknown' ? null : ip,
      });

    if (error) {
      console.error('Analytics insert error:', error);
      throw error;
    }

    // Also trigger the view_count increment RPC if it's a view event
    if (eventType === 'view') {
      await supabase.rpc('increment_view_count', { target_page_id: pageId });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics endpoint error:', error);
    return NextResponse.json({ error: 'Failed to record analytics' }, { status: 500 });
  }
}
