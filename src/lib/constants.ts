export const THEME_CONFIGS = {
  'rose-petal': {
    background: ['#1a0011', '#2d0a1f', '#0d0015'],
    accent: '#ff6b9d',
    particleGlow: '#ff8ab5',
    decorationType: 'petals',
    lightColor: '#ffb3cc',
  },
  'starlight': {
    background: ['#0a0a2e', '#1a1a4e', '#000020'],
    accent: '#b8c6ff',
    particleGlow: '#dde4ff',
    decorationType: 'stars',
    lightColor: '#e8edff',
  },
  'ocean-breeze': {
    background: ['#001a2c', '#002a4a', '#001020'],
    accent: '#4ecdc4',
    particleGlow: '#7eddd6',
    decorationType: 'bubbles',
    lightColor: '#a0ebe5',
  },
  'golden-hour': {
    background: ['#1a1000', '#2d1a00', '#0d0800'],
    accent: '#ffd700',
    particleGlow: '#ffe44d',
    decorationType: 'sparkles',
    lightColor: '#fff0a0',
  },
  'midnight-bloom': {
    background: ['#0d0020', '#1a0040', '#050010'],
    accent: '#9b59b6',
    particleGlow: '#c39bd3',
    decorationType: 'flowers',
    lightColor: '#d7bde2',
  },
  'aurora': {
    background: ['#001a0d', '#002a1a', '#000d05'],
    accent: '#00ff88',
    particleGlow: '#66ffaa',
    decorationType: 'ribbons',
    lightColor: '#b3ffd9',
  },
} as const;

export const RESERVED_SLUGS = [
  'dashboard', 'auth', 'api', 'admin', 'settings', 'create', 'edit', 'view', 
  'not-found', 'login', 'signup', 'pricing', 'about', 'help', 'support', 
  'terms', 'privacy'
];

export const MAX_IMAGES = 10;
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_AUDIO_SIZE_MB = 15;
