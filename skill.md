# LoveGen — AI Coding Agent: Operational Rules & Best Practices

> **Purpose**: This document defines the strict behavioral rules, coding standards, and best practices that the AI Coding Agent **MUST** follow at all times when building the LoveGen project. Violations of these rules will produce broken, insecure, or unmaintainable code.

---

## 1. General Directives

### 1.1 Code Philosophy

- **NEVER** generate placeholder or stub code. Every function must be fully implemented.
- **NEVER** use `// TODO` comments as an excuse to skip implementation. If you write a TODO, you must immediately implement it.
- **NEVER** skip error handling. Every async operation must have proper try/catch with meaningful error messages.
- **ALWAYS** write TypeScript with strict types. The `any` type is forbidden unless annotated with a justification comment.
- **ALWAYS** prefer Server Components by default. Only add `'use client'` when the component genuinely needs browser APIs, state, or event handlers.
- **ALWAYS** co-locate related files. Tests next to source files. Types near their consumers.

### 1.2 File & Component Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ParticleSystem.tsx` |
| Hooks | camelCase with `use` prefix | `useParticleSystem.ts` |
| Utilities | camelCase | `formatSlug.ts` |
| Constants | SCREAMING_SNAKE_CASE for values | `MAX_IMAGES = 10` |
| Types/Interfaces | PascalCase with descriptive names | `PageConfig`, `ParticleState` |
| Server Actions | camelCase verb-first | `publishPage.ts`, `deleteSlug.ts` |
| CSS Modules (if used) | kebab-case | `glass-panel.module.css` |

### 1.3 Import Order (enforced by ESLint)

```typescript
// 1. React / Next.js core
import { useState, useEffect } from 'react';
import Image from 'next/image';

// 2. Third-party libraries
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';

// 3. Internal absolute imports (lib, hooks, components)
import { supabase } from '@/lib/supabase/client';
import { useAudio } from '@/hooks/useAudio';
import { GlassPanel } from '@/components/ui/GlassPanel';

// 4. Relative imports (sibling components, local types)
import { FallingImage } from './FallingImage';
import type { ParticleState } from './types';

// 5. Styles (if any)
import styles from './particle-system.module.css';
```

---

## 2. Next.js Component Architecture

### 2.1 Modular Component Rules

- **Each component file must export exactly one component.** No multi-component files.
- **Maximum component file length: 200 lines.** If a component exceeds this, extract sub-components or custom hooks.
- **Props interfaces must be explicitly defined and exported:**

```typescript
// ✅ CORRECT
export interface FallingImageProps {
  imageUrl: string;
  position: [number, number, number];
  scale: number;
  opacity: number;
}

export function FallingImage({ imageUrl, position, scale, opacity }: FallingImageProps) {
  // ...
}

// ❌ WRONG — inline props, no export
function FallingImage({ imageUrl, position }: { imageUrl: string; position: number[] }) {
  // ...
}
```

### 2.2 Server vs Client Component Rules

| Use Server Component When | Use Client Component When |
|---------------------------|---------------------------|
| Fetching data from Supabase | Using `useState`, `useEffect`, `useRef` |
| Rendering static or semi-static content | Handling user interactions (onClick, onChange) |
| SEO-critical content (marketing pages) | Using browser APIs (Audio, Canvas, WebGL) |
| Layout wrappers | Animations with Framer Motion |
| Metadata generation | Three.js / R3F rendering |

### 2.3 Component Composition Pattern

```typescript
// Server Component (default) — fetches data
// src/app/view/[pageId]/page.tsx
export default async function ViewPage({ params }: { params: { pageId: string } }) {
  const pageData = await getPageData(params.pageId);
  
  if (!pageData) return notFound();
  
  return (
    <Suspense fallback={<LoadingScreen />}>
      {/* Client boundary — only the interactive 3D scene */}
      <SceneCanvas pageData={pageData} />
    </Suspense>
  );
}
```

### 2.4 Data Fetching Rules

- **Server Components**: Fetch directly using the Supabase server client. No `useEffect` fetching.
- **Client Components**: Use Server Actions for mutations. Use SWR or React Query only for polling/real-time needs.
- **NEVER** expose the `SUPABASE_SERVICE_ROLE_KEY` to client components. Use it only in Server Actions, API routes, and middleware.
- **ALWAYS** validate inputs with Zod on the server before any database operation:

