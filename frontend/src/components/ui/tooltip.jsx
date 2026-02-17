import { useState, useRef, useEffect } from 'react'

export function Tooltip({ children, content, position = 'top' }) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)

  useEffect(() => {
    if (visible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()

      let top, left
      switch (position) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - 8
          left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
          break
        case 'right':
          top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
          left = triggerRect.right + 8
          break
        case 'bottom':
          top = triggerRect.bottom + 8
          left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
          break
        case 'left':
          top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
          left = triggerRect.left - tooltipRect.width - 8
          break
      }

      left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8))
      top = Math.max(8, top)

      setCoords({ top, left })
    }
  }, [visible, position])

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        tabIndex={0}
        className="inline-flex cursor-help"
        aria-describedby={visible ? 'tooltip' : undefined}
      >
        {children}
      </span>
      {visible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="fixed z-50 max-w-xs rounded-md border border-border bg-card px-3 py-2 text-xs text-card-foreground shadow-lg"
          style={{ top: coords.top, left: coords.left }}
        >
          {content}
        </div>
      )}
    </>
  )
}
