import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Project, Client } from '@clientspace/shared';
import { Button, Card, EmptyState, LoadingSkeleton, PageHeader, StatusBadge } from '../../components/ui';

type ProjectWithClient = Project & { clients: Pick<Client, 'id' | 'name' | 'company'> };

export default function ProjectsListPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api<ProjectWithClient[]>('/projects'),
  });

  return (
    <div>
      <PageHeader title="Projects">
        <Link to="/projects/new">
          <Button>New Project</Button>
        </Link>
      </PageHeader>

      {isLoading ? (
        <LoadingSkeleton />
      ) : !projects?.length ? (
        <EmptyState message="No projects yet. Create one to get started." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`}>
              <Card className="h-full transition hover:border-indigo-200 hover:shadow-md">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-medium text-slate-900">{p.title}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-sm text-slate-500">{p.clients?.name}</p>
                {p.target_date && (
                  <p className="mt-2 text-xs text-slate-400">
                    Target: {new Date(p.target_date).toLocaleDateString()}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