```typescript
// src/actions/publishPage.ts
'use server';

import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { pageSchema } from '@/lib/validations/page';

export async function publishPage(formData: unknown) {
  // 1. ALWAYS validate first
  const validated = pageSchema.parse(formData);
  
  // 2. Then authenticate
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // 3. Then execute
  const { data, error } = await supabase
    .from('pages')
    .insert({ ...validated, user_id: user.id })
    .select()
    .single();
  
  if (error) throw new Error(`Failed to publish: ${error.message}`);
  return data;
}
```

---

## 3. Browser Audio Autoplay Policy Handling

### 3.1 The Problem

All modern browsers block `audio.play()` unless it is triggered by a direct user gesture (click, tap, keypress). Calling `.play()` on page load **WILL** throw a `NotAllowedError` and break the experience.

### 3.2 Mandatory Implementation Pattern

```typescript
// src/components/audio/AudioProvider.tsx
'use client';

import { createContext, useContext, useRef, useState, useCallback } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  isReady: boolean;
  play: () => Promise<void>;
  pause: () => void;
  setVolume: (v: number) => void;
}

const AudioCtx = createContext<AudioContextType | null>(null);

export function AudioProvider({ 
  audioUrl, 
  children 
}: { 
  audioUrl: string | null; 
  children: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Initialize audio element lazily
  const initAudio = useCallback(() => {
    if (!audioUrl || audioRef.current) return;
    
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.preload = 'metadata';
    audio.volume = 0.7;
    
    audio.addEventListener('canplaythrough', () => setIsReady(true));
    audio.addEventListener('ended', () => setIsPlaying(false));
    audio.addEventListener('error', (e) => {
      console.error('Audio load error:', e);
      setIsReady(false);
    });
    
    audioRef.current = audio;
  }, [audioUrl]);

  // ✅ CORRECT: play() is ONLY called from a user gesture handler
  const play = useCallback(async () => {
    initAudio();
    if (!audioRef.current) return;
    
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      // Graceful degradation — show a "tap to play" hint instead of crashing
      console.warn('Autoplay blocked:', err);
      setIsPlaying(false);
    }
  }, [initAudio]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const setVolume = useCallback((v: number) => {
    if (audioRef.current) audioRef.current.volume = Math.max(0, Math.min(1, v));
  }, []);

  return (
    <AudioCtx.Provider value={{ isPlaying, isReady, play, pause, setVolume }}>
      {children}
    </AudioCtx.Provider>
  );
}

export const useAudio = () => {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
};
```

### 3.3 Entry Overlay Pattern

```typescript
// src/components/audio/EntryOverlay.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from './AudioProvider';
import { useState } from 'react';

export function EntryOverlay() {
  const { play } = useAudio();
  const [dismissed, setDismissed] = useState(false);

  const handleEnter = async () => {
    // ✅ This click IS the user gesture that unlocks audio
    await play();
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8 } }}
        >
          <motion.button
            onClick={handleEnter}  // ← Direct user gesture
            className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white text-lg font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✨ Tap to Experience
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 3.4 Audio Rules Summary

| Rule | Enforcement |
|------|-------------|
| Never call `.play()` on mount | Will throw `NotAllowedError` in all browsers |
| Always wrap `.play()` in try/catch | Prevents unhandled promise rejection crashes |
| Use an entry overlay for pages with audio | Guarantees a user gesture before playback |
| Provide a visible play/pause control at all times | Users must be able to stop audio |
| Set `loop = true` for background music | Music should be continuous |
| Default volume: 0.7 (not 1.0) | Respect user comfort |
| Clean up audio on unmount | Prevent ghost audio playback |

---

## 4. 3D Rendering — Performance & Memory Management

### 4.1 Memory Leak Prevention (CRITICAL)

Three.js does **NOT** garbage collect GPU resources automatically. Every `Geometry`, `Material`, `Texture`, and `RenderTarget` must be manually disposed. Failure to do this **WILL** cause memory leaks that crash the browser tab.

```typescript
// ✅ CORRECT — dispose on unmount
import { useEffect, useMemo } from 'react';
import { PlaneGeometry, MeshStandardMaterial, TextureLoader } from 'three';
import { useLoader } from '@react-three/fiber';

