#!/usr/bin/env node
/**
 * Reset client/project demo data and seed realistic sample records.
 * Usage: npm run seed:demo
 */
import '../src/load-env.js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '../..');
const credsPath = join(root, 'TEST_CREDENTIALS.local.md');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase config in server/.env');
  process.exit(1);
}

const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CLIENTS = [
  {
    name: 'Sarah Chen',
    company: 'Meridian Health Partners',
    email: 'sarah.chen@meridianhealth.com',
    password: 'Meridian2026!',
  },
  {
    name: 'James Okonkwo',
    company: 'Northline Roasters',
    email: 'james@northlineroasters.co',
    password: 'Northline2026!',
  },
] as const;

const PROJECTS = [
  {
    clientEmail: 'sarah.chen@meridianhealth.com',
    title: 'Brand identity refresh',
    description: 'Logo system, color palette, and brand guidelines for the 2026 rebrand.',
    status: 'In Progress' as const,
    start_date: '2026-03-01',
    target_date: '2026-05-15',
    tasks: [
      {
        title: 'Finalize logo lockups',
        description: 'Export primary, secondary, and favicon variants for print and digital.',
        status: 'In Progress' as const,
        priority: 'High' as const,
        start_date: daysFromNow(-14),
        due_date: daysFromNow(4),
      },
      {
        title: 'Homepage wireframes',
        description: 'Desktop and mobile wireframes for marketing homepage v2.',
        status: 'Done' as const,
        priority: 'Medium' as const,
        start_date: daysFromNow(-28),
        due_date: daysFromNow(-7),
      },
      {
        title: 'Brand guidelines PDF',
        description: 'Compile typography, color, and logo usage into client-facing PDF.',
        status: 'To Do' as const,
        priority: 'Urgent' as const,
        start_date: daysFromNow(-3),
        due_date: daysFromNow(-2),
      },
    ],
  },
  {
    clientEmail: 'sarah.chen@meridianhealth.com',
    title: 'Patient intake portal',
    description: 'Secure web forms and document upload for new patient onboarding.',
    status: 'Review' as const,
    start_date: '2026-01-10',
    target_date: '2026-04-30',
    tasks: [
      {
        title: 'Accessibility audit (WCAG AA)',
        description: 'Screen reader pass, contrast check, and keyboard navigation review.',
        status: 'In Progress' as const,
        priority: 'High' as const,
        start_date: daysFromNow(-5),
        due_date: daysFromNow(6),
      },
      {
        title: 'Stakeholder review session',
        description: 'Walkthrough with clinical ops team; collect sign-off notes.',
        status: 'To Do' as const,
        priority: 'Medium' as const,
        start_date: daysFromNow(3),
        due_date: daysFromNow(10),
      },
    ],
  },
  {
    clientEmail: 'james@northlineroasters.co',
    title: 'Shopify storefront rebuild',
    description: 'New theme, subscription flow, and wholesale ordering for Northline Roasters.',
    status: 'Planning' as const,
    start_date: '2026-04-01',
    target_date: '2026-07-01',
    tasks: [
      {
        title: 'Product photography brief',
        description: 'Shot list for 12 SKUs including lifestyle and pack shots.',
        status: 'To Do' as const,
        priority: 'Medium' as const,
        start_date: daysFromNow(2),
        due_date: daysFromNow(12),
      },
      {
        title: 'Subscription pricing model',
        description: 'Define tiers, shipping rules, and wholesale discount structure.',
        status: 'To Do' as const,
        priority: 'Low' as const,
        start_date: daysFromNow(5),
        due_date: daysFromNow(18),
      },
    ],
  },
];

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

async function clearDemoData() {
  console.log('Clearing existing client data…');

  await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('files').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { data: clientUsers } = await supabase.from('users').select('id, email').eq('role', 'client');

  for (const user of clientUsers ?? []) {
    await supabase.from('users').delete().eq('id', user.id);
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) console.warn(`  Could not delete auth user ${user.email}: ${error.message}`);
  }

  // Remove leftover example.com client accounts if any
  const { data: exampleUsers } = await supabase
    .from('users')
    .select('id, email')
    .eq('role', 'client')
    .like('email', '%@example.com');

  for (const user of exampleUsers ?? []) {
    await supabase.from('users').delete().eq('id', user.id);
    await supabase.auth.admin.deleteUser(user.id);
  }

  console.log('  Done.');
}

