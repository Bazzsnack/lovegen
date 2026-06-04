# LoveGen — Architecture & Logic Design

> **Purpose**: This document defines the complete system architecture, data flow, database schema, routing strategy, and 3D rendering logic. The AI Coding Agent must follow this design precisely.

---

## 1. System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         VERCEL EDGE                              │
│  ┌─────────────┐  ┌──────────────────┐  ┌────────────────────┐  │
│  │ middleware.ts│  │  Next.js App      │  │  Serverless Fns    │  │
│  │ (slug guard) │──│  (App Router)     │──│  (API routes)      │  │
│  └─────────────┘  └──────────────────┘  └────────────────────┘  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
    ┌─────────▼──────────┐   ┌──────────▼──────────┐
    │  Supabase Database │   │  Supabase Storage    │
    │  (PostgreSQL)      │   │  (S3-compatible)     │
    │  - pages           │   │  - user-media bucket │
    │  - users           │   │    ├── images/       │
    │  - slugs           │   │    └── audio/        │
    │  - analytics       │   │                      │
    └────────────────────┘   └──────────────────────┘
```

---

## 2. User Flow (End-to-End)

### Phase 1: Authentication
1. User lands on `lovegen.app` → sees the marketing landing page with a live 3D demo.
2. User clicks **"Create Your Page"** → redirected to `/auth/login`.
3. Supabase Auth handles sign-up/login (email + password, or Google OAuth).
4. On successful auth → redirect to `/dashboard`.

### Phase 2: Page Creation (Builder)
5. User clicks **"+ New Page"** on the dashboard → navigates to `/dashboard/create`.
6. The Builder UI is a multi-step wizard with the following tabs:

| Step | Tab Name | Inputs | Validation |
|------|----------|--------|------------|
| 1 | **Content** | Title (max 100 chars), Love message/phrases (max 5 phrases, 200 chars each), Optional subtitle | Zod schema validation. At least 1 phrase required. |
| 2 | **Media** | Upload images (max 10, JPEG/PNG/WebP, ≤10MB each), Upload background audio (MP3/WAV/OGG, ≤15MB) | File type + size validation client-side + server-side. Sharp resizes images to max 2048px. |
| 3 | **Style** | Theme preset (6 options: Rose Petal, Starlight, Ocean Breeze, Golden Hour, Midnight Bloom, Aurora), Particle speed (slow/medium/fast), Particle density (sparse/normal/dense), Font pairing selection | Real-time 3D preview updates on change. |
| 4 | **QR Code** | Dot style, corner style, gradient colors, center image toggle, preview | Live canvas preview. |
| 5 | **Publish** | Custom URL slug input, availability check, publish confirmation | Slug regex: `^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$`. Real-time DB check on blur. |

### Phase 3: Processing & Storage
7. On **Publish**:
   - Client sends all data to Server Action `publishPage()`.
   - Server Action:
     a. Validates all inputs with Zod (server-side re-validation).
     b. Uploads images to Supabase Storage → gets public URLs.
     c. Uploads audio to Supabase Storage → gets public URL.
     d. Inserts row into `pages` table with all config data.
     e. Inserts row into `slugs` table (unique constraint enforced).
     f. Returns the published URL.
   - Client shows success modal with the live URL + QR code download button.

### Phase 4: Published Page Viewing
8. Visitor navigates to `lovegen.app/{slug}`.
9. Edge Middleware (`middleware.ts`):
   a. Intercepts the request.
   b. Queries Supabase for the slug in the `slugs` table.
   c. If found → rewrites to `/view/[pageId]` (internal dynamic route).
   d. If not found → rewrites to `/not-found`.
10. The `/view/[pageId]` page:
    a. Fetches page config from the `pages` table (server component).
    b. Fetches media URLs from Supabase Storage.
    c. Renders the full-screen 3D WebGL canvas with falling content.
    d. Shows a floating audio control widget (play/pause, auto-play after first interaction).
    e. Logs a view in the `analytics` table.

---

## 3. Dynamic Routing & Slug Resolution

### Middleware Logic (`middleware.ts`)

```
Request: lovegen.app/{path}
    │
    ├── Is path a system route? (/dashboard, /auth, /api, /_next, /static)
    │   └── YES → Pass through (next())
    │
    └── NO → Treat as potential custom slug
        │
        ├── Query Supabase: SELECT page_id FROM slugs WHERE slug = {path} AND is_active = true
        │
        ├── Found?
        │   └── YES → Rewrite to /view/{page_id}
        │
        └── NOT Found?
            └── Rewrite to /not-found (custom 404 with romantic theme)
