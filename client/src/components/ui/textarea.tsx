import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm text-on-surface transition-colors outline-none placeholder:text-placeholder focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-action disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
