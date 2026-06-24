import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded px-2 py-1 text-[11px] font-medium whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#e0e7ff] text-[#3730a3]",
        secondary: "bg-surface-container-highest text-on-surface-variant",
        destructive: "bg-error-container text-on-error-container",
        success: "bg-[#dcfce7] text-[#166534]",
        outline: "border border-outline-variant text-on-surface-variant",
        ghost: "text-on-surface-variant",
        link: "text-action underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
