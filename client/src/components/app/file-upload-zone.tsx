import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FileUploadZone({
  onFile,
  uploading,
  label = 'Click to upload',
  className,
}: {
  onFile: (file: File) => void;
  uploading?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-6 py-10 transition-colors duration-150',
        'hover:border-primary/40 hover:bg-muted/40',
        uploading && 'pointer-events-none opacity-60',
        className
      )}
    >
      <Upload className="mb-2 size-8 text-muted-foreground" aria-hidden />
      <span className="text-[13px] font-medium">{uploading ? 'Uploading…' : label}</span>
      <span className="mt-1 text-[12px] text-muted-foreground">PDF, images, documents up to 50 MB</span>
      <input
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = '';
        }}
      />
    </label>
  );
}
