import * as React from 'react'

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring min-h-[60px] resize-y ${className || ''}`}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { Textarea }
