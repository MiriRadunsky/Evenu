// import * as React from "react"
// import { , type VariantProps } from "class-variance-authority"

// import { cn } from "../../lib/utils"



// export interface BadgeProps
//   extends React.HTMLAttributes<HTMLDivElement>,
//     VariantProps<typeof badgeVariants> {}

// function Badge({ className, variant, ...props }: BadgeProps) {
//   return (
//     <div className={cn(badgeVariants({ variant }), className)} {...props} />
//   )
// }

// export { Badge, badgeVariants }


import * as React from "react"
import { cn } from "../../lib/utils"
import { badgeVariants } from "./badgeVariants"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
