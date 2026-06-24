import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded border border-transparent bg-clip-padding font-body-sm text-body-sm font-semibold whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border-border bg-background text-on-surface hover:bg-surface-container-low",
        secondary:
          "bg-secondary-container text-on-secondary-container hover:bg-surface-container-high",
        ghost:
          "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
        destructive:
          "bg-error-container text-on-error-container hover:bg-error-container/80",
        link: "text-action underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-4",
        xs: "h-7 gap-1 px-2 text-xs",
        sm: "h-8 gap-1.5 px-3 text-[13px]",
        lg: "h-11 gap-2 px-5",
        icon: "size-10",
        "icon-xs": "size-7",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
