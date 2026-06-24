import type { ProjectFile } from '@clientspace/shared';
import { formatRelativeTime } from '@/lib/format';
import { confirmFileDelete, downloadNamedFile } from '@/lib/files';
import { EmptyState } from '@/components/app/empty-state';
import { FileUploadZone } from '@/components/app/file-upload-zone';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export function ProjectFilesPanel({
  files,
  canUpload,
  canDelete,
  uploading,
  uploadError,
  onUpload,
  onDelete,
  description = 'Deliverables and documents shared on the client portal.',
  uploadLabel = 'Upload file',
  className,
  listClassName,
  variant = 'default',
}: {
  files: ProjectFile[];
  canUpload?: boolean;
  canDelete?: boolean;
  uploading?: boolean;
  uploadError?: string | null;
  onUpload?: (file: File) => void | Promise<unknown>;
  onDelete?: (fileId: string) => void;
  description?: string;
  uploadLabel?: string;
  className?: string;
  listClassName?: string;
  variant?: 'default' | 'deliverables';
}) {
  return (
    <div className={cn('space-y-stack-md', className)}>
      {description && (
        <p className="font-body-sm text-body-sm text-on-surface-variant">{description}</p>
      )}

      {canUpload && onUpload && (
        <FileUploadZone
          uploading={uploading}
          label={uploadLabel}
          error={uploadError ?? null}
          onFile={onUpload}
        />
      )}

      {!files.length ? (
        <EmptyState
          icon="attach_file"
          title="No files yet"
          message={
            canUpload
              ? 'Upload deliverables, briefs, or assets.'
              : 'Files shared by your agency will appear here.'
          }
          className="py-8"
        />
      ) : (
        <ul className={cn('flex flex-col gap-unit', listClassName)} role="list">
          {files.map((f) => (
            <li
              key={f.id}
              className={cn(
                'group flex items-center justify-between rounded p-unit transition-colors hover:bg-surface-container-low',
                variant === 'deliverables' && 'cursor-pointer'
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-stack-sm">
                <div className="flex size-8 shrink-0 items-center justify-center rounded bg-tertiary-fixed text-on-tertiary-fixed">
                  <Icon
                    name={f.content_type?.includes('pdf') ? 'picture_as_pdf' : 'description'}
                    className="text-[18px]"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-body-sm text-body-sm font-semibold text-on-surface">
                    {f.name}
                  </p>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">
                    Added <time dateTime={f.created_at}>{formatRelativeTime(f.created_at)}</time>
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                {f.download_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Download ${f.name}`}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => downloadNamedFile(f.download_url!, f.name).catch(() => undefined)}
                  >
                    <Icon name="download" className="text-[18px]" />
                  </Button>
                )}
                {canDelete && onDelete && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-error hover:text-error"
                    onClick={() => {
                      if (confirmFileDelete(f.name)) onDelete(f.id);
                    }}
                    aria-label={`Delete ${f.name}`}
                  >
                    <Icon name="delete" className="text-[18px]" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
