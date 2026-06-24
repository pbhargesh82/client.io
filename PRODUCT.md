# Product

## Users

**Admin:** Freelancers and small agencies managing multiple client relationships. They work at a desk, often switching between clients, and need fast orientation — who needs attention, what's overdue, what's blocked.

**Client:** Business customers checking project status between meetings. They open the portal briefly to see progress, download deliverables, and leave comments. They are not power users; clarity beats density.

## Product Purpose

ClientSpace is a dual-role project portal: admins manage clients, projects, tasks, and files; clients get a read-focused view of their work with light interaction (comments, downloads). Success means both roles complete their job in under a minute without confusion or training.

## Authentication

- Single sign-in page at `/login` for both admin and client roles.
- Email + password via Supabase Auth (no magic links).
- After login, users are routed by role: admin → `/dashboard`, client → `/client/dashboard`.

## Client onboarding

- Admins create client accounts from the Clients list.
- Password can be set manually or auto-generated.
- **No welcome email** — the admin copies credentials from the in-app sheet and shares them with the client directly.

## Admin capabilities

- Dashboard with summary metrics
- Clients list (including inactive clients); manage client in a side panel (`?client=<id>`)
- Projects list and project workspace (tasks, files, discussion)
- Create/edit/archive projects and tasks; reorder tasks
- Upload and manage project files

## Client capabilities

- Dashboard with assigned project overview
- Project view: tasks, files (download), comments
- Read-focused layout with lighter information density than admin

## Brand Personality

Calm, competent, trustworthy. Like a well-run studio — organized, never flashy. Three words: **clear**, **professional**, **dependable**.

## Anti-references

- Generic AI dashboard (purple gradients, floating cards everywhere, oversized hero stats)
- Playful consumer apps (bouncy motion, emoji empty states)
- Over-branded marketing sites inside the app shell
- Dark-mode-by-default tool aesthetic when users need readable data tables

## Design Principles

1. **Task-first** — Every screen answers "what do I do next?" before "what looks nice?"
2. **Earned familiarity** — Patterns should feel like Linear, Stripe Dashboard, or Notion: standard affordances, no invented UI.
3. **Hierarchy through type and space** — Not through colored boxes and nested cards.
4. **Client calm, admin density** — Admin can be information-rich; client surfaces stay spacious and reassuring.
5. **States are features** — Loading, empty, and error states teach and guide; never afterthoughts.

## Accessibility & Inclusion

- WCAG 2.1 AA minimum (4.5:1 body text, 3:1 large text)
- Full keyboard navigation on all interactive surfaces
- `prefers-reduced-motion` respected on all animations
- Form labels, focus rings, and semantic landmarks on every page
