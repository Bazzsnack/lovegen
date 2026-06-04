import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-center px-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-love-500/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/20 blur-[100px] rounded-full" />
      </div>
      
      <div className="relative z-10 glass-panel p-12 max-w-lg mx-auto">
        <h2 className="text-8xl font-display font-medium text-white mb-4">404</h2>
        <h3 className="text-2xl font-medium text-white mb-4">Page not found</h3>
        <p className="text-white/60 mb-8">
          The romantic journey you are looking for doesn't exist or has been removed.
        </p>
        <Link href="/">
          <Button variant="primary" className="px-8">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
