export const THEME_CONFIGS = {
  'rose-petal': {
    background: ['#000000', '#000000', '#000000'],
    accent: '#ff0000',
    particleGlow: 'rgba(255,102,178, 1)',
    decorationType: 'hearts',
    lightColor: '#ffffff',
  },
  'ocean-breeze': {
    background: ['#000000', '#000000', '#000000'],
    accent: '#00ccff',
    particleGlow: 'rgba(0,255,255, 1)',
    decorationType: 'hearts',
    lightColor: '#ffffff',
  },
  'golden-hour': {
    background: ['#000000', '#000000', '#000000'],
    accent: '#ffdd00',
    particleGlow: 'rgba(255,215,0, 1)',
    decorationType: 'hearts',
    lightColor: '#ffffff',
  },
  'midnight-bloom': {
    background: ['#000000', '#000000', '#000000'],
    accent: '#9b59b6',
    particleGlow: 'rgba(255,0,255, 1)',
    decorationType: 'hearts',
    lightColor: '#ffffff',
  },
  'starlight': {
    background: ['#000000', '#000000', '#000000'],
    accent: '#ffffff',
    particleGlow: 'rgba(255,255,255, 1)',
    decorationType: 'hearts',
    lightColor: '#ffffff',
  },
} as const;

export const RESERVED_SLUGS = [
  'dashboard', 'auth', 'api', 'admin', 'settings', 'create', 'edit', 'view', 
  'not-found', 'login', 'signup', 'pricing', 'about', 'help', 'support', 
  'terms', 'privacy'
];

export const CURATED_SONGS = [
  { id: 'old_love', name: 'Old Love', url: '/daftar_music/old_love.mp3' },
  { id: 'beautiful_bazzi', name: 'Beautiful Bazzi', url: '/daftar_music/beautiful_bazzi.mp3' },
  { id: 'shape_of_my_heart', name: 'Shape of My Heart', url: '/daftar_music/shape_of_my_heart.mp3' },
  { id: 'angel_baby', name: 'Angel Baby', url: '/daftar_music/angel_baby.mp3' }
];

export const MAX_IMAGES = 10;
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_AUDIO_SIZE_MB = 15;
