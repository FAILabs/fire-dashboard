import { useState, useEffect } from 'react'
import ProjectionChart from './ProjectionChart'
import { Badge } from '../ui/badge'
import { formatCurrency, formatPercent } from '../../lib/formatters'
import { INVESTMENT_TYPE_MAP, RISK_TIERS, RISK_LABELS } from '../../lib/constants'
import { useProjection } from '../../hooks/useProjection'

export default function InvestmentDetailPanel({ investment, onClose }) {
  const { projectInvestment, loading, error } = useProjection()
  const [projection, setProjection] = useState(null)
  const [projectionYears, setProjectionYears] = useState(30)

  useEffect(() => {
    let cancelled = false
    projectInvestment(investment, projectionYears).then((result) => {
      if (!cancelled && result) setProjection(result)
    })
    return () => { cancelled = true }
  }, [investment, projectionYears, projectInvestment])

  const currentValue = investment.currentShares * investment.currentPricePerShare
  const costBasis = investment.currentShares * investment.costBasisPerShare
  const gainLoss = currentValue - costBasis
  const gainLossPct = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0
  const risk = RISK_TIERS[investment.type] || 'medium'

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-card-foreground">{investment.ticker || investment.name}</h2>
            <Badge variant="outline">{INVESTMENT_TYPE_MAP[investment.type] || investment.type}</Badge>
            <Badge variant={risk === 'low' ? 'success' : risk === 'high' ? 'danger' : 'warning'}>
              {RISK_LABELS[risk]}
            </Badge>
          </div>
          {investment.ticker && (
            <p className="mt-1 text-sm text-muted-foreground">{investment.name}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-sm p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Current Value</p>
          <p className="text-lg font-bold text-card-foreground">{formatCurrency(currentValue)}</p>
        </div>
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Unrealized Gain/Loss</p>
          <p className={`text-lg font-bold ${gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
          </p>
          <p className={`text-xs ${gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {gainLossPct >= 0 ? '+' : ''}{formatPercent(gainLossPct)}
          </p>
        </div>
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Monthly Contribution</p>
          <p className="text-lg font-bold text-card-foreground">{formatCurrency(investment.monthlyContribution)}</p>
          <p className="text-xs text-muted-foreground">{formatCurrency(investment.monthlyContribution * 12)}/yr</p>
        </div>
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Expected Return</p>
          <p className="text-lg font-bold text-card-foreground">{formatPercent(investment.expectedAnnualReturn)}</p>
          {projection && <p className="text-xs text-muted-foreground">CAGR: {formatPercent(projection.cagr)}</p>}
        </div>
      </div>

      {/* Projection details */}
      {projection && (
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Projected Value ({projectionYears}yr)</p>
            <p className="text-lg font-bold text-card-foreground">{formatCurrency(projection.final_value)}</p>
          </div>
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Total Contributions</p>
            <p className="text-lg font-bold text-card-foreground">{formatCurrency(projection.total_contributions)}</p>
          </div>
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Total Growth</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(projection.total_growth)}</p>
          </div>
        </div>
      )}

      {/* Projection Year Selector */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground">Projection period:</span>
        {[10, 20, 30, 40].map((years) => (
          <button
            key={years}
            onClick={() => setProjectionYears(years)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              projectionYears === years
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {years}yr
          </button>
        ))}
      </div>

      {/* Projection Chart */}
      {loading && <p className="text-sm text-muted-foreground">Calculating projection...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {projection && (
        <ProjectionChart
          data={projection.yearly_projections}
          title={`${investment.ticker || investment.name} — ${projectionYears}-Year Projection`}
        />
      )}

      {/* Holdings Details */}
      <div className="mt-6 border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-card-foreground mb-2">Holdings Details</h3>
        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shares</span>
            <span className="text-card-foreground">{investment.currentShares}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cost Basis / Share</span>
            <span className="text-card-foreground">{formatCurrency(investment.costBasisPerShare)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Price / Share</span>
            <span className="text-card-foreground">{formatCurrency(investment.currentPricePerShare)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Cost Basis</span>
            <span className="text-card-foreground">{formatCurrency(costBasis)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {investment.notes && (
        <div className="mt-4 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-1">Notes</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{investment.notes}</p>
        </div>
      )}
    </div>
  )
}
