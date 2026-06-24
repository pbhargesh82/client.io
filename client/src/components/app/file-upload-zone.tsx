import { useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';
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
          'flex cursor-pointer flex-col items-center justify-center rounded border border-dashed px-6 py-10 transition-colors duration-150',
          justUploaded
            ? 'border-[#166534]/50 bg-[#dcfce7]/30'
            : error
              ? 'border-error/40 bg-error-container/30'
              : 'border-outline-variant bg-surface-container-low hover:border-action/40 hover:bg-surface-container',
          uploading && 'pointer-events-none opacity-60'
        )}
      >
        {justUploaded ? (
          <Icon name="check_circle" className="mb-2 text-[32px] text-[#166534]" />
        ) : (
          <Icon name="upload" className="mb-2 text-[32px] text-on-surface-variant" />
        )}
        <span className="font-body-sm text-body-sm font-semibold">
          {uploading
            ? `Uploading ${selectedName ?? 'file'}…`
            : justUploaded
              ? 'Upload complete'
              : label}
        </span>
        <span className="mt-1 font-body-sm text-[12px] text-on-surface-variant">
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
        <p className="mt-2 font-body-sm text-[12px] text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
