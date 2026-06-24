import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiForm } from '@/lib/api';
import { formatRelativeTime } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
import type { Comment } from '@clientspace/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  CommentAttachmentList,
  isImageAttachment,
  MAX_ATTACHMENTS,
  formatFileSize,
} from '@/components/app/comment-attachments';
import { Icon } from '@/components/ui/icon';
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

function PendingFilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isImageAttachment(file.type)) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <li
      className={cn(
        'flex items-start gap-2 rounded-md border bg-background',
        previewUrl ? 'flex-col overflow-hidden p-0' : 'px-2.5 py-2'
      )}
    >
      {previewUrl && (
        <img
          src={previewUrl}
          alt={file.name}
          className="max-h-36 w-full bg-muted/30 object-contain"
        />
      )}
      <div className="flex w-full items-center gap-2 px-2.5 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium">{file.name}</p>
          <p className="text-[11px] text-muted-foreground">{formatFileSize(file.size)}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
        >
          <Icon name="close" className="text-[14px]" />
        </Button>
      </div>
    </li>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteAttachment = useMutation({
    mutationFn: (fileId: string) => api(`/files/${fileId}`, { method: 'DELETE' }),
    onMutate: (fileId) => setDeletingId(fileId),
    onSettled: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ['comments', comment.task_id] });
    },
  });

  const hasBody = Boolean(comment.body?.trim());
  const hasAttachments = (comment.attachments?.length ?? 0) > 0;

  return (
    <article className="rounded-lg border border-border/80 bg-background p-4">
      <header className="flex items-start gap-3">
        <Avatar size="sm" className="mt-0.5">
          <AvatarFallback className="text-[10px] font-medium">
            {commentInitials(comment.user?.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[13px] font-semibold tracking-tight">
              {comment.user?.name ?? 'Unknown'}
            </span>
            <time
              className="text-[12px] text-muted-foreground"
              dateTime={comment.created_at}
            >
              {formatRelativeTime(comment.created_at)}
            </time>
          </div>

          {hasBody && (
            <p className="mt-2 text-[13px] leading-relaxed text-foreground">{comment.body}</p>
          )}

          {hasAttachments && (
            <CommentAttachmentList
              attachments={comment.attachments ?? []}
              canDelete={isAdmin}
              deletingId={deletingId}
              onDelete={(id) => deleteAttachment.mutate(id)}
              className={cn(hasBody && 'mt-3 border-t border-border/60 pt-3')}
            />
          )}
        </div>
      </header>
    </article>
  );
}

export function TaskComments({
  taskId,
  embedded = false,
  variant = 'default',
}: {
  taskId: string;
  embedded?: boolean;
  variant?: 'default' | 'sheet';
}) {
  const isSheet = variant === 'sheet';
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const isAdmin = role === 'admin';
  const canSubmit =
    (body.trim().length > 0 || pendingFiles.length > 0) && pendingFiles.length <= MAX_ATTACHMENTS;

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => api<Comment[]>(`/tasks/${taskId}/comments`),
  });

  const postComment = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      if (body.trim()) formData.append('body', body.trim());
      pendingFiles.forEach((file) => formData.append('files', file));
      return apiForm<Comment>(`/tasks/${taskId}/comments`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setBody('');
      setPendingFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
  });

  const addFiles = (incoming: FileList | null) => {
    if (!incoming?.length) return;
    setPendingFiles((prev) => {
      const merged = [...prev, ...Array.from(incoming)];
      return merged.slice(0, MAX_ATTACHMENTS);
    });
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const commentCount = comments?.length ?? 0;

  return (
    <section
      className={cn(
        !embedded && !isSheet && 'mt-4 border-t border-border/80 pt-5',
        isSheet && 'pb-2'
      )}
      aria-label="Task comments"
    >
      <div
        className={cn(
          'flex flex-col',
          embedded || isSheet ? 'gap-4' : 'mb-5 gap-5'
        )}
      >
        {!embedded && !isSheet && (
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-[13px] font-semibold tracking-tight">
              Comments
              {commentCount > 0 && (
                <span className="ml-1.5 font-normal text-muted-foreground">({commentCount})</span>
              )}
            </h3>
          </div>
        )}

        {(embedded || isSheet) && (
          <p className="text-[12px] font-medium text-muted-foreground">
            {commentCount > 0 ? `${commentCount} comment${commentCount === 1 ? '' : 's'}` : 'No comments yet'}
          </p>
        )}

        {isLoading ? (
          <p className="rounded-lg border border-dashed border-border/80 px-4 py-6 text-center text-[13px] text-muted-foreground">
            Loading comments…
          </p>
        ) : !comments?.length ? (
          <p className="rounded-lg border border-dashed border-border/80 px-4 py-6 text-center text-[13px] text-muted-foreground">
            No comments yet. Be the first to reply.
          </p>
        ) : (
          <ul className="flex flex-col gap-3" role="list">
            {comments.map((c) => (
              <li key={c.id}>
                <CommentItem comment={c} />
              </li>
            ))}
          </ul>
        )}

        <div
          className={cn(
            'rounded-lg border border-border/80 bg-background p-4',
            !embedded && !isSheet && 'bg-muted/20'
          )}
        >
        <p className="mb-3 text-[12px] font-medium text-muted-foreground">Add a comment</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) postComment.mutate();
          }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <Input
              placeholder="Write a comment…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              aria-label="Comment"
              className="flex-1 bg-background"
            />
            <input
              ref={fileInputRef}
              id={`comment-files-${taskId}`}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <Button
              type="button"
              variant={pendingFiles.length > 0 ? 'secondary' : 'outline'}
              size="icon"
              className="shrink-0 bg-background"
              onClick={() => fileInputRef.current?.click()}
              disabled={pendingFiles.length >= MAX_ATTACHMENTS}
              aria-label="Attach files"
            >
              <span className="relative flex">
                <Icon name="attach_file" className="text-[16px]" />
                {pendingFiles.length > 0 && (
                  <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {pendingFiles.length}
                  </span>
                )}
              </span>
            </Button>
            <Button type="submit" size="sm" className="shrink-0" disabled={!canSubmit || postComment.isPending}>
              {postComment.isPending ? 'Posting…' : 'Post'}
            </Button>
          </div>

          {pendingFiles.length > 0 && (
            <div className="rounded-md border border-primary/25 bg-background p-3">
              <p className="mb-2 text-[12px] font-medium text-primary">
                {pendingFiles.length} file{pendingFiles.length === 1 ? '' : 's'} attached — click Post
                to upload
              </p>
              <ul className="flex flex-col gap-2">
                {pendingFiles.map((file, index) => (
                  <PendingFilePreview
                    key={`${file.name}-${file.size}-${index}`}
                    file={file}
                    onRemove={() => removePendingFile(index)}
                  />
                ))}
              </ul>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">
            {pendingFiles.length > 0
              ? 'Add a message (optional) or post with attachments only'
              : 'Text or attachment required · up to 5 files'}
            {isAdmin && ' · Admins can remove attachments after posting'}
          </p>
          {postComment.isError && (
            <p className="text-[12px] text-destructive" role="alert">
              {postComment.error instanceof Error ? postComment.error.message : 'Failed to post'}
            </p>
          )}
        </form>
        </div>
      </div>
    </section>
  );
}
