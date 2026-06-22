import { Download, Paperclip, Trash2 } from 'lucide-react';
import type { ProjectFile } from '@clientspace/shared';
import { EmptyState } from '@/components/app/empty-state';
import { FileUploadZone } from '@/components/app/file-upload-zone';
import { Button } from '@/components/ui/button';
import { ButtonAnchor } from '@/components/ui/button-link';
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
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <p className="text-[13px] leading-relaxed text-muted-foreground">{description}</p>

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
          icon={Paperclip}
          title="No files yet"
          message={
            canUpload
              ? 'Upload deliverables, briefs, or assets.'
              : 'Files shared by your agency will appear here.'
          }
          className="py-8"
        />
      ) : (
        <ul
          className={cn('overflow-hidden rounded-lg border bg-card', listClassName)}
          role="list"
        >
          {files.map((f, i) => (
            <li
              key={f.id}
              className={cn(
                'flex items-center justify-between gap-2 px-3 py-2.5 transition-colors duration-150 hover:bg-row-hover',
                i > 0 && 'border-t border-border/80'
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{f.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {(f.size_bytes / 1024).toFixed(1)} KB ·{' '}
                  {new Date(f.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                {f.download_url && (
                  <ButtonAnchor
                    variant="ghost"
                    size="icon-sm"
                    href={f.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Download ${f.name}`}
                  >
                    <Download className="size-4" />
                  </ButtonAnchor>
                )}
                {canDelete && onDelete && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(f.id)}
                    aria-label={`Delete ${f.name}`}
                  >
                    <Trash2 className="size-4" />
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
