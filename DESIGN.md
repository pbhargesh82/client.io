# Design System — ClientSpace

## Theme

Light product UI. Restrained color strategy. Pure white content surface; cool slate sidebar; sky-blue primary (nautical instrument — precise, trustworthy). Warm brass accent for sparing highlights only.

## Color Palette (OKLCH)

```css
--background: oklch(1 0 0);
--foreground: oklch(0.22 0.02 210);
--card: oklch(1 0 0);
--card-foreground: oklch(0.22 0.02 210);
--primary: oklch(0.52 0.09 210);
--primary-foreground: oklch(1 0 0);
--secondary: oklch(0.96 0.008 210);
--secondary-foreground: oklch(0.28 0.03 210);
--muted: oklch(0.965 0.006 210);
--muted-foreground: oklch(0.48 0.02 210);
--accent: oklch(0.62 0.11 75);
--accent-foreground: oklch(0.18 0.02 75);
--destructive: oklch(0.55 0.2 25);
--border: oklch(0.91 0.008 210);
--input: oklch(0.91 0.008 210);
--ring: oklch(0.52 0.09 210);
--sidebar: oklch(0.18 0.025 220);
--sidebar-foreground: oklch(0.92 0.01 210);
--sidebar-primary: oklch(0.52 0.09 210);
--sidebar-primary-foreground: oklch(1 0 0);
--sidebar-accent: oklch(0.24 0.03 220);
--sidebar-accent-foreground: oklch(0.95 0.01 210);
--sidebar-border: oklch(0.28 0.025 220);
```

## Typography

- **Family:** Geist Variable (sans only — product register)
- **Scale:** 0.75 / 0.875 / 1 / 1.125 / 1.25 / 1.5 rem (tight ratio)
- **Weights:** 400 body, 500 labels, 600 headings
- **Measure:** 65ch max for prose blocks

## Radius & Spacing

- `--radius: 0.5rem` (8px — product default, not bubbly)
- Section spacing: 24–32px vertical rhythm
- Page padding: 24px mobile, 32px desktop

## Components

- shadcn/ui base-nova on Tailwind v4
- Tables for list data (clients, projects)
- Cards only for grouped content blocks, never nested
- Badges for status only
- Skeleton loaders for async lists

## Motion

- 150ms ease-out transitions on hover/focus
- No page-load orchestration
- `@media (prefers-reduced-motion: reduce)` → instant transitions

## Layout

- **Admin:** Fixed 240px sidebar + fluid content (max-width 72rem)
- **Client:** Top bar + centered content (max-width 48rem)
- **Auth:** Split panel admin; centered card client
