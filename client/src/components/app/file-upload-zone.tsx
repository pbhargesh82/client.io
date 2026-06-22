import { useRef, useState } from 'react';
import { CheckCircle2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FileUploadZone({
  onFile,
  uploading,
  error,
  label = 'Click to upload',
  className,
}: {
  onFile: (file: File) => void | Promise<unknown>;
  uploading?: boolean;
  error?: string | null;
  label?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;

    setSelectedName(f.name);
    setJustUploaded(false);

    try {
      await onFile(f);
      setJustUploaded(true);
      setSelectedName(null);
      window.setTimeout(() => setJustUploaded(false), 3000);
    } catch {
      // Parent passes error via prop
    }
  };

  return (
    <div className={className}>
      <label
        htmlFor="project-file-upload"
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 transition-colors duration-150',
          justUploaded
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : error
              ? 'border-destructive/40 bg-destructive/5'
              : 'border-muted-foreground/30 bg-muted/20 hover:border-primary/40 hover:bg-muted/40',
          uploading && 'pointer-events-none opacity-60'
        )}
      >
        {justUploaded ? (
          <CheckCircle2 className="mb-2 size-8 text-emerald-600" aria-hidden />
        ) : (
          <Upload className="mb-2 size-8 text-muted-foreground" aria-hidden />
        )}
        <span className="text-[13px] font-medium">
          {uploading
            ? `Uploading ${selectedName ?? 'file'}…`
            : justUploaded
              ? 'Upload complete'
              : label}
        </span>
        <span className="mt-1 text-[12px] text-muted-foreground">
          PDF, images, documents up to 50 MB
        </span>
        <input
          ref={inputRef}
          id="project-file-upload"
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
          disabled={uploading}
          onChange={handleChange}
        />
      </label>
      {error && (
        <p className="mt-2 text-[12px] text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
