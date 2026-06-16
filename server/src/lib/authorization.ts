import type { Request } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

export async function clientCanAccessTask(userId: string, taskId: string): Promise<boolean> {
  const { data: clientRow } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .eq('active', true)
    .single();

  if (!clientRow) return false;

  const { data: task } = await supabaseAdmin
    .from('tasks')
    .select('project_id, projects!inner(client_id, archived)')
    .eq('id', taskId)
    .single();

  if (!task) return false;

  const project = task.projects as unknown as { client_id: string; archived: boolean };
  return project.client_id === clientRow.id && !project.archived;
}

export async function clientCanAccessProject(userId: string, projectId: string): Promise<boolean> {
  const { data: clientRow } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .eq('active', true)
    .single();

  if (!clientRow) return false;

  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('client_id', clientRow.id)
    .eq('archived', false)
    .single();

  return !!project;
}

export function isAdmin(req: Request): boolean {
  return req.user?.role === 'admin';
}
