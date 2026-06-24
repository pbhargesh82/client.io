import { useQueries } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
import type { Comment, Task } from '@clientspace/shared';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function commentInitials(name?: string | null): string {
  return (
    name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  );
}

export function ProjectDiscussion({
  tasks,
  onAddComment,
  className,
}: {
  tasks: Task[];
  onAddComment?: () => void;
  className?: string;
}) {
  const { user } = useAuth();

  const commentQueries = useQueries({
    queries: tasks.map((task) => ({
      queryKey: ['comments', task.id],
      queryFn: () => api<Comment[]>(`/tasks/${task.id}/comments`),
      enabled: tasks.length > 0,
    })),
  });

  const allComments = commentQueries
    .flatMap((q, i) =>
      (q.data ?? []).map((c) => ({ ...c, taskTitle: tasks[i]?.title }))
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  const loading = commentQueries.some((q) => q.isLoading);

  return (
    <section className={cn('card-surface p-stack-md', className)} aria-labelledby="project-discussion-heading">
      <div className="mb-stack-md flex items-center justify-between">
        <h2
          id="project-discussion-heading"
          className="flex items-center gap-unit font-headline-md text-headline-md font-semibold text-on-surface"
        >
          <Icon name="forum" />
          Recent Discussion
        </h2>
        {onAddComment && tasks.length > 0 && (
          <Button onClick={onAddComment} className="gap-2">
            <Icon name="add_comment" className="text-[18px]" />
            Add Comment
          </Button>
        )}
      </div>

      {loading ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant">Loading discussion…</p>
      ) : allComments.length === 0 ? (
        <p className="py-4 text-center font-body-sm text-body-sm text-on-surface-variant">
          No comments yet. Open a task to start the conversation.
        </p>
      ) : (
        <div className="flex flex-col gap-stack-md">
          {allComments.map((comment) => {
            const isOwn = comment.user_id === user?.id;
            return (
              <div
                key={comment.id}
                className={cn('flex gap-stack-sm', isOwn && 'flex-row-reverse')}
              >
                <Avatar className="size-10 shrink-0 border border-outline-variant">
                  <AvatarFallback className="text-[10px] font-medium">
                    {commentInitials(comment.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'w-full max-w-[80%] rounded-lg border p-stack-sm',
                    isOwn
                      ? 'rounded-tr-none border-secondary-fixed bg-secondary-container text-on-secondary-container'
                      : 'rounded-tl-none border-surface-container-high bg-surface-container-low'
                  )}
                >
                  <div className="mb-unit flex items-center justify-between gap-2">
                    <span className="font-body-sm text-body-sm font-semibold">
                      {isOwn ? 'You' : (comment.user?.name ?? 'Team member')}
                    </span>
                    <time
                      dateTime={comment.created_at}
                      className="font-body-sm text-[12px] opacity-70"
                    >
                      {formatRelativeTime(comment.created_at)}
                    </time>
                  </div>
                  {comment.body && (
                    <p className="font-body-sm text-body-sm">{comment.body}</p>
                  )}
                  {comment.taskTitle && (
                    <p className="mt-unit font-body-sm text-[11px] opacity-60">
                      Re: {comment.taskTitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
