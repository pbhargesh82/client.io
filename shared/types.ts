export type UserRole = 'admin' | 'client';

export type ProjectStatus = 'Planning' | 'In Progress' | 'Review' | 'Done';

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string;
  user_id: string;
  active: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  client_id: string;
  status: ProjectStatus;
  start_date: string | null;
  target_date: string | null;
  archived: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  body: string;
  created_at: string;
  user?: Pick<User, 'name' | 'role'>;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  name: string;
  size_bytes: number;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
  download_url?: string;
}

export interface DashboardStats {
  active_clients: number;
  active_projects: number;
  tasks_due_this_week: number;
  overdue_tasks: number;
}

export interface ActivityItem {
  id: string;
  type: 'task_updated' | 'file_uploaded' | 'comment_added';
  description: string;
  project_id: string;
  project_title: string;
  created_at: string;
}

export interface ClientDashboard {
  projects: Project[];
  upcoming_tasks: (Task & { project_title: string })[];
  recent_files: (ProjectFile & { project_title: string })[];
}

export interface ClientWithProjects extends Client {
  projects?: Project[];
}

export interface ProjectDetail extends Project {
  client?: Client;
  tasks?: Task[];
  files?: ProjectFile[];
}
