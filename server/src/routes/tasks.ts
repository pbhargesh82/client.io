import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;

router.get('/:projectId/tasks', authenticate, requireAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('project_id', req.params.projectId)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  res.json(data);
});

router.post('/:projectId/tasks', authenticate, requireAdmin, async (req, res) => {
  const { title, description, status, priority, start_date, due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  if (priority && !TASK_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority' });
  }

  const { data: existing } = await supabaseAdmin
    .from('tasks')
    .select('sort_order')
    .eq('project_id', req.params.projectId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const sort_order = existing?.length ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .insert({
      project_id: req.params.projectId,
      title,
      description: description || null,
      status: status || 'To Do',
      priority: priority || 'Medium',
      start_date: start_date || null,
      due_date: due_date || null,
      sort_order,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.patch('/reorder', authenticate, requireAdmin, async (req, res) => {
  const { items } = req.body as { items: { id: string; sort_order: number }[] };
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'items array required' });
  }

  await Promise.all(
    items.map((item) =>
      supabaseAdmin.from('tasks').update({ sort_order: item.sort_order }).eq('id', item.id)
    )
  );

  res.json({ success: true });
});

router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const { title, description, status, priority, start_date, due_date, sort_order } = req.body;

  if (priority !== undefined && !TASK_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority' });
  }

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (status !== undefined) updates.status = status;
  if (priority !== undefined) updates.priority = priority;
  if (start_date !== undefined) updates.start_date = start_date;
  if (due_date !== undefined) updates.due_date = due_date;
  if (sort_order !== undefined) updates.sort_order = sort_order;

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
