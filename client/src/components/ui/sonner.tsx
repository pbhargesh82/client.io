import { Toaster as Sonner, type ToasterProps } from "sonner"
import { Icon } from "@/components/ui/icon"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <Icon name="check_circle" className="text-[16px]" />,
        info: <Icon name="info" className="text-[16px]" />,
        warning: <Icon name="warning" className="text-[16px]" />,
        error: <Icon name="error" className="text-[16px]" />,
        loading: <Icon name="progress_activity" className="animate-spin text-[16px]" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
