import { Router } from 'express';
import { supabaseAdmin, STORAGE_BUCKET } from '../lib/supabase.js';
import { authenticate, requireClient } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticate, requireClient, async (req, res) => {
  const { data: clientRow } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('user_id', req.user!.id)
    .eq('active', true)
    .single();

  if (!clientRow) {
    return res.json({ projects: [], upcoming_tasks: [], recent_files: [] });
  }

  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('client_id', clientRow.id)
    .eq('archived', false)
    .order('created_at', { ascending: false });

  const projectIds = (projects ?? []).map((p) => p.id);
  const projectMap = new Map((projects ?? []).map((p) => [p.id, p.title]));

  let upcoming_tasks: Array<Record<string, unknown>> = [];
  let recent_files: Array<Record<string, unknown>> = [];

  if (projectIds.length > 0) {
    const { data: tasks } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .in('project_id', projectIds)
      .neq('status', 'Done')
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(10);

    upcoming_tasks = (tasks ?? []).map((t) => ({
      ...t,
      project_title: projectMap.get(t.project_id) ?? 'Unknown',
    }));

    const { data: files } = await supabaseAdmin
      .from('files')
      .select('*')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false })
      .limit(10);

    recent_files = (files ?? []).map((f) => ({
      ...f,
      project_title: projectMap.get(f.project_id) ?? 'Unknown',
    }));
  }

  res.json({ projects: projects ?? [], upcoming_tasks, recent_files });
});

router.get('/projects/:id', authenticate, requireClient, async (req, res) => {
  const { data: clientRow } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('user_id', req.user!.id)
    .eq('active', true)
    .single();

  if (!clientRow) {
    return res.status(403).json({ error: 'Client profile not found' });
  }

  const { data: project, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', req.params.id)
    .eq('client_id', clientRow.id)
    .eq('archived', false)
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

  const filesWithUrls = await Promise.all(
    (filesRes.data ?? []).map(async (file) => {
      const { data: signed } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(file.storage_path, 3600);
      return { ...file, download_url: signed?.signedUrl };
    })
  );

  res.json({
    ...project,
    tasks: tasksRes.data ?? [],
    files: filesWithUrls,
  });
});

export default router;
