# ClientSpace

A dual-role client portal for freelancers and agencies. Admins manage clients, projects, tasks, and files. Clients get a clean view of their work.

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Query
- **Backend:** Node.js, Express, TypeScript
- **Database / Auth / Storage:** Supabase (PostgreSQL, Auth, Storage)

## Docs

- [CLIENT_PORTAL_MVP.md](./CLIENT_PORTAL_MVP.md) — product spec
- [CLIENT_PORTAL_PLAN.md](./CLIENT_PORTAL_PLAN.md) — implementation plan & task list

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

- **Frontend:** Netlify (`netlify.toml` included)
- **API:** Railway (`railway.json` included) or Render
- Set env vars from `.env.example` files in each environment
- Configure Supabase Auth redirect URLs for production domains

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client + server concurrently |
| `npm run build` | Build all workspaces |
| `npm run start -w server` | Run production API |
