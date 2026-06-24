import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm text-on-surface transition-colors outline-none file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-placeholder focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-action disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
