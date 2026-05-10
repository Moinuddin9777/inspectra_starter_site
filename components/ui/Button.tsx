import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants: Record<string, string> = {
      primary: "bg-brand-primary text-rich-black hover:bg-brand-primary/90 shadow-[0_0_15px_rgba(79,248,210,0.4)]",
      secondary: "bg-brand-secondary text-white hover:bg-brand-secondary/90 shadow-[0_0_15px_rgba(124,58,237,0.4)]",
      outline: "border-2 border-brand-primary/20 text-brand-primary hover:bg-brand-primary/10",
      ghost: "hover:bg-white/5 text-white/70 hover:text-white",
      glass: "glass text-white hover:bg-white/10 border-white/20",
    }
    
    const sizes: Record<string, string> = {
      sm: "h-9 px-4 text-xs",
      md: "h-11 px-6 text-sm font-medium",
      lg: "h-14 px-8 text-base font-semibold",
      icon: "h-10 w-10 p-0",
    }

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl transition-all duration-300 disabled:opacity-50 active:scale-95",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
