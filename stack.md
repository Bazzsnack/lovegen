# LoveGen — Tech Stack Specification

> **Purpose**: This document is the single source of truth for every technology used in the LoveGen project. The AI Coding Agent **MUST** adhere to these choices — no substitutions are permitted without explicit approval.

---

## 1. Framework & Runtime

| Layer | Technology | Version | Notes |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 15.x (latest stable) | Use the `app/` directory exclusively. No `pages/` router. |
| **Language** | TypeScript | 5.x | Strict mode enabled (`"strict": true` in `tsconfig.json`). No `any` types unless absolutely unavoidable and annotated with `// eslint-disable-next-line @typescript-eslint/no-explicit-any`. |
| **Runtime** | Node.js | 20 LTS | Target for both local dev and Vercel serverless functions. |
| **Package Manager** | pnpm | 9.x | Lock file (`pnpm-lock.yaml`) must be committed. |

---

## 2. Backend & Database

| Service | Technology | Purpose |
|---|---|---|
| **Database** | Supabase (PostgreSQL 15+) | All persistent data — user accounts, page configs, custom paths, analytics. |
| **Auth** | Supabase Auth | Email/password + OAuth (Google, GitHub). Magic link optional. |
| **Storage** | Supabase Storage | User-uploaded images and audio files. Bucket: `user-media`. Max file size: 10 MB images, 15 MB audio. |
| **Edge Functions** | Supabase Edge Functions (Deno) | Webhook handlers, slug validation, abuse detection. |
| **ORM / Query** | Supabase JS Client (`@supabase/supabase-js` v2) | Direct client usage — no additional ORM. Use Row-Level Security (RLS) for all tables. |

### Supabase Configuration Rules

- **RLS must be enabled** on every table with no exceptions.
- Storage buckets use **signed URLs** for private media; public pages use **public URLs** with CDN caching.
- Database migrations are managed via `supabase db diff` and stored in `supabase/migrations/`.
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only).

---

## 3. 3D Rendering Engine

| Library | Version | Purpose |
|---|---|---|
| **Three.js** | 0.170.x+ | Core WebGL rendering engine. |
| **React Three Fiber (`@react-three/fiber`)** | 9.x | Declarative React wrapper for Three.js. |
| **React Three Drei (`@react-three/drei`)** | 9.x | Utility helpers — `OrbitControls`, `Text`, `Billboard`, `useTexture`, etc. |
| **React Three Postprocessing (`@react-three/postprocessing`)** | 2.x | Bloom, depth-of-field, and vignette effects for the romantic aesthetic. |

### 3D Rendering Rules

- **Canvas component** must be wrapped in `React.Suspense` with a branded loading fallback.
- All Three.js geometries and materials must be **disposed** on unmount via `useEffect` cleanup or Drei's `useDispose`.
- Target **60 FPS** on mid-range devices. Use `frameloop="demand"` for the editor preview; `frameloop="always"` for the published page.
- Texture resolution cap: **2048×2048**. Resize on upload via a server-side Sharp pipeline before storing.

---

## 4. QR Code Generation

| Library | Purpose |
|---|---|
| **`qr-code-styling`** | Canvas/SVG-based QR code with full visual customization — custom colors, gradients, dot styles, corner styles, embedded center logo/image. |

### QR Code Rules

- QR codes are rendered **client-side** on a `<canvas>` element.
- The QR payload is the published page URL: `https://lovegen.app/{custom-slug}`.
- Users can customize: dot style (rounded, square, dots, classy), corner style, foreground gradient (linear/radial), background color/transparency, and center image (their uploaded photo or the LoveGen logo).
- Export formats: **PNG** (default download) and **SVG** (for print).
- Error correction level: **H (30%)** to support center image overlay.

---

## 5. Styling & UI

| Technology | Purpose |
|---|---|
| **Tailwind CSS** | 4.x | Utility-first styling. Custom theme tokens defined in `tailwind.config.ts`. |
| **Framer Motion** | 12.x | Page transitions, micro-animations, and orchestrated UI sequences. |
| **Lucide React** | Icon library. No other icon sets. |
| **Google Fonts** | `Inter` (UI), `Playfair Display` (romantic headings), `Dancing Script` (cursive accents). Loaded via `next/font/google`. |

### Styling Rules

- **Dark mode first**. The builder UI uses a dark romantic palette (deep purples, rose golds, soft pinks on dark backgrounds).
- No inline styles. All styling through Tailwind utilities or CSS modules for complex animations.
- Responsive breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px). Mobile-first approach.
- Glassmorphism panels: `backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl`.

---

## 6. Deployment & Infrastructure

| Service | Purpose |
|---|---|
| **Vercel** | Hosting, serverless functions, edge middleware, preview deployments. |
| **Vercel Analytics** | Core Web Vitals monitoring. |
| **Vercel Blob** (optional fallback) | If Supabase Storage has latency issues for certain regions. |

### Deployment Rules

- Production branch: `main`. Preview deployments on all PRs.
- Environment variables are set in Vercel dashboard — never hardcoded or committed.
- Use `next.config.ts` with `images.remotePatterns` configured for Supabase Storage domain.
- Edge Middleware (`middleware.ts`) handles custom slug routing and rate limiting.

---

## 7. Dev Tooling & Quality

| Tool | Purpose |
|---|---|
| **ESLint** | `next/core-web-vitals` + `@typescript-eslint` strict preset. |
| **Prettier** | Code formatting. Config committed as `.prettierrc`. |
| **Husky + lint-staged** | Pre-commit hooks for linting and formatting. |
| **Vitest** | Unit tests for utilities, hooks, and server actions. |
| **Playwright** | E2E tests for critical flows (create page → publish → view). |

---

## 8. Key Dependencies Summary

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "three": "^0.170.0",
    "@react-three/fiber": "^9.0.0",
    "@react-three/drei": "^9.0.0",
    "@react-three/postprocessing": "^2.16.0",
    "qr-code-styling": "^1.8.0",
    "framer-motion": "^12.0.0",
    "lucide-react": "^0.460.0",
    "tailwindcss": "^4.0.0",
    "sharp": "^0.33.0",
    "zod": "^3.23.0"
  }
}
```

> **⚠️ CRITICAL**: Do not install any library not listed above without explicit approval. If a gap is found, propose the addition in a comment before installing.
