import '../load-env.js';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase config. Copy server/.env.example to server/.env and set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.'
  );
}

const supabaseOptions = {
  auth: { autoRefreshToken: false, persistSession: false },
  // Node < 22 has no global WebSocket; Supabase realtime requires a transport.
  realtime: { transport: ws as unknown as typeof WebSocket },
};

export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceKey,
  supabaseOptions
);

export function createUserClient(accessToken: string) {
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    ...supabaseOptions,
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export const STORAGE_BUCKET = 'project-files';
