import type { CommentAttachment } from '@clientspace/shared';
import { confirmFileDelete, downloadNamedFile } from '@/lib/files';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
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
              'relative rounded border border-outline-variant bg-surface-container-low',
              isImage ? 'overflow-hidden' : 'flex items-center gap-2 px-2.5 py-2'
            )}
          >
            {isImage && file.download_url ? (
              <>
                <div className="block">
                  <img
                    src={file.download_url}
                    alt={file.name}
                    className="max-h-48 w-full bg-background object-contain"
                    loading="lazy"
                  />
                  <div className="flex items-center justify-between gap-2 border-t border-outline-variant px-2.5 py-1.5">
                    <span className="truncate font-body-sm text-[12px] font-medium">{file.name}</span>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <span className="font-body-sm text-[11px] text-on-surface-variant">
                        {formatFileSize(file.size_bytes)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Download ${file.name}`}
                        onClick={() => downloadNamedFile(file.download_url!, file.name).catch(() => undefined)}
                      >
                        <Icon name="download" className="text-[14px]" />
                      </Button>
                    </div>
                  </div>
                </div>
                {canDelete && onDelete && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    className="absolute top-2 right-2 size-7 shadow-sm"
                    disabled={deletingId === file.id}
                    onClick={() => {
                      if (confirmFileDelete(file.name)) onDelete(file.id);
                    }}
                  >
                    <Icon name="delete" className="text-[14px] text-error" label={`Delete ${file.name}`} />
                  </Button>
                )}
              </>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body-sm text-[12px] font-medium">{file.name}</p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant">
                    {formatFileSize(file.size_bytes)}
                  </p>
                </div>
                {file.download_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Download ${file.name}`}
                    onClick={() => downloadNamedFile(file.download_url!, file.name).catch(() => undefined)}
                  >
                    <Icon name="download" className="text-[14px]" label={`Download ${file.name}`} />
                  </Button>
                )}
                {canDelete && onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={deletingId === file.id}
                    onClick={() => {
                      if (confirmFileDelete(file.name)) onDelete(file.id);
                    }}
                  >
                    <Icon name="delete" className="text-[14px] text-error" label={`Delete ${file.name}`} />
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
