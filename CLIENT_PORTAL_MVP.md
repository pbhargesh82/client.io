# Client Portal — MVP

> Phase 1 ships a working client portal with no invoicing. Phase 2 adds AI scope generation on top of the same data model.

---

## What it is

A lightweight project management portal with two distinct views: an admin who manages everything, and a client who can only see their own projects. A freelancer or small agency uses the admin side to create clients and projects, track task progress, and share files. The client gets a clean read-only (and light-interaction) view into what's being built for them.

The product is intentionally scoped small. No invoicing, no payments, no team seats, no notifications system. Those are Phase 2 candidates. The goal for Phase 1 is a fully working, well-designed, live demo that is immediately recognisable as a real tool someone would pay for.

---

## Users

**Admin (you — the freelancer or agency):**
- Creates and manages clients
- Creates projects and assigns them to clients
- Breaks projects into tasks, sets statuses and deadlines
- Uploads files to projects
- Shares a client portal link

**Client (your customer):**
- Logs in via email + password or magic link
- Sees only their own projects
- Views task list and current statuses
- Downloads files the admin uploaded
- Leaves comments on tasks

---

## Core features (Phase 1)

### Auth
- Admin login (single admin — no team management in MVP)
- Client login via Supabase Auth (email + password or magic link)
- Row-level security: clients can only read their own data
- Protected routes on the frontend (admin routes vs client routes)

### Client management
- Create a client (name, company, email)
- Edit client details
- View all projects belonging to a client
- Deactivate a client (soft delete — hides them from active list)

### Project management
- Create a project (title, description, client, start date, target date, status)
- Project statuses: Planning → In Progress → Review → Done
- Edit project details
- Archive a project

### Task management
- Add tasks to a project (title, description, status, optional due date)
- Task statuses: To Do → In Progress → Done
- Reorder tasks (drag-and-drop or manual order field)
- Mark a task complete

### Comments
- Admin and client can both comment on any task in their shared project
- Comments are timestamped and attributed (Admin or client name)
- Simple flat list — no threading in MVP

### File sharing
- Admin uploads files to a project (stored in Supabase Storage)
- Files are listed on the project page with name, size, upload date
- Admin and client can download files
- Admin can delete a file

### Admin dashboard
- Overview: count of active clients, active projects, tasks due this week, overdue tasks
- Recent activity feed: last 10 changes across all projects (task updated, file uploaded, comment added)
- Quick-link to each active project

### Client dashboard (client view)
- List of their projects with status chips
- Active tasks across all their projects, sorted by due date
- Recent files uploaded

---

## Out of scope (Phase 1)

- Invoicing and payment tracking
- Email notifications or in-app alerts
- Team seats (multiple admins)
- Time tracking
- Recurring tasks
- Public-facing status page
- White-labelling / custom domain per client
- Mobile app

---

## Phase 2 additions (planned, not in MVP)

### AI scope generation
- On project creation (or at any point), admin pastes a brief description of what needs to be built
- A "Generate scope" button calls the OpenAI API with the description
- OpenAI returns a structured list of suggested tasks with titles, descriptions, and estimated effort
- Admin reviews the suggestion in a modal, selects which tasks to import, confirms
- Selected tasks are added to the project task list
- No auto-import — admin always reviews before anything lands in the project

This requires no schema changes from Phase 1. It is purely a new API route (`POST /ai/scope`) and a new UI modal.

---

## Data model (Phase 1)

```
users
  id, email, role (admin | client), name, created_at

clients
  id, name, company, email, user_id (FK → users), active, created_at

projects
  id, title, description, client_id (FK → clients), status, start_date, target_date, archived, created_at

tasks
  id, project_id (FK → projects), title, description, status, due_date, sort_order, created_at, updated_at

comments
  id, task_id (FK → tasks), user_id (FK → users), body, created_at

files
  id, project_id (FK → projects), name, size_bytes, storage_path, uploaded_by (FK → users), created_at
```

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React (Vite) | Fills the React gap; fast dev server; no SSR overhead needed |
| Styling | Tailwind CSS | Rapid UI, consistent spacing |
| State / data fetching | TanStack Query | Caching, loading states, optimistic updates |
| Backend | Node.js + Express | Familiar, straightforward REST API |
| Database | PostgreSQL (via Supabase) | Relational data model; RLS for client isolation |
| Auth | Supabase Auth | Magic links + email/password; RLS ties auth to data access |
| File storage | Supabase Storage | Integrated with RLS; simple upload/download API |
| Hosting | Netlify (frontend) + Railway or Render (Node API) | Free tier, fast deploys |

---

## Pages / routes

### Admin
```
/login                    Auth
/dashboard                Overview stats + activity feed
/clients                  Client list
/clients/new              Create client
/clients/:id              Client detail + project list
/projects                 All projects list
/projects/new             Create project
/projects/:id             Project detail (tasks, files, comments)
/projects/:id/tasks/new   Add task (modal or inline)
```

### Client (separate layout, same app)
```
/client/login             Client auth
/client/dashboard         Their projects + upcoming tasks
/client/projects/:id      Project detail (read + comment)
```

---

## What this proves on the portfolio

- Multi-role auth with row-level security (admin vs client, data isolation)
- Relational data model across 6 tables with foreign key constraints
- Full CRUD across clients, projects, tasks — not just one resource
- File upload and storage with access control
- Clean two-sided product with separate layouts and UX flows per role
- React frontend with real async state management (loading, error, optimistic)
- REST API on Node.js with authenticated routes (not just Supabase client-side queries)
- Phase 2 AI integration is additive — can be shown as "v1.1" update on the portfolio card

---

## Portfolio card copy (draft)

**Name:** ClientSpace  
**Description:** Project management portal with separate admin and client views. Freelancers manage projects, tasks, and file sharing — clients get a clean live view of their work. React, Node.js, and PostgreSQL with Supabase Auth and row-level security. Phase 2 adds AI-powered scope generation via OpenAI.  
**Stack tags:** React · Node.js · PostgreSQL · Supabase · OpenAI API

---

## Build order

1. Repo setup — Vite + React, Node + Express, Supabase project, folder structure
2. Auth — Supabase Auth, protected routes, role detection on login
3. Client CRUD — create, list, edit, deactivate
4. Project CRUD — create, assign to client, statuses, list views
5. Task management — add, reorder, status updates
6. File upload/download — Supabase Storage integration
7. Comments — on tasks, shared between admin and client
8. Admin dashboard — stats, activity feed
9. Client dashboard — project list, task list, file list
10. Polish — empty states, loading skeletons, error handling, mobile layout
11. Deploy — Netlify + Railway/Render, env vars, Supabase prod project
12. Screenshots + portfolio card update
