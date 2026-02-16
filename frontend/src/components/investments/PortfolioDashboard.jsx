import AllocationPieChart from './AllocationPieChart'
import { formatCurrency, formatPercent } from '../../lib/formatters'
import { RISK_COLORS, RISK_LABELS } from '../../lib/constants'

export default function PortfolioDashboard({ summary, investments }) {
  const {
    totalValue,
    totalCostBasis,
    totalMonthlyContribution,
    totalUnrealizedGain,
    totalUnrealizedGainPct,
    allocationByType,
    allocationByTag,
    riskProfile,
    diversificationScore,
    investmentCount,
  } = summary

  const diversificationColor =
    diversificationScore >= 70 ? 'text-green-600 dark:text-green-400' :
    diversificationScore >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
    'text-red-600 dark:text-red-400'

  const diversificationBg =
    diversificationScore >= 70 ? 'bg-green-500' :
    diversificationScore >= 40 ? 'bg-yellow-500' :
    'bg-red-500'

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-colors duration-300">
      <h2 className="mb-4 text-lg font-semibold text-card-foreground">Portfolio Overview</h2>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Metric Cards */}
        <div className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Total Value */}
            <div className="rounded-md bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-card-foreground">{formatCurrency(totalValue)}</p>
              <p className="text-xs text-muted-foreground">{investmentCount} investment{investmentCount !== 1 ? 's' : ''}</p>
            </div>

            {/* Unrealized Gain/Loss */}
            <div className="rounded-md bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Unrealized Gain/Loss</p>
              <p className={`text-2xl font-bold ${totalUnrealizedGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {totalUnrealizedGain >= 0 ? '+' : ''}{formatCurrency(totalUnrealizedGain)}
              </p>
              <p className={`text-xs ${totalUnrealizedGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {totalUnrealizedGainPct >= 0 ? '+' : ''}{formatPercent(totalUnrealizedGainPct)} return
              </p>
            </div>

            {/* Monthly Contributions */}
            <div className="rounded-md bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Monthly Contributions</p>
              <p className="text-2xl font-bold text-card-foreground">{formatCurrency(totalMonthlyContribution)}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(totalMonthlyContribution * 12)}/yr</p>
            </div>

            {/* Cost Basis */}
            <div className="rounded-md bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Total Cost Basis</p>
              <p className="text-lg font-bold text-card-foreground">{formatCurrency(totalCostBasis)}</p>
            </div>

            {/* Diversification Score */}
            <div className="rounded-md bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Diversification Score</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-lg font-bold ${diversificationColor}`}>{diversificationScore}</p>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
                <div
                  className={`h-1.5 rounded-full transition-all ${diversificationBg}`}
                  style={{ width: `${diversificationScore}%` }}
                />
              </div>
            </div>

            {/* Risk Profile */}
            <div className="rounded-md bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-2">Risk Profile</p>
              <div className="flex h-3 w-full overflow-hidden rounded-full">
                {riskProfile.low > 0 && (
                  <div
                    style={{ width: `${riskProfile.low}%`, backgroundColor: RISK_COLORS.low }}
                    className="transition-all"
                    title={`Low Risk: ${formatPercent(riskProfile.low)}`}
                  />
                )}
                {riskProfile.medium > 0 && (
                  <div
                    style={{ width: `${riskProfile.medium}%`, backgroundColor: RISK_COLORS.medium }}
                    className="transition-all"
                    title={`Medium Risk: ${formatPercent(riskProfile.medium)}`}
                  />
                )}
                {riskProfile.high > 0 && (
                  <div
                    style={{ width: `${riskProfile.high}%`, backgroundColor: RISK_COLORS.high }}
                    className="transition-all"
                    title={`High Risk: ${formatPercent(riskProfile.high)}`}
                  />
                )}
              </div>
              <div className="mt-1.5 flex gap-3 text-[10px]">
                {riskProfile.low > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RISK_COLORS.low }} />
                    Low {formatPercent(riskProfile.low, 0)}
                  </span>
                )}
                {riskProfile.medium > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RISK_COLORS.medium }} />
                    Med {formatPercent(riskProfile.medium, 0)}
                  </span>
                )}
                {riskProfile.high > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RISK_COLORS.high }} />
                    High {formatPercent(riskProfile.high, 0)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Allocation Pie Chart */}
        <div>
          <AllocationPieChart
            allocationByType={allocationByType}
            allocationByTag={allocationByTag}
          />
        </div>
      </div>
    </div>
  )
}