async function ensureAdmin(): Promise<string> {
  const { data: admin } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('role', 'admin')
    .limit(1)
    .single();

  if (admin) {
    await supabase.from('users').update({ name: 'Priya Sharma' }).eq('id', admin.id);
    return admin.id;
  }

  const email = 'priya@northline.studio';
  const password = 'StudioAdmin2026!';
  const { data: authUser, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !authUser.user) throw new Error(error?.message ?? 'Failed to create admin');

  await supabase.from('users').insert({
    id: authUser.user.id,
    email,
    role: 'admin',
    name: 'Priya Sharma',
  });

  return authUser.user.id;
}

async function createClient(client: (typeof CLIENTS)[number]) {
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: client.email,
    password: client.password,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    throw new Error(`Client ${client.email}: ${authError?.message}`);
  }

  const { error: userError } = await supabase.from('users').insert({
    id: authUser.user.id,
    email: client.email,
    role: 'client',
    name: client.name,
  });

  if (userError) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw new Error(userError.message);
  }

  const { data: row, error: clientError } = await supabase
    .from('clients')
    .insert({
      name: client.name,
      company: client.company,
      email: client.email,
      user_id: authUser.user.id,
    })
    .select()
    .single();

  if (clientError) throw new Error(clientError.message);
  return row;
}

async function main() {
  await clearDemoData();
  const adminId = await ensureAdmin();

  const clientIds = new Map<string, string>();

  console.log('Creating clients…');
  for (const c of CLIENTS) {
    const row = await createClient(c);
    clientIds.set(c.email, row.id);
    console.log(`  ${c.name} (${c.company})`);
  }

  console.log('Creating projects and tasks…');
  for (const p of PROJECTS) {
    const clientId = clientIds.get(p.clientEmail);
    if (!clientId) throw new Error(`Missing client for ${p.clientEmail}`);

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        title: p.title,
        description: p.description,
        client_id: clientId,
        status: p.status,
        start_date: p.start_date,
        target_date: p.target_date,
      })
      .select()
      .single();

    if (error || !project) throw new Error(error?.message ?? 'Project insert failed');
    console.log(`  ${p.title}`);

    for (let i = 0; i < p.tasks.length; i++) {
      const t = p.tasks[i];
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          project_id: project.id,
          title: t.title,
          description: t.description ?? null,
          status: t.status,
          priority: t.priority ?? 'Medium',
          start_date: t.start_date ?? null,
          due_date: t.due_date,
          sort_order: i,
        })
        .select()
        .single();

      if (taskError) throw new Error(taskError.message);

      if (task && t.title === 'Finalize logo lockups') {
        await supabase.from('comments').insert({
          task_id: task.id,
          user_id: adminId,
          body: 'Sarah approved the secondary mark — ready for print specs.',
        });
      }
    }
  }

  const { data: adminRow } = await supabase
    .from('users')
    .select('email')
    .eq('role', 'admin')
    .limit(1)
    .single();

  const adminEmail = adminRow?.email ?? 'priya@northline.studio';
  const adminPassword =
    adminEmail === 'priya@northline.studio'
      ? 'StudioAdmin2026!'
      : adminEmail === 'admin@example.com'
        ? '123'
        : '(password from npm run seed:admin)';

  const creds = `# ClientSpace — local test credentials

> **Local only.** This file is gitignored. Do not commit or share.

## Admin portal (\`/login\`)

| Field | Value |
|-------|-------|
| Email | \`${adminEmail}\` |
| Password | \`${adminPassword}\` |

## Client portals (\`/client/login\`)

### Sarah Chen — Meridian Health Partners

| Field | Value |
|-------|-------|
| Email | \`sarah.chen@meridianhealth.com\` |
| Password | \`Meridian2026!\` |

Projects: Brand identity refresh, Patient intake portal

### James Okonkwo — Northline Roasters

| Field | Value |
|-------|-------|
| Email | \`james@northlineroasters.co\` |
| Password | \`Northline2026!\` |

Projects: Shopify storefront rebuild

---

Seeded: ${new Date().toISOString()}
Re-run: \`npm run seed:demo\`
`;

  writeFileSync(credsPath, creds, 'utf8');

  console.log('');
  console.log(`Demo data ready. Credentials written to TEST_CREDENTIALS.local.md`);
  console.log(`  Admin: ${adminEmail}`);
  console.log(`  Clients: ${CLIENTS.map((c) => c.email).join(', ')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
