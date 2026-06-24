import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@/components/ui/icon';
import { api } from '@/lib/api';
import type { Client, ClientWithProjects, Project, ProjectDetail, ProjectStatus } from '@clientspace/shared';
import { StatusBadge } from '@/components/app/status-badge';
import { ListLinkRow } from '@/components/app/list-link-row';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const PROJECT_STATUSES: ProjectStatus[] = ['Planning', 'In Progress', 'Review', 'Done'];

export type ClientCreateResult = {
  id: string;
  email: string;
  temp_password?: string;
};

export function ClientCreateSheet({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (result: ClientCreateResult) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const reset = () => {
    setName('');
    setCompany('');
    setEmail('');
    setPassword('');
    setError('');
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const mutation = useMutation({
    mutationFn: () =>
      api<{ id: string; temp_password?: string }>('/clients', {
        method: 'POST',
        body: JSON.stringify({
          name,
          company: company || undefined,
          email,
          password: password || undefined,
        }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onCreated({ id: data.id, email, temp_password: data.temp_password });
      onOpenChange(false);
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to create client'),
  });

  const canSubmit = name.trim() && email.trim() && !mutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b border-border/80 px-5 py-4 text-left">
          <SheetTitle className="pr-8">New client</SheetTitle>
          <SheetDescription>Create a client account with portal access</SheetDescription>
        </SheetHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) mutation.mutate();
          }}
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="create-client-name">Name</Label>
              <Input
                id="create-client-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-client-company">Company</Label>
              <Input
                id="create-client-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-client-email">Email</Label>
              <Input
                id="create-client-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-client-password">
                Password <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="create-client-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Auto-generated if blank"
              />
            </div>
            {error && (
              <p className="text-[13px] text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
          <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border/80 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {mutation.isPending ? (
                <>
                  <Icon name="progress_activity" className="animate-spin text-[16px]" />
                  Creating…
                </>
              ) : (
                'Create client'
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function ClientCredentialsSheet({
  open,
  onOpenChange,
  email,
  password,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  password: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyCredentials = async () => {
    await navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b border-border/80 px-5 py-4 text-left">
          <SheetTitle className="pr-8">Client created</SheetTitle>
          <SheetDescription>Share these portal credentials with your client</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-5 py-5">
          <dl className="space-y-3 text-[13px]">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-0.5 font-mono font-medium">{email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Password</dt>
              <dd className="mt-0.5 font-mono font-medium">{password}</dd>
            </div>
          </dl>
        </div>
        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border/80 px-5 py-4">
          <Button type="button" variant="outline" onClick={copyCredentials}>
            {copied ? <Icon name="check" className="text-[16px]" /> : <Icon name="content_copy" className="text-[16px]" />}
            {copied ? 'Copied' : 'Copy credentials'}
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function ClientManageSheet({
  clientId,
  open,
  onOpenChange,
}: {
  clientId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const { data: client, isLoading, isError } = useQuery({
    queryKey: ['clients', clientId],
    queryFn: () => api<ClientWithProjects>(`/clients/${clientId}`),
    enabled: open && !!clientId,
  });

  useEffect(() => {
    if (client && open) {
      setName(client.name);
      setCompany(client.company || '');
      setEmail(client.email);
      setActive(client.active);
      setError('');
    }
  }, [client, open]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api(`/clients/${clientId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, company, email, active }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', clientId] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Update failed'),
  });

  const canSave = !!client && name.trim() && email.trim() && !saveMutation.isPending;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="shrink-0 border-b border-border/80 px-5 py-4 text-left">
            <div className="flex items-start justify-between gap-3 pr-8">
              <div className="min-w-0">
                <SheetTitle className="truncate">{client?.name ?? 'Client'}</SheetTitle>
                <SheetDescription className="truncate">{client?.email}</SheetDescription>
              </div>
              {client && <StatusBadge status={active ? 'Active' : 'Inactive'} />}
            </div>
          </SheetHeader>

          {isLoading ? (
            <div className="flex flex-1 items-center justify-center px-5 py-12">
              <Icon name="progress_activity" className="animate-spin text-[24px] text-on-surface-variant" />
            </div>
          ) : isError || !client ? (
            <div className="px-5 py-8 text-center font-body-sm text-body-sm text-on-surface-variant">
              Could not load client. Close and try again.
            </div>
          ) : (
            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={(e) => {
                e.preventDefault();
                if (canSave) saveMutation.mutate();
              }}
            >
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="manage-client-name">Name</Label>
                    <Input
                      id="manage-client-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="manage-client-company">Company</Label>
                    <Input
                      id="manage-client-company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="manage-client-email">Email</Label>
                    <Input
                      id="manage-client-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3">
                    <div className="min-w-0">
                      <Label htmlFor="manage-client-active" className="font-body-sm text-body-sm font-semibold">
                        Portal access
                      </Label>
                      <p className="mt-0.5 font-body-sm text-[13px] text-on-surface-variant">
                        {active
                          ? 'Client can sign in to the portal.'
                          : 'Client cannot sign in until reactivated.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      id="manage-client-active"
                      role="switch"
                      aria-checked={active}
                      aria-label={active ? 'Deactivate portal access' : 'Activate portal access'}
                      onClick={() => setActive((value) => !value)}
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2',
                        active ? 'bg-primary' : 'bg-outline-variant'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block size-5 rounded-full bg-white shadow transition-transform',
                          active ? 'translate-x-[22px]' : 'translate-x-0.5'
                        )}
                      />
                    </button>
                  </div>
                  {error && (
                    <p className="text-[13px] text-destructive" role="alert">
                      {error}
                    </p>
                  )}
                </div>

                <div className="border-t border-outline-variant pt-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="font-body-sm text-body-sm font-semibold text-on-surface">Projects</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCreateProjectOpen(true)}
                      className="gap-1.5"
                    >
                      <Icon name="add" className="text-[16px]" />
                      New project
                    </Button>
                  </div>
                  {!client.projects?.length ? (
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      No projects for this client yet.
                    </p>
                  ) : (
                    <ul className="-mx-2 divide-y divide-outline-variant rounded-lg border border-outline-variant">
                      {client.projects.map((p) => (
                        <li key={p.id}>
                          <ListLinkRow
                            to={`/projects/${p.id}`}
                            title={p.title}
                            subtitle={p.description || undefined}
                            trailing={<StatusBadge status={p.status} />}
                            className="rounded-none"
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border/80 px-5 py-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={saveMutation.isPending}
                >
                  Close
                </Button>
                <Button type="submit" disabled={!canSave}>
                    {saveMutation.isPending ? (
                      <>
                        <Icon name="progress_activity" className="animate-spin text-[16px]" />
                        Saving…
                      </>
                    ) : (
                      'Save changes'
                    )}
                  </Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>

      {client && (
        <ProjectCreateSheet
          open={createProjectOpen}
          onOpenChange={setCreateProjectOpen}
          defaultClientId={client.id}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['clients', client.id] });
          }}
        />
      )}
    </>
  );
}

export function ProjectCreateSheet({
  open,
  onOpenChange,
  defaultClientId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultClientId?: string;
  onCreated?: (projectId: string) => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Planning');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState('');

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api<Client[]>('/clients'),
    enabled: open,
  });

  useEffect(() => {
    if (!open) {
      setTitle('');
      setDescription('');
      setClientId(defaultClientId || '');
      setStatus('Planning');
      setStartDate('');
      setTargetDate('');
      setError('');
    } else if (defaultClientId) {
      setClientId(defaultClientId);
    }
  }, [open, defaultClientId]);

  const mutation = useMutation({
    mutationFn: () =>
      api<{ id: string }>('/projects', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: description || undefined,
          client_id: clientId,
          status,
          start_date: startDate || undefined,
          target_date: targetDate || undefined,
        }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onOpenChange(false);
      if (onCreated) onCreated(data.id);
      else navigate(`/projects/${data.id}`);
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to create project'),
  });

  const canSubmit = title.trim() && clientId && !mutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b border-border/80 px-5 py-4 text-left">
          <SheetTitle className="pr-8">New project</SheetTitle>
          <SheetDescription>Create a project and assign it to a client</SheetDescription>
        </SheetHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) mutation.mutate();
          }}
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="create-project-title">Title</Label>
              <Input id="create-project-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-project-desc">Description</Label>
              <Textarea
                id="create-project-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={(v) => v && setClientId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v as ProjectStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="create-project-start">Start date</Label>
                <Input
                  id="create-project-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-project-target">Target date</Label>
                <Input
                  id="create-project-target"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <p className="text-[13px] text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
          <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border/80 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {mutation.isPending ? (
                <>
                  <Icon name="progress_activity" className="animate-spin text-[16px]" />
                  Creating…
                </>
              ) : (
                'Create project'
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function ProjectEditSheet({
  project,
  open,
  onOpenChange,
}: {
  project: ProjectDetail | Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Planning');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [archived, setArchived] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project && open) {
      setTitle(project.title);
      setDescription(project.description ?? '');
      setStatus(project.status);
      setStartDate(project.start_date || '');
      setTargetDate(project.target_date || '');
      setArchived(project.archived);
      setError('');
    }
  }, [project, open]);

  const mutation = useMutation({
    mutationFn: (updates: Partial<Project>) =>
      api(`/projects/${project!.id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', project!.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onOpenChange(false);
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Update failed'),
  });

  const save = () => {
    if (!project || !title.trim()) return;
    const updates: Partial<Project> = {};
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim() || null;

    if (trimmedTitle !== project.title) updates.title = trimmedTitle;
    if (trimmedDescription !== (project.description ?? null)) updates.description = trimmedDescription;
    if (status !== project.status) updates.status = status;
    if (startDate !== (project.start_date || '')) updates.start_date = startDate || null;
    if (targetDate !== (project.target_date || '')) updates.target_date = targetDate || null;
    if (archived !== project.archived) updates.archived = archived;

    if (Object.keys(updates).length > 0) mutation.mutate(updates);
    else onOpenChange(false);
  };

  const canSave = title.trim().length > 0 && !mutation.isPending;

  if (!project) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md" />
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b border-border/80 px-5 py-4 text-left">
          <SheetTitle className="pr-8">Edit project</SheetTitle>
          <SheetDescription className="truncate">{project.title}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="edit-project-title">Title</Label>
            <Input id="edit-project-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-project-desc">Description</Label>
            <Textarea
              id="edit-project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v as ProjectStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-project-start">Start date</Label>
              <Input
                id="edit-project-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-project-target">Target date</Label>
              <Input
                id="edit-project-target"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3">
            <div className="min-w-0">
              <Label htmlFor="edit-project-archived" className="font-body-sm text-body-sm font-semibold">
                Archived
              </Label>
              <p className="mt-0.5 font-body-sm text-[13px] text-on-surface-variant">
                {archived
                  ? 'Hidden from the client portal and active project lists.'
                  : 'Visible to the client and included in active project lists.'}
              </p>
            </div>
            <button
              type="button"
              id="edit-project-archived"
              role="switch"
              aria-checked={archived}
              aria-label={archived ? 'Unarchive project' : 'Archive project'}
              onClick={() => setArchived((value) => !value)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2',
                archived ? 'bg-primary' : 'bg-outline-variant'
              )}
            >
              <span
                className={cn(
                  'inline-block size-5 rounded-full bg-white shadow transition-transform',
                  archived ? 'translate-x-[22px]' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>
          {error && (
            <p className="text-[13px] text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border/80 px-5 py-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={!canSave}>
            {mutation.isPending ? (
              <>
                <Icon name="progress_activity" className="animate-spin text-[16px]" />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
