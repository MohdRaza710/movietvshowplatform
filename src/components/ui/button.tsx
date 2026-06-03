import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-xl font-medium",
    "transition-all duration-300 ease-out",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
    "[&_svg]:size-4 [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        default: cn(
          "bg-primary text-primary-foreground",
          "shadow-lg shadow-primary/20",
          "hover:-translate-y-0.5",
          "hover:shadow-xl hover:shadow-primary/30"
        ),

        secondary: cn(
          "bg-secondary text-secondary-foreground",
          "shadow-md",
          "hover:bg-secondary/90",
          "hover:-translate-y-0.5"
        ),

        outline: cn(
          "relative overflow-hidden",
          "border border-white/10 dark:border-white/5",
          "bg-background/60 backdrop-blur-xl",
          "text-foreground",
          "shadow-lg shadow-black/5",
          "hover:border-primary/30",
          "hover:bg-background/80",
          "hover:shadow-xl hover:shadow-primary/10",
          "hover:-translate-y-0.5",
          "before:absolute before:inset-0",
          "before:bg-gradient-to-r",
          "before:from-transparent before:via-primary/5 before:to-transparent",
          "before:-translate-x-full",
          "hover:before:translate-x-full",
          "before:transition-transform before:duration-700"
        ),

        ghost: cn(
          "hover:bg-muted",
          "hover:text-foreground",
          "hover:scale-[1.02]"
        ),

        destructive: cn(
          "bg-destructive text-destructive-foreground",
          "shadow-lg shadow-destructive/20",
          "hover:bg-destructive/90",
          "hover:shadow-xl hover:shadow-destructive/30"
        ),

        link: cn(
          "text-primary underline-offset-4",
          "hover:underline"
        ),
        icon: cn(
          "bg-primary text-primary-foreground",
          "shadow-md",
          "hover:bg-primary/90"
        ),
      },

      size: {
        sm: "h-9 px-4 text-sm",
        default: "h-11 px-5 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "size-11",
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