```

### Slug Validation Rules

| Rule | Constraint |
|------|-----------|
| **Format** | Lowercase alphanumeric + hyphens only. Must start and end with alphanumeric. |
| **Length** | 3–60 characters. |
| **Reserved words** | `dashboard`, `auth`, `api`, `admin`, `settings`, `create`, `edit`, `view`, `not-found`, `login`, `signup`, `pricing`, `about`, `help`, `support`, `terms`, `privacy`. Stored in a `RESERVED_SLUGS` constant. |
| **Uniqueness** | Enforced via `UNIQUE` constraint on `slugs.slug` column + application-level check before insert. |
| **Availability check** | Debounced API call (300ms) on the slug input field → returns `{ available: boolean }`. |

---

## 4. Database Schema (Supabase PostgreSQL)

### Table: `profiles`

```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  avatar_url    TEXT,
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  pages_count   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: Users can only read/update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

### Table: `pages`

```sql
CREATE TABLE pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  subtitle        TEXT,
  phrases         JSONB NOT NULL DEFAULT '[]',
  -- phrases format: [{"text": "I love you", "font": "dancing-script", "color": "#ff6b9d"}]
  
  theme           TEXT NOT NULL DEFAULT 'rose-petal'
                  CHECK (theme IN ('rose-petal', 'starlight', 'ocean-breeze', 'golden-hour', 'midnight-bloom', 'aurora')),
  
  particle_speed  TEXT NOT NULL DEFAULT 'medium' CHECK (particle_speed IN ('slow', 'medium', 'fast')),
  particle_density TEXT NOT NULL DEFAULT 'normal' CHECK (particle_density IN ('sparse', 'normal', 'dense')),
  font_pairing    TEXT NOT NULL DEFAULT 'playfair-inter',
  
  image_urls      JSONB NOT NULL DEFAULT '[]',
  -- format: ["https://...supabase.co/storage/v1/object/public/user-media/images/uuid.webp"]
  
  audio_url       TEXT,
  audio_filename  TEXT,
  
  qr_config       JSONB NOT NULL DEFAULT '{}',
  -- format: {"dotStyle": "rounded", "cornerStyle": "square", "fgGradient": {...}, "bgColor": "#000", "centerImage": "logo"|"photo"|null}
  
  is_published    BOOLEAN NOT NULL DEFAULT false,
  published_at    TIMESTAMPTZ,
  view_count      INTEGER NOT NULL DEFAULT 0,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pages_user_id ON pages(user_id);
CREATE INDEX idx_pages_published ON pages(is_published) WHERE is_published = true;

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own pages"
  ON pages FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public reads published pages"
  ON pages FOR SELECT USING (is_published = true);
```

### Table: `slugs`

```sql
CREATE TABLE slugs (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug      TEXT NOT NULL UNIQUE,
  page_id   UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_slugs_active ON slugs(slug) WHERE is_active = true;
CREATE INDEX idx_slugs_page_id ON slugs(page_id);

ALTER TABLE slugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own slugs"
  ON slugs FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public reads active slugs"
  ON slugs FOR SELECT USING (is_active = true);
```

### Table: `analytics`

```sql
CREATE TABLE analytics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id     UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL CHECK (event_type IN ('view', 'qr_scan', 'audio_play', 'share')),
  visitor_ip  INET,
  user_agent  TEXT,
  referrer    TEXT,
  country     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_page_id ON analytics(page_id);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own page analytics"
  ON analytics FOR SELECT
  USING (
    page_id IN (SELECT id FROM pages WHERE user_id = auth.uid())
  );

-- Insert allowed from service role only (server-side)
CREATE POLICY "Service inserts analytics"
  ON analytics FOR INSERT
  WITH CHECK (true);
```

### Database Function: Auto-Update `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Database Function: Increment View Count

```sql
CREATE OR REPLACE FUNCTION increment_view_count(target_page_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE pages SET view_count = view_count + 1 WHERE id = target_page_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. 3D Falling Particle Animation — Technical Specification

### Rendering Architecture

```
<Canvas> (React Three Fiber)
  ├── <PerspectiveCamera>         — FOV 60, positioned at z=30
  ├── <ambientLight>              — Soft romantic glow (intensity 0.4)
  ├── <pointLight>                — Warm accent light (color based on theme)
  ├── <OrbitControls>             — Zoom (min 15, max 50), pan enabled, rotate enabled
  ├── <PostProcessing>
  │   ├── <Bloom>                 — Soft glow on light elements
  │   ├── <DepthOfField>          — Tilt-shift bokeh effect
  │   └── <Vignette>              — Dark edge framing
  ├── <ParticleSystem>            — Main falling content manager
  │   ├── <FallingImage />        — Instanced per uploaded image
  │   ├── <FallingText />         — Instanced per phrase
  │   └── <FallingPetal />        — Decorative ambient particles (hearts, petals, stars — theme-dependent)
  └── <BackgroundGradient />      — Animated gradient mesh backdrop
```

### Particle System Logic (`ParticleSystem.tsx`)

#### Initialization

```typescript
interface Particle {
  id: string;
  type: 'image' | 'text' | 'decoration';
  content: string;           // image URL or text string
  position: Vector3;         // current position
  velocity: Vector3;         // fall speed + drift
  rotation: Euler;           // current rotation
  rotationSpeed: Vector3;    // rotation velocity per axis
  scale: number;             // size multiplier
  opacity: number;           // for fade-in/fade-out
  lifetime: number;          // seconds since spawn
  maxY: number;              // y-position where particle resets (below camera frustum)
}
```

#### Spawn Logic

1. **Spawn Zone**: Particles spawn at `y = +20` (above camera frustum), with `x` and `z` randomized within `[-15, +15]`.
2. **Density Mapping**:
   - `sparse`: 30 total particles
   - `normal`: 60 total particles  
   - `dense`: 100 total particles
3. **Content Distribution**: 40% user images, 30% user text phrases, 30% decorative particles.
4. **Initial Stagger**: Particles are initialized with randomized `y` positions between `[-20, +20]` so the scene is populated on first render (no empty start).

#### Animation Loop (per frame via `useFrame`)

```typescript
useFrame((state, delta) => {
  particles.forEach(particle => {
    // 1. GRAVITY — constant downward drift
    const speedMultiplier = { slow: 0.5, medium: 1.0, fast: 1.8 }[particleSpeed];
    particle.position.y -= particle.velocity.y * delta * speedMultiplier;
    
    // 2. HORIZONTAL DRIFT — gentle sine wave for organic feel
    particle.position.x += Math.sin(state.clock.elapsedTime * 0.3 + particle.id.charCodeAt(0)) * 0.002;
    particle.position.z += Math.cos(state.clock.elapsedTime * 0.2 + particle.id.charCodeAt(1)) * 0.001;
    
    // 3. ROTATION — slow tumble
    particle.rotation.x += particle.rotationSpeed.x * delta;
    particle.rotation.y += particle.rotationSpeed.y * delta;
    particle.rotation.z += particle.rotationSpeed.z * delta;
    
    // 4. RECYCLING — when particle falls below view, teleport to top
    if (particle.position.y < particle.maxY) {
      particle.position.y = 20 + Math.random() * 5;     // reset above view
      particle.position.x = (Math.random() - 0.5) * 30; // randomize x
      particle.position.z = (Math.random() - 0.5) * 10;  // randomize z
      particle.opacity = 0; // fade in from transparent
    }
    
    // 5. FADE IN — particles fade in over 0.5 seconds after spawn/recycle
    if (particle.opacity < 1) {
      particle.opacity = Math.min(1, particle.opacity + delta * 2);
    }
  });
});
```

#### Performance Optimizations

| Technique | Implementation |
|-----------|---------------|
| **Instanced Meshes** | Use `<instancedMesh>` for decorative particles (hearts/petals) — single draw call for all. |
| **Texture Atlas** | Combine user images into a single texture atlas (max 4096×4096) to reduce texture binds. |
| **Frustum Culling** | Enabled by default in R3F. Particles outside camera view are not rendered. |
| **LOD (Level of Detail)** | Particles far from camera (z > 10) use simplified geometry (fewer vertices). |
| **Object Pooling** | Particles are never created/destroyed — they are recycled by resetting position. |
| **`useMemo` for Geometry** | All shared geometries (`PlaneGeometry` for images, custom shapes for decorations) are memoized. |

### Theme Color Maps

```typescript
const THEME_CONFIGS = {
  'rose-petal': {
    background: ['#1a0011', '#2d0a1f', '#0d0015'],
    accent: '#ff6b9d',
    particleGlow: '#ff8ab5',
    decorationType: 'petals',     // rose petal shapes
    lightColor: '#ffb3cc',
  },
  'starlight': {
    background: ['#0a0a2e', '#1a1a4e', '#000020'],
    accent: '#b8c6ff',
    particleGlow: '#dde4ff',
    decorationType: 'stars',      // star/sparkle shapes
    lightColor: '#e8edff',
  },
  'ocean-breeze': {
    background: ['#001a2c', '#002a4a', '#001020'],
    accent: '#4ecdc4',
    particleGlow: '#7eddd6',
    decorationType: 'bubbles',    // circular translucent shapes
    lightColor: '#a0ebe5',
  },
  'golden-hour': {
    background: ['#1a1000', '#2d1a00', '#0d0800'],
    accent: '#ffd700',
    particleGlow: '#ffe44d',
    decorationType: 'sparkles',   // golden dust particles
    lightColor: '#fff0a0',
  },
  'midnight-bloom': {
    background: ['#0d0020', '#1a0040', '#050010'],
    accent: '#9b59b6',
    particleGlow: '#c39bd3',
    decorationType: 'flowers',    // abstract flower shapes
    lightColor: '#d7bde2',
  },
  'aurora': {
    background: ['#001a0d', '#002a1a', '#000d05'],
    accent: '#00ff88',
    particleGlow: '#66ffaa',
    decorationType: 'ribbons',    // flowing ribbon shapes
    lightColor: '#b3ffd9',
  },
} as const;
```

---

## 6. Audio Playback Architecture

### Component: `AudioController.tsx`

```
User lands on published page
    │
    ├── Audio element is created with src but NOT playing
    │   └── <audio preload="metadata" /> — does not autoplay
    │
    ├── Full-screen "Tap to Experience" overlay appears
    │   └── Romantic entrance animation (fade-in, particle preview)
    │
    └── User taps/clicks the overlay
        ├── overlay.dismiss()
        ├── audio.play()          — now allowed by browser autoplay policy
        ├── 3D scene transitions from static preview to full animation
        └── Floating audio control widget appears (bottom-right corner)
            ├── Play/Pause toggle
            ├── Volume slider
            └── Track name display
```

### Rules

- **NEVER** call `audio.play()` without a preceding user gesture.
- Use the Web Audio API (`AudioContext`) for advanced effects (fade-in/out on play/pause).
- Audio state is managed via a React context (`AudioProvider`) so the control widget and the entry overlay share state.
- If no audio is uploaded, skip the overlay and go straight to the 3D scene.

---

## 7. File Structure

```
lovegen/
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Landing page, pricing, about
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (auth)/               # Login, signup, callback
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── callback/route.ts
│   │   ├── dashboard/            # Protected routes
│   │   │   ├── page.tsx          # Pages list
│   │   │   ├── create/page.tsx   # Builder wizard
│   │   │   ├── [pageId]/
│   │   │   │   └── edit/page.tsx # Edit existing page
│   │   │   └── layout.tsx
│   │   ├── view/
│   │   │   └── [pageId]/
│   │   │       └── page.tsx      # Published page renderer (internal)
│   │   ├── api/
│   │   │   ├── check-slug/route.ts
│   │   │   └── analytics/route.ts
│   │   ├── not-found.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── builder/              # Builder wizard components
│   │   │   ├── ContentStep.tsx
│   │   │   ├── MediaStep.tsx
│   │   │   ├── StyleStep.tsx
│   │   │   ├── QRCodeStep.tsx
│   │   │   ├── PublishStep.tsx
│   │   │   └── BuilderWizard.tsx
│   │   ├── canvas/               # 3D rendering components
│   │   │   ├── ParticleSystem.tsx
│   │   │   ├── FallingImage.tsx
│   │   │   ├── FallingText.tsx
│   │   │   ├── FallingDecoration.tsx
│   │   │   ├── BackgroundGradient.tsx
│   │   │   ├── PostEffects.tsx
│   │   │   └── SceneCanvas.tsx
│   │   ├── audio/
│   │   │   ├── AudioProvider.tsx
│   │   │   ├── AudioController.tsx
│   │   │   └── EntryOverlay.tsx
│   │   ├── qr/
│   │   │   ├── QRCodePreview.tsx
│   │   │   └── QRCodeDownload.tsx
│   │   ├── ui/                   # Shared UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   └── GlassPanel.tsx
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       ├── Footer.tsx
│   │       └── DashboardSidebar.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser client
│   │   │   ├── server.ts         # Server client (cookies-based)
│   │   │   └── admin.ts          # Service role client
│   │   ├── validations/
│   │   │   ├── page.ts           # Zod schemas for page data
│   │   │   └── slug.ts           # Slug validation
│   │   ├── constants.ts          # Theme configs, reserved slugs, limits
│   │   ├── utils.ts              # General utilities
│   │   └── types.ts              # Shared TypeScript types
│   ├── hooks/
│   │   ├── useParticleSystem.ts
│   │   ├── useAudio.ts
│   │   ├── useSlugCheck.ts
│   │   └── useMediaUpload.ts
│   └── actions/
│       ├── publishPage.ts        # Server action: publish page
│       ├── updatePage.ts         # Server action: update page
│       └── deletePage.ts         # Server action: delete page
├── public/
│   ├── textures/                 # Decoration textures (petals, hearts, stars)
│   └── audio/                    # Default/fallback audio tracks
├── supabase/
│   ├── migrations/               # SQL migration files
│   └── config.toml
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```
