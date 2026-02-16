import * as React from 'react'

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring ${className || ''}`}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = 'Select'

export { Select }
