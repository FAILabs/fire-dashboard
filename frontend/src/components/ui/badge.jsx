import * as React from 'react'

const badgeVariants = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-border text-foreground bg-transparent',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <span
    ref={ref}
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${badgeVariants[variant] || badgeVariants.default} ${className || ''}`}
    {...props}
  />
))
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