export function FallingImage({ imageUrl }: { imageUrl: string }) {
  const texture = useLoader(TextureLoader, imageUrl);
  
  const geometry = useMemo(() => new PlaneGeometry(2, 2), []);
  const material = useMemo(
    () => new MeshStandardMaterial({ map: texture, transparent: true }),
    [texture]
  );

  // ✅ Cleanup GPU resources on unmount
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [geometry, material, texture]);

  return <mesh geometry={geometry} material={material} />;
}
```

### 4.2 Mandatory Performance Patterns

| Pattern | Rule | Why |
|---------|------|-----|
| **Instanced Meshes** | Use `<instancedMesh>` for any group of 10+ identical geometries | Reduces draw calls from N to 1 |
| **Object Pooling** | Never `new`/destroy particles at runtime. Recycle by resetting position. | Prevents GC spikes and allocation overhead |
| **`useMemo` for Geometry** | All `new PlaneGeometry()`, `new SphereGeometry()` etc. must be wrapped in `useMemo` | Prevents re-creation every render |
| **`useFrame` Efficiency** | Never allocate objects inside `useFrame`. Pre-allocate reusable `Vector3`, `Euler` outside. | `useFrame` runs 60x/sec — allocations here kill performance |
| **Texture Compression** | Convert uploaded images to WebP. Max resolution 2048×2048. | Reduces VRAM usage by 60-80% |
| **Conditional Rendering** | Use `visible={false}` instead of conditional JSX `{show && <mesh />}` | Avoids tree reconciliation overhead |
| **`frameloop` Setting** | Editor preview: `frameloop="demand"`. Published page: `frameloop="always"`. | Saves battery in editor when not animating |

### 4.3 Pre-Allocated Temp Variables Pattern

```typescript
// ✅ CORRECT — pre-allocate outside the loop
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Object3D, Matrix4 } from 'three';

const _tempVec = new Vector3();
const _tempObj = new Object3D();
const _tempMatrix = new Matrix4();

export function useParticleAnimation(instancedMeshRef: React.RefObject<THREE.InstancedMesh>) {
  useFrame((state, delta) => {
    if (!instancedMeshRef.current) return;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // ✅ Reuse pre-allocated objects — zero allocations per frame
      _tempObj.position.set(
        positions[i * 3],
        positions[i * 3 + 1] - delta * fallSpeed,
        positions[i * 3 + 2]
      );
      _tempObj.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, _tempObj.matrix);
    }
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });
}
```

### 4.4 GPU Resource Audit Checklist

Before submitting any 3D component, verify:

- [ ] Every `new *Geometry()` has a corresponding `.dispose()` in a cleanup function.
- [ ] Every `new *Material()` has a corresponding `.dispose()` in a cleanup function.
- [ ] Every loaded `Texture` has a corresponding `.dispose()` in a cleanup function.
- [ ] No object allocations (`new Vector3()`, `new Object3D()`, etc.) inside `useFrame`.
- [ ] `instancedMesh` is used for particle groups > 10 items.
- [ ] Canvas has `dpr={[1, 2]}` to cap pixel ratio on high-DPI screens.
- [ ] `gl.dispose()` is not needed (R3F handles Canvas-level cleanup).

---

## 5. Responsive Design with Tailwind CSS

### 5.1 Mobile-First Mandate

**ALL** styles must be written mobile-first. Base classes target mobile; breakpoint prefixes add larger screen overrides:

```tsx
// ✅ CORRECT — mobile-first
<div className="p-4 md:p-8 lg:p-12">
  <h1 className="text-2xl md:text-4xl lg:text-5xl">Title</h1>
</div>

// ❌ WRONG — desktop-first (requires overrides for mobile)
<div className="p-12 sm:p-4">
  <h1 className="text-5xl sm:text-2xl">Title</h1>
</div>
```

### 5.2 3D Canvas Responsiveness

The 3D canvas MUST be responsive. Rules:

```typescript
// ✅ Canvas must fill its container, not use fixed dimensions
<div className="w-full h-screen relative">
  <Canvas
    dpr={[1, 2]}                    // Cap DPR for performance
    camera={{ fov: 60, near: 0.1, far: 100 }}
    className="touch-none"          // Prevent scroll interference on mobile
  >
    {/* Scene contents */}
  </Canvas>
</div>
```

- **Mobile (< 768px)**: Reduce particle count by 50%. Disable `DepthOfField` post-processing. Use `dpr={[1, 1.5]}`.
- **Tablet (768–1024px)**: Standard particle count. Enable all effects. Use `dpr={[1, 2]}`.
- **Desktop (> 1024px)**: Full particle count. All effects enabled. Use `dpr={[1, 2]}`.

Detect screen size using a custom hook:

```typescript
// src/hooks/useDeviceTier.ts
'use client';

import { useState, useEffect } from 'react';

