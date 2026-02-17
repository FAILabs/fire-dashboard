import { Badge } from '../ui/badge'
import { formatCurrency, formatPercent } from '../../lib/formatters'
import { INVESTMENT_TYPE_MAP, RISK_TIERS } from '../../lib/constants'

export default function InvestmentCard({ investment, onSelect, onEdit, onDelete, onRefreshPrice, isSelected }) {
  const currentValue = investment.currentShares * investment.currentPricePerShare
  const costBasis = investment.currentShares * investment.costBasisPerShare
  const gainLoss = currentValue - costBasis
  const gainLossPct = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0
  const risk = RISK_TIERS[investment.type] || 'medium'

  return (
    <div
      onClick={() => onSelect(investment)}
      className={`cursor-pointer rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md ${
        isSelected ? 'border-primary ring-1 ring-primary' : 'border-border'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Main info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-card-foreground">{investment.ticker || '—'}</span>
            <Badge variant="outline" className="text-[10px]">
              {INVESTMENT_TYPE_MAP[investment.type] || investment.type}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{investment.name}</p>

          {/* Tags */}
          {investment.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {investment.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Right: Value & Actions */}
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-card-foreground">{formatCurrency(currentValue)}</p>
          <p className={`text-sm font-medium ${gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)} ({gainLoss >= 0 ? '+' : ''}{formatPercent(gainLossPct)})
          </p>
          <div className="mt-2 flex justify-end gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(investment) }}
              className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              Edit
            </button>
            {investment.ticker && (
              <button
                onClick={(e) => { e.stopPropagation(); onRefreshPrice(investment) }}
                className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                title="Refresh current price"
              >
                Refresh
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(investment.id) }}
              className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Monthly contribution & expected return */}
      <div className="mt-3 flex flex-wrap gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
        <span>{investment.currentShares} shares @ {formatCurrency(investment.currentPricePerShare)}/ea</span>
        <span className="border-l border-border pl-4">{formatCurrency(investment.monthlyContribution)}/mo contribution</span>
        <span className="border-l border-border pl-4">{formatPercent(investment.expectedAnnualReturn)} expected return</span>
        {investment.lastPriceUpdate && (
          <span className="border-l border-border pl-4">Updated {new Date(investment.lastPriceUpdate).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  )
}
