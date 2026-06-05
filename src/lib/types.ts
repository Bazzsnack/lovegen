export interface ProfileData {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: 'free' | 'pro' | 'premium';
  pages_count: number;
  created_at: string;
  updated_at: string;
}

export interface QRConfig {
  dotStyle: string;
  cornerStyle: string;
  fgColor: string;
  bgColor: string;
}

export interface PageConfig {
  id: string;
  user_id: string;
  title: string;
  subtitle: string | null;
  phrases: string[];
  theme: string;
  particle_speed: 'slow' | 'medium' | 'fast';
  particle_density: 'sparse' | 'normal' | 'dense';
  font_pairing: string;
  image_urls: string[];
  audio_url: string | null;
  audio_filename: string | null;
  qr_config: QRConfig;
  is_published: boolean;
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface SlugRecord {
  id: string;
  slug: string;
  page_id: string;
  user_id: string;
  is_active: boolean;
  created_at: string;
}

export interface ThemeConfig {
  background: string[];
  accent: string;
  particleGlow: string;
  decorationType: string;
  lightColor: string;
}

export interface ParticleState {
  id: string;
  type: 'image' | 'text' | 'decoration';
  content: string;
  position: [number, number, number];
  velocity: [number, number, number];
  rotation: [number, number, number];
  rotationSpeed: [number, number, number];
  scale: number;
  opacity: number;
  lifetime: number;
  maxY: number;
}
