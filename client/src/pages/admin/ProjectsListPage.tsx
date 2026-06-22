import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, FolderKanban } from 'lucide-react';
import { api } from '@/lib/api';
import type { Project, Client } from '@clientspace/shared';
import { ProjectCreateSheet } from '@/components/app/admin-entity-sheets';
import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import { EmptyState } from '@/components/app/empty-state';
import { PageSkeleton } from '@/components/app/loading';
import { Panel } from '@/components/app/panel';
import { QueryError } from '@/components/app/query-error';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ProjectWithClient = Project & { clients: Pick<Client, 'id' | 'name' | 'company'> };

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const createOpen = searchParams.get('create') === '1';

  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api<ProjectWithClient[]>('/projects'),
  });

  const setCreateOpen = (open: boolean) => {
    if (open) setSearchParams({ create: '1' });
    else setSearchParams({});
  };

  return (
    <div className="page-stack">
      <PageHeader title="Projects" description="All active client projects">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> New project
        </Button>
      </PageHeader>

      {isLoading ? (
        <PageSkeleton />
      ) : isError ? (
        <QueryError message="Could not load projects. Refresh to try again." />
      ) : !projects?.length ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects"
          message="Create a project and assign it to a client."
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              Create project
            </Button>
          }
        />
      ) : (
        <Panel
          title={`${projects.length} project${projects.length === 1 ? '' : 's'}`}
          variant="inset"
          bodyClassName="overflow-hidden p-0"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead className="hidden sm:table-cell">Client</TableHead>
                <TableHead className="hidden md:table-cell">Target</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      to={`/projects/${p.id}`}
                      className="rounded-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {p.title}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {p.clients?.name}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {p.target_date ? new Date(p.target_date).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      )}

      <ProjectCreateSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(projectId) => navigate(`/projects/${projectId}`)}
      />
    </div>
  );
}
