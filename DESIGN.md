---
name: Earned Precision
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#0f172a'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fd'
  on-secondary-container: '#57657b'
  tertiary: '#2563eb'
  on-tertiary: '#ffffff'
  tertiary-container: '#00174b'
  on-tertiary-container: '#497cff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f8fafc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-page: 40px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is built on the principle of "earned familiarity"—a visual language that prioritizes clarity and utility over decorative flourishes. It aims to evoke a sense of calm competence, positioning itself as a reliable tool for professional freelancers and high-stakes clients. 

The aesthetic draws from Modern Corporate Minimalism, characterized by:
- **Spatial Hierarchy:** Information is organized through strategic whitespace and alignment rather than heavy containers or borders.
- **Utility-First:** Every element serves a functional purpose, reducing cognitive load during complex project management tasks.
- **Subtle Technicality:** Clean lines and a restrained palette suggest a precision-engineered environment.
- **Accessibility:** Built to exceed WCAG 2.1 AA standards, ensuring that data-heavy views remain legible for all users.

## Colors

The palette is rooted in Slate and Navy tones to establish professional authority.

- **Primary (#0F172A):** Used for primary text and high-importance UI elements to ensure maximum contrast.
- **Secondary (#334155):** Used for supporting text and secondary actions.
- **Tertiary/Action (#2563EB):** A refined "Deep Sea" blue used sparingly for interactive elements, focus states, and primary buttons.
- **Neutral Backgrounds:** A series of cool grays (`#F8FAFC` to `#E2E8F0`) are used to differentiate page sections without creating visual noise.
- **High-Contrast Data:** Tables utilize alternating row highlights in `#F1F5F9` and 1px borders in `#E2E8F0` to maintain a 4.5:1 contrast ratio against text.

## Typography

Typography is the primary driver of the visual hierarchy. 

- **Headlines:** Hanken Grotesk provides a sharp, contemporary feel that remains authoritative. Use tighter tracking for larger displays to maintain a cohesive "block" feel.
- **Body:** Inter is the workhorse for all prose and interface labels, chosen for its exceptional legibility on digital screens.
- **Data & Metadata:** JetBrains Mono is used for IDs, timestamps, and currency values within tables to ensure characters are distinct and columns align vertically.
- **Hierarchy:** Use font weight (Medium/Semi-bold) to denote importance rather than increasing size, keeping the interface compact and professional.

## Layout & Spacing

This design system utilizes a **12-column fixed-grid** layout for desktop, centered within the viewport.

- **The 8px Rule:** All dimensions, padding, and margins are multiples of 8px to ensure a consistent rhythmic flow.
- **Task-First Viewports:** Content areas are limited to a `1280px` max-width to prevent line lengths from becoming unreadable on ultra-wide monitors.
- **Information Density:** For data tables and lists, use "Comfortable" (16px) and "Compact" (8px) vertical padding variants depending on the user's view preference.
- **White Space:** Use generous top-level margins (`stack-lg`) to separate major logical sections, while keeping related inputs and labels tightly grouped (`stack-sm`).

## Elevation & Depth

To maintain a "flat" and professional aesthetic, elevation is communicated through tonal changes and crisp outlines rather than heavy shadows.

- **Base Layer:** The main page background is `#F8FAFC`.
- **Surface Layer:** Interactive cards and white sections use `#FFFFFF` with a 1px solid border in `#E2E8F0`.
- **Shadows:** Use a single, highly diffused "Ambient" shadow for floating elements like dropdowns or modals: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`.
- **Focus States:** Every interactive element must display a 2px offset ring in Tertiary Blue (`#2563EB`) when navigated via keyboard.

## Shapes

The shape language is conservative and geometric.

- **Components:** Buttons, input fields, and cards use a `4px` (Soft) corner radius. This provides a modern touch without appearing overly "bouncy" or consumer-oriented.
- **Selection Indicators:** Use vertical 4px bars on the left side of active navigation items or table rows to indicate focus.
- **Consistency:** Avoid rounded-full (pill) shapes except for status badges (e.g., "Active" or "Pending") to differentiate them from interactive buttons.

## Components

- **Buttons:** Primary buttons are solid Navy (`#0F172A`) with white text. Secondary buttons are outlined with a 1px border. No gradients or inner shadows.
- **Inputs:** Use a standard 40px height for desktop. Labels must sit above the field in `body-sm` Semi-bold. Placeholders use `#94A3B8`.
- **Data Tables:** The core of the portal. Use sticky headers, no outer borders (only horizontal dividers), and a `data-mono` font for numerical values.
- **Status Chips:** Small, subtle background tints with high-contrast text (e.g., Success: Light green background, Dark green text).
- **Navigation:** A clean left-hand sidebar or top-bar with `label-caps` for section headers. Active states are indicated by a weight change and a subtle background tint of `#F1F5F9`.
- **Focus Rings:** Non-negotiable for accessibility; ensure `outline-offset: 2px` on all clickable components.

## Implementation

Source of truth for tokens in the app: `client/src/index.css` (`:root` and `@theme inline`).

- **Mode:** Light mode only
- **Icons:** Material Symbols Outlined (`client/src/components/ui/icon.tsx`) — not Lucide
- **UI primitives:** shadcn/ui on Base UI (`client/src/components/ui/`)
- **App components:** `client/src/components/app/` — panels, summary cards, task rows, sheets, badges
- **Fonts:** Hanken Grotesk (headlines), Inter (body), JetBrains Mono (data) — loaded in `client/index.html`
- **Layout:** Admin and client shells with sidebar navigation; max content width `1280px`