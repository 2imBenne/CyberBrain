import * as React from 'react'

import { cn } from '@/lib/utils'

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variant === 'default' && 'border-transparent bg-primary/15 text-primary',
        variant === 'secondary' && 'border-transparent bg-secondary text-secondary-foreground',
        variant === 'outline' && 'border-border text-muted-foreground',
        variant === 'ghost' && 'border-transparent text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
