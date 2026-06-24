# ClientSpace

A dual-role client portal for freelancers and agencies. Admins manage clients, projects, tasks, and files. Clients get a clean view of their work.

## Stack

- **Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS 4, TanStack Query, shadcn/ui (Base UI)
- **Backend:** Node.js, Express, TypeScript
- **Database / Auth / Storage:** Supabase (PostgreSQL, Auth, Storage)

## Docs

- [PRODUCT.md](./PRODUCT.md) — product context
- [DESIGN.md](./DESIGN.md) — design system
- [TEST_CREDENTIALS.md](./TEST_CREDENTIALS.md) — local demo login details

## Local development

### Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for local DB)

### Setup

```bash
# Install dependencies
npm install

# Copy env files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Start Supabase locally (optional)
supabase start
# Copy anon + service_role keys from `supabase status` into .env files

# Run migrations
supabase db push

# Seed admin user
npm run seed:admin -- admin@example.com "Admin User" "yourpassword"

# Optional: seed demo clients, projects, and tasks
npm run seed:demo

# Start dev servers (client :5173, API :3001)
npm run dev
```

After `seed:demo`, login details are written to `TEST_CREDENTIALS.local.md` (gitignored).

### Health check

```bash
curl http://localhost:3001/health
```

## Deploy

Production setup: **Netlify** (frontend) + **Render** (API) + **Supabase** (cloud).

### Frontend (Netlify)

1. Connect this repo in [Netlify](https://app.netlify.com) — build settings are in `netlify.toml` (uses `scripts/netlify-build.sh` for Linux native deps).
2. Set **Site environment variables** (Site settings → Environment variables):

   | Variable | Example |
   |----------|---------|
   | `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
   | `VITE_API_URL` | Your Render API URL (e.g. `https://clientspace-api.onrender.com`) |

3. In Supabase → Authentication → URL configuration, add your Netlify URL to **Site URL** and **Redirect URLs** (e.g. `https://clientspace-app.netlify.app/**`).

### API (Render)

1. In [Render](https://dashboard.render.com), create a **Blueprint** from this repo (`render.yaml`) or a **Web Service** manually:
   - **Build command:** `npm ci && npm run build -w server`
   - **Start command:** `npm run start -w server`
   - **Health check path:** `/health`
2. Set environment variables from `server/.env.example`:
   - `CORS_ORIGIN` → your Netlify URL (e.g. `https://clientspace-app.netlify.app`)
   - Supabase keys (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
3. Copy the Render service URL into Netlify `VITE_API_URL`, then redeploy the frontend.

### Client onboarding (production)

There is no outbound email. When an admin creates a client, the app shows a **credentials sheet** with the login email and password — share those with the client manually (Slack, text, etc.).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client + server concurrently |
| `npm run build` | Build all workspaces |
| `npm run start -w server` | Run production API |
| `npm run seed:admin` | Create an admin user |
| `npm run seed:demo` | Seed demo data + write `TEST_CREDENTIALS.local.md` |
| `npm run deploy:netlify` | Build client and deploy to Netlify (CLI) |
| `npm run lint` | Lint client and server |
