import { Router } from 'express';
import { supabaseAdmin, STORAGE_BUCKET } from '../lib/supabase.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

async function filesWithSignedUrls(files: Array<Record<string, unknown>>) {
  return Promise.all(
    files.map(async (file) => {
      const { data: signed } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(file.storage_path as string, 3600);
      return { ...file, download_url: signed?.signedUrl };
    })
  );
}

router.get('/', authenticate, requireAdmin, async (req, res) => {
  const archived = req.query.archived === 'true';
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*, clients(id, name, company)')
    .eq('archived', archived)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  res.json(data);
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { title, description, client_id, status, start_date, target_date } = req.body;
  if (!title || !client_id) {
    return res.status(400).json({ error: 'Title and client_id are required' });
  }

  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert({
      title,
      description: description || null,
      client_id,
      status: status || 'Planning',
      start_date: start_date || null,
      target_date: target_date || null,
    })
    .select('*, clients(id, name, company)')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  const { data: project, error } = await supabaseAdmin
    .from('projects')
    .select('*, clients(id, name, company, email)')
    .eq('id', req.params.id)
    .single();

  if (error || !project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const [tasksRes, filesRes] = await Promise.all([
    supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('project_id', req.params.id)
      .order('sort_order', { ascending: true }),
    supabaseAdmin
      .from('files')
      .select('*')
      .eq('project_id', req.params.id)
      .order('created_at', { ascending: false }),
  ]);

  res.json({
    ...project,
    tasks: tasksRes.data ?? [],
    files: await filesWithSignedUrls(filesRes.data ?? []),
  });
});

router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const { title, description, client_id, status, start_date, target_date } = req.body;
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (client_id !== undefined) updates.client_id = client_id;
  if (status !== undefined) updates.status = status;
  if (start_date !== undefined) updates.start_date = start_date;
  if (target_date !== undefined) updates.target_date = target_date;

  const { data, error } = await supabaseAdmin
    .from('projects')
    .update(updates)
    .eq('id', req.params.id)
    .select('*, clients(id, name, company)')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.patch('/:id/archive', authenticate, requireAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .update({ archived: true })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
