import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/format';
import type { Comment } from '@clientspace/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TaskComments({ taskId }: { taskId: string }) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => api<Comment[]>(`/tasks/${taskId}/comments`),
  });

  const mutation = useMutation({
    mutationFn: () =>
      api(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ body }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setBody('');
    },
  });

  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      {isLoading ? (
        <p className="text-[13px] text-muted-foreground">Loading comments…</p>
      ) : !comments?.length ? (
        <p className="text-[13px] text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="text-[13px]">
              <span className="font-medium">{c.user?.name}</span>
              <span className="ml-2 text-muted-foreground">
                <time dateTime={c.created_at}>{formatRelativeTime(c.created_at)}</time>
              </span>
              <p className="mt-1 text-muted-foreground">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim()) mutation.mutate();
        }}
        className="flex items-center gap-2"
      >
        <Input
          placeholder="Write a comment…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          aria-label="Comment"
        />
        <Button type="submit" size="sm" disabled={mutation.isPending}>
          Post
        </Button>
      </form>
    </div>
  );
}