type DeviceTier = 'mobile' | 'tablet' | 'desktop';

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>('desktop');

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setTier(w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop');
    };
    
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return tier;
}
```

### 5.3 Tailwind Design System Tokens

Define these in `tailwind.config.ts`:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        love: {
          50:  '#fff0f5',
          100: '#ffe0eb',
          200: '#ffb3cc',
          300: '#ff80aa',
          400: '#ff4d88',
          500: '#ff1a66',
          600: '#e6005c',
          700: '#b30047',
          800: '#800033',
          900: '#4d001f',
          950: '#1a000a',
        },
        surface: {
          DEFAULT: '#0a0010',
          raised:  '#150020',
          overlay: '#200030',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body:    ['Inter', 'sans-serif'],
        cursive: ['Dancing Script', 'cursive'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float':     'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'fade-in':    'fadeIn 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 26, 102, 0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(255, 26, 102, 0.6)' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### 5.4 Glassmorphism Component Pattern

```tsx
// ✅ Standard glass panel — reusable across the entire UI
export function GlassPanel({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl
      bg-white/5 backdrop-blur-xl
      border border-white/10
      shadow-xl shadow-black/20
      ${className}
    `}>
      {/* Subtle gradient shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
```

---

## 6. Security Rules

| Rule | Implementation |
|------|---------------|
| **Input Sanitization** | All user text inputs are sanitized with Zod `.trim()` and HTML entity encoding before rendering. No raw `dangerouslySetInnerHTML`. |
| **File Upload Validation** | Check MIME type (server-side, not just extension), file size, and image dimensions. Reject non-image/non-audio files. |
| **Slug Injection** | Slugs are validated against a strict regex. No special characters, no path traversal (`../`). |
| **RLS Everywhere** | Every Supabase table has Row-Level Security enabled. No table should ever be publicly writable without policy. |
| **Rate Limiting** | The slug-check API endpoint is rate-limited to 10 requests/minute per IP (via Vercel Edge Middleware or Supabase Edge Function). |
| **CSP Headers** | Content Security Policy headers set in `next.config.ts` — restrict `script-src`, `style-src`, and `connect-src` to trusted origins. |
| **No Client Secrets** | `SUPABASE_SERVICE_ROLE_KEY` must NEVER appear in client-side code. Only use via Server Actions or API routes. |

---

## 7. Error Handling Standards

### 7.1 Client-Side Errors

```typescript
// ✅ Every async operation must have error handling with user feedback
try {
  const result = await publishPage(formData);
  toast.success('Your love page is live! 💕');
  router.push(`/dashboard/${result.id}`);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Validation error — show field-specific messages
    setFieldErrors(error.flatten().fieldErrors);
  } else if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error('Something went wrong. Please try again.');
  }
  // ALWAYS log for debugging
  console.error('[publishPage]', error);
}
```

### 7.2 3D Scene Error Boundary

```typescript
// ✅ Wrap the Canvas in an error boundary
// src/components/canvas/SceneErrorBoundary.tsx
'use client';

import { Component, type ReactNode } from 'react';

interface State { hasError: boolean; error?: Error; }

export class SceneErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('[3D Scene Error]', error);
    // Optionally report to analytics
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Usage:
// <SceneErrorBoundary fallback={<Static2DFallback />}>
//   <Canvas>...</Canvas>
// </SceneErrorBoundary>
```

---

## 8. Testing Standards

| Scope | Tool | What to Test |
|-------|------|-------------|
| **Unit** | Vitest | Utility functions, Zod schemas, slug validation, theme configs |
| **Component** | Vitest + Testing Library | Builder steps render correctly, form validation, state management |
| **Integration** | Vitest | Server Actions (mock Supabase), API routes |
| **E2E** | Playwright | Full flow: sign up → create page → publish → visit slug → see 3D scene |
| **Visual** | Manual + Screenshots | 3D scene renders, themes look correct, responsive layouts |

### Test File Naming

- Unit tests: `*.test.ts` (co-located with source)
- Component tests: `*.test.tsx` (co-located with component)
- E2E tests: `e2e/*.spec.ts` (in project root)

---

## 9. Git Commit Conventions

Use Conventional Commits:

```
feat(builder): add QR code customization step
fix(canvas): dispose textures on particle unmount
perf(canvas): switch decorations to instanced mesh
style(ui): update glass panel border opacity
refactor(auth): extract Supabase client factory
test(slug): add validation edge case tests
docs(readme): add deployment instructions
chore(deps): bump @react-three/fiber to 9.1.0
```

- Commits must be atomic — one logical change per commit.
- Never commit `.env`, `node_modules`, or `.next/` directories.
- PR descriptions must include: **What**, **Why**, and **How to test**.
