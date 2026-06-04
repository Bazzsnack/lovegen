import { useState, useEffect } from 'react';

export function useSlugCheck() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      setIsAvailable(null);
      setIsValidating(false);
      setError(null);
    };
  }, []);

  const checkSlug = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setIsAvailable(null);
      setError(null);
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      
      if (!res.ok) {
        setIsAvailable(false);
        setError(data.error || 'Failed to check availability');
      } else {
        setIsAvailable(data.available);
        if (!data.available) {
          setError('This URL is already taken');
        }
      }
    } catch (err) {
      setIsAvailable(null);
      setError('Network error');
    } finally {
      setIsValidating(false);
    }
  };

  return { checkSlug, isAvailable, isValidating, error };
}
