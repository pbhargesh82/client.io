import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticate, requireAdmin, async (_req, res) => {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const today = now.toISOString().split('T')[0];
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  const [clientsRes, projectsRes, dueRes, overdueRes] = await Promise.all([
    supabaseAdmin.from('clients').select('id', { count: 'exact', head: true }).eq('active', true),
    supabaseAdmin.from('projects').select('id', { count: 'exact', head: true }).eq('archived', false),
    supabaseAdmin
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'Done')
      .gte('due_date', today)
      .lte('due_date', weekEndStr),
    supabaseAdmin
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'Done')
      .lt('due_date', today)
      .not('due_date', 'is', null),
  ]);

  res.json({
    active_clients: clientsRes.count ?? 0,
    active_projects: projectsRes.count ?? 0,
    tasks_due_this_week: dueRes.count ?? 0,
    overdue_tasks: overdueRes.count ?? 0,
  });
});

router.get('/activity', authenticate, requireAdmin, async (_req, res) => {
  const activities: Array<{
    id: string;
    type: string;
    description: string;
    project_id: string;
    project_title: string;
    created_at: string;
  }> = [];

  const { data: taskUpdates } = await supabaseAdmin
    .from('tasks')
    .select('id, title, updated_at, project_id, projects(title)')
    .order('updated_at', { ascending: false })
    .limit(10);

  for (const t of taskUpdates ?? []) {
    const project = t.projects as unknown as { title: string } | null;
    activities.push({
      id: `task-${t.id}`,
      type: 'task_updated',
      description: `Task "${t.title}" was updated`,
      project_id: t.project_id,
      project_title: project?.title ?? 'Unknown',
      created_at: t.updated_at,
    });
  }

  const { data: fileUploads } = await supabaseAdmin
    .from('files')
    .select('id, name, created_at, project_id, projects(title)')
    .order('created_at', { ascending: false })
    .limit(10);

  for (const f of fileUploads ?? []) {
    const project = f.projects as unknown as { title: string } | null;
    activities.push({
      id: `file-${f.id}`,
      type: 'file_uploaded',
      description: `File "${f.name}" was uploaded`,
      project_id: f.project_id,
      project_title: project?.title ?? 'Unknown',
      created_at: f.created_at,
    });
  }

  const { data: newComments } = await supabaseAdmin
    .from('comments')
    .select('id, created_at, task_id, tasks(project_id, title, projects(title))')
    .order('created_at', { ascending: false })
    .limit(10);

  for (const c of newComments ?? []) {
    const task = c.tasks as unknown as {
      project_id: string;
      title: string;
      projects: { title: string } | null;
    } | null;
    activities.push({
      id: `comment-${c.id}`,
      type: 'comment_added',
      description: `Comment added on task "${task?.title ?? 'Unknown'}"`,
      project_id: task?.project_id ?? '',
      project_title: task?.projects?.title ?? 'Unknown',
      created_at: c.created_at,
    });
  }

  activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(activities.slice(0, 10));
});

export default router;
