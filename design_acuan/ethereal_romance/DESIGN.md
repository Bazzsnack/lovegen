---
name: Ethereal Romance
colors:
  surface: '#f4faff'
  surface-dim: '#cbdde7'
  surface-bright: '#f4faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e7f6ff'
  surface-container: '#dff1fb'
  surface-container-high: '#d9ebf5'
  surface-container-highest: '#d4e5ef'
  on-surface: '#0d1e25'
  on-surface-variant: '#4d4447'
  inverse-surface: '#23333a'
  inverse-on-surface: '#e2f3fd'
  outline: '#7f7478'
  outline-variant: '#d0c3c7'
  surface-tint: '#6b5a60'
  primary: '#6b5a60'
  on-primary: '#ffffff'
  primary-container: '#fce4ec'
  on-primary-container: '#76646b'
  inverse-primary: '#d7c1c8'
  secondary: '#ab2c5d'
  on-secondary: '#ffffff'
  secondary-container: '#fd6c9c'
  on-secondary-container: '#6e0034'
  tertiary: '#ba0060'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffe3e9'
  on-tertiary-container: '#ca146b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f4dce4'
  primary-fixed-dim: '#d7c1c8'
  on-primary-fixed: '#25181e'
  on-primary-fixed-variant: '#524249'
  secondary-fixed: '#ffd9e1'
  secondary-fixed-dim: '#ffb1c5'
  on-secondary-fixed: '#3f001b'
  on-secondary-fixed-variant: '#8b0e45'
  tertiary-fixed: '#ffd9e2'
  tertiary-fixed-dim: '#ffb1c7'
  on-tertiary-fixed: '#3f001c'
  on-tertiary-fixed-variant: '#8e0048'
  background: '#f4faff'
  on-background: '#0d1e25'
  surface-variant: '#d4e5ef'
  surface-blush: '#FFF9FB'
  border-subtle: '#F5F5F5'
  text-muted: '#607D8B'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  section-gap: 80px
---

## Brand & Style
The brand personality is intimate, sophisticated, and celebratory, bridging the gap between a high-end wedding editorial and a modern SaaS platform. It targets creators and couples looking for a polished, aesthetic way to share their stories.

The design style is **Minimalist with Soft Tactile influences**. It prioritizes generous whitespace and a "breathable" layout to allow user-generated romantic imagery to shine. The aesthetic avoids "cutesy" tropes in favor of a refined, airy elegance that feels both premium and approachable.

## Colors
The palette is anchored in a hierarchy of pinks and deep rose tones. The **Primary** color (#FCE4EC) is reserved for large surface areas and gentle accents, while the **Secondary** (#F06292) acts as the functional call-to-action color. **Tertiary** (#DB2777) is used sparingly for high-emphasis feedback or interactive states.

The background should default to `surface-blush` or `white` to maintain a clean, high-fashion look. Typography uses `Charcoal` (#37474F) rather than pure black to soften the contrast and preserve the romantic atmosphere.

## Typography
The typographic system relies on the contrast between the traditional elegance of **Playfair Display** and the functional clarity of **Inter**. 

- **Headlines:** Always use Playfair Display. Use tighter letter-spacing for large display sizes to evoke a magazine-editorial feel.
- **Body & Labels:** Inter provides a neutral, professional foundation for the SaaS dashboard elements. 
- **Scale:** On mobile devices, display sizes must scale down significantly to ensure readability and prevent awkward line breaks in long romantic titles.

## Layout & Spacing
The layout follows a **Fixed Grid** system for the dashboard and a **Fluid, airy model** for the site builder preview.

- **Desktop:** 12-column grid with wide 48px margins to emphasize the minimalist aesthetic.
- **Mobile:** 4-column grid with 16px margins.
- **Rhythm:** Use an 8px baseline grid. Section vertical spacing should be generous (80px+) to create a sense of luxury and ease. Elements within a card or module should use smaller increments (16px or 24px) to maintain grouping.

## Elevation & Depth
Depth is achieved through **Ambient Shadows** and **Tonal Layering**. 

1.  **Surfaces:** Use `surface-blush` for the main background and `white` for interactive cards.
2.  **Shadows:** Shadows must be extremely soft and diffused, using a hint of the secondary color in the shadow tint (e.g., `rgba(240, 98, 146, 0.08)`). Avoid heavy, dark shadows.
3.  **Borders:** Use 1px solid borders in `border-subtle` (#F5F5F5) for structural definition without visual clutter.

## Shapes
The design system utilizes **Rounded** geometry to communicate softness and approachability. 

- **Cards and Modals:** Use `rounded-xl` (24px) for a soft, containerized look.
- **Buttons and Inputs:** Use `rounded-lg` (16px) to maintain consistency with the larger containers.
- **Avatars:** Always perfectly circular to contrast with the rectangular rounded cards.

## Components
- **Buttons:** Primary buttons use a solid `Deep Rose` fill with white text. Secondary buttons use a `Soft Pastel Pink` background with `Deep Rose` text. Both feature a subtle hover lift effect (shadow increase).
- **Form Fields:** Inputs feature a `Light Gray` border that transitions to `Deep Rose` on focus. Labels use `Inter` Medium at 14px for maximum legibility.
- **Chips:** Used for "Templates" or "Status" tags, these should have a 100px border radius (pill-shaped) and use low-saturation versions of the brand colors.
- **Cards:** Cards should have a `white` background, a 1px `border-subtle`, and the signature airy ambient shadow.
- **Micro-interactions:** Transitions should be slow and graceful (e.g., 300ms ease-out) to match the romantic, calm narrative of the product.
- **Lists:** Use generous vertical padding (16px) between list items with a subtle divider line to keep the interface feeling uncrowded.