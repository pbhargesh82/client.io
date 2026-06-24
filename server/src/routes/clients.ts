import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, requireAdmin, async (req, res) => {
  const activeOnly = req.query.active !== 'false';

  let query = supabaseAdmin.from('clients').select('*').order('created_at', { ascending: false });
  if (activeOnly) query = query.eq('active', true);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  res.json(data);
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, company, email, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const tempPassword = password || `Temp${Math.random().toString(36).slice(2, 10)}!`;

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    return res.status(400).json({ error: authError?.message ?? 'Failed to create auth user' });
  }

  const { error: userError } = await supabaseAdmin.from('users').insert({
    id: authUser.user.id,
    email,
    role: 'client',
    name,
  });

  if (userError) {
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    return res.status(400).json({ error: userError.message });
  }

  const { data: client, error: clientError } = await supabaseAdmin
    .from('clients')
    .insert({ name, company: company || null, email, user_id: authUser.user.id })
    .select()
    .single();

  if (clientError) {
    return res.status(400).json({ error: clientError.message });
  }

  res.status(201).json({ ...client, temp_password: password ? undefined : tempPassword });
});

router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  const { data: client, error } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error || !client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('client_id', req.params.id)
    .order('created_at', { ascending: false });

  res.json({ ...client, projects: projects ?? [] });
});

router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, company, email, active } = req.body;
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (company !== undefined) updates.company = company;
  if (email !== undefined) updates.email = email;
  if (active !== undefined) updates.active = Boolean(active);

  const { data, error } = await supabaseAdmin
    .from('clients')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.patch('/:id/deactivate', authenticate, requireAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .update({ active: false })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
