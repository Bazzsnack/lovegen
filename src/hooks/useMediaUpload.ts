import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useMediaUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File, folder: 'images' | 'audio'): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    
    try {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${user.id}/${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('user-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setProgress(100);
    }
  };

  return { uploadFile, isUploading, progress };
}
