# ClientSpace

A dual-role client portal for freelancers and agencies. Admins manage clients, projects, tasks, and files. Clients get a clean view of their work.

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Query
- **Backend:** Node.js, Express, TypeScript
- **Database / Auth / Storage:** Supabase (PostgreSQL, Auth, Storage)

## Docs

- [PRODUCT.md](./PRODUCT.md) — product context
- [DESIGN.md](./DESIGN.md) — design system

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
cd server && npx tsx scripts/seed-admin.ts admin@example.com "Admin User" "yourpassword"

# Start dev servers (client :5173, API :3001)
npm run dev
```

### Health check

```bash
curl http://localhost:3001/health
```

## Deploy

### Frontend (Netlify)

1. Connect this repo in [Netlify](https://app.netlify.com) — build settings are in `netlify.toml`.
2. Set **Site environment variables** (Site settings → Environment variables):

   | Variable | Example |
   |----------|---------|
   | `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
   | `VITE_API_URL` | Your Render API URL (e.g. `https://clientspace-api.onrender.com`) |

3. In Supabase → Authentication → URL configuration, add your Netlify URL to **Site URL** and **Redirect URLs**.

### API (Render)

1. In [Render](https://dashboard.render.com), create a **Blueprint** from this repo (`render.yaml`) or a **Web Service** manually:
   - **Build command:** `npm ci && npm run build -w server`
   - **Start command:** `npm run start -w server`
   - **Health check path:** `/health`
2. Set environment variables from `server/.env.example`:
   - `CORS_ORIGIN` → your Netlify URL (`https://clientspace-app.netlify.app`)
   - `APP_URL` → same Netlify URL
   - Supabase keys, `RESEND_API_KEY`, `EMAIL_FROM`
3. Copy the Render service URL into Netlify `VITE_API_URL`, then redeploy the frontend.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client + server concurrently |
| `npm run build` | Build all workspaces |
| `npm run start -w server` | Run production API |
