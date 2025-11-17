// import * as React from "react";

// interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   asChild?: boolean;
// }

// export function Button({ className = '', children, ...props }: ButtonProps) {
//   return (
//     <button 
//       className={`inline-flex items-center justify-center gap-2 font-medium transition-all outline-none ${className}`}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// }

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"
import { buttonVariants } from "./buttonVariants"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = "Button"

export  {Button}
