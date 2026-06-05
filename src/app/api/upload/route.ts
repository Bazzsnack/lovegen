import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.find(b => b.name === 'user-media');
    if (!bucketExists) {
      await supabase.storage.createBucket('user-media', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `uploads/${fileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('user-media')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('user-media')
        .getPublicUrl(filePath);

      uploadedUrls.push(urlData.publicUrl);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
