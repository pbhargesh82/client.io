import type { CommentAttachment } from '@clientspace/shared';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MAX_ATTACHMENTS = 5;

export function isImageAttachment(contentType: string | null | undefined): boolean {
  return !!contentType?.startsWith('image/');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function CommentAttachmentList({
  attachments,
  canDelete,
  onDelete,
  deletingId,
  className,
}: {
  attachments: CommentAttachment[];
  canDelete?: boolean;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
  className?: string;
}) {
  if (!attachments.length) return null;

  return (
    <ul className={cn('flex flex-col gap-2.5', className)}>
      {attachments.map((file) => {
        const isImage = isImageAttachment(file.content_type);

        return (
          <li
            key={file.id}
            className={cn(
              'relative rounded-md border bg-muted/30',
              isImage ? 'overflow-hidden' : 'flex items-center gap-2 px-2.5 py-2'
            )}
          >
            {isImage && file.download_url ? (
              <>
                <a href={file.download_url} target="_blank" rel="noopener noreferrer" className="block">
                  <img
                    src={file.download_url}
                    alt={file.name}
                    className="max-h-48 w-full object-contain bg-background"
                    loading="lazy"
                  />
                  <div className="flex items-center justify-between gap-2 border-t px-2.5 py-1.5">
                    <span className="truncate text-[12px] font-medium">{file.name}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatFileSize(file.size_bytes)}
                    </span>
                  </div>
                </a>
                {canDelete && onDelete && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    className="absolute right-2 top-2 size-7 shadow-sm"
                    disabled={deletingId === file.id}
                    onClick={() => onDelete(file.id)}
                  >
                    <Trash2 className="size-3.5 text-destructive" aria-hidden />
                    <span className="sr-only">Delete {file.name}</span>
                  </Button>
                )}
              </>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatFileSize(file.size_bytes)}
                  </p>
                </div>
                {file.download_url && (
                  <a
                    href={file.download_url}
                    download={file.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-muted"
                  >
                    <Download className="size-3.5" aria-hidden />
                    <span className="sr-only">Download {file.name}</span>
                  </a>
                )}
                {canDelete && onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={deletingId === file.id}
                    onClick={() => onDelete(file.id)}
                  >
                    <Trash2 className="size-3.5 text-destructive" aria-hidden />
                    <span className="sr-only">Delete {file.name}</span>
                  </Button>
                )}
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export { MAX_ATTACHMENTS };
