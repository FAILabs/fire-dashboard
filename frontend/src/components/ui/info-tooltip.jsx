import { Tooltip } from './tooltip'

export function InfoTooltip({ text }) {
  return (
    <Tooltip content={text}>
      <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px] font-bold leading-none">
        i
      </span>
    </Tooltip>
  )
}
