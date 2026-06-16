import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { clientCanAccessTask, isAdmin } from '../lib/authorization.js';

const router = Router();

router.get('/:taskId/comments', authenticate, async (req, res) => {
  const taskId = String(req.params.taskId);
  if (!isAdmin(req)) {
    const allowed = await clientCanAccessTask(req.user!.id, taskId);
    if (!allowed) return res.status(403).json({ error: 'Access denied' });
  }

  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('*, users(name, role)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  const comments = (data ?? []).map((c) => ({
    id: c.id,
    task_id: c.task_id,
    user_id: c.user_id,
    body: c.body,
    created_at: c.created_at,
    user: c.users as { name: string; role: string },
  }));

  res.json(comments);
});

router.post('/:taskId/comments', authenticate, async (req, res) => {
  const taskId = String(req.params.taskId);
  if (!isAdmin(req)) {
    const allowed = await clientCanAccessTask(req.user!.id, taskId);
    if (!allowed) return res.status(403).json({ error: 'Access denied' });
  }

  const { body } = req.body;
  if (!body?.trim()) return res.status(400).json({ error: 'Comment body is required' });

  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert({
      task_id: taskId,
      user_id: req.user!.id,
      body: body.trim(),
    })
    .select('*, users(name, role)')
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({
    id: data.id,
    task_id: data.task_id,
    user_id: data.user_id,
    body: data.body,
    created_at: data.created_at,
    user: data.users as { name: string; role: string },
  });
});

export default router;
