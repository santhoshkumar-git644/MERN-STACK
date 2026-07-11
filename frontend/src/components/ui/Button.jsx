import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../utils/cn"
import { motion } from "framer-motion"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_14px_0_rgb(139,92,246,0.39)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.23)]",
        destructive: "bg-red-500 text-white hover:bg-red-500/90 shadow-[0_4px_14px_0_rgb(239,68,68,0.39)]",
        outline: "border border-white/10 bg-transparent hover:bg-white/5 text-foreground backdrop-blur-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-white/10 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white shadow-sm",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : motion.button
  
  // Only apply motion props if not using Slot, to avoid conflicts with custom elements
  const motionProps = asChild ? {} : {
    whileTap: { scale: 0.97 }
  };

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...motionProps}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }