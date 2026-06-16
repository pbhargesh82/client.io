#!/usr/bin/env node
/**
 * Bootstrap the first admin user.
 * Usage: npx tsx scripts/seed-admin.ts admin@example.com "Admin Name" "password123"
 */
import '../src/load-env.js';
import { createClient } from '@supabase/supabase-js';

const [email, name, password] = process.argv.slice(2);

if (!email || !name || !password) {
  console.error('Usage: npx tsx scripts/seed-admin.ts <email> <name> <password>');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('your-') || serviceRoleKey.includes('your-')) {
  console.error('Missing Supabase config in server/.env');
  console.error('');
  console.error('Option A — local: start Docker, then run:');
  console.error('  supabase start');
  console.error('  supabase status   # copy URL + keys into server/.env and client/.env');
  console.error('');
  console.error('Option B — cloud: create a project at https://supabase.com');
  console.error('  Settings → API → copy URL, anon key, service_role key into .env files');
  console.error('');
  console.error('Then run migrations: supabase db push');
  process.exit(1);
}

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (authError || !authUser.user) {
  console.error('Auth error:', authError?.message);
  process.exit(1);
}

const { error: userError } = await supabase.from('users').insert({
  id: authUser.user.id,
  email,
  role: 'admin',
  name,
});

if (userError) {
  console.error('User insert error:', userError.message);
  await supabase.auth.admin.deleteUser(authUser.user.id);
  process.exit(1);
}

console.log(`Admin created: ${email} (${authUser.user.id})`);
