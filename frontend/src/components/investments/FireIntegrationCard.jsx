import { useState, useEffect } from 'react'
import { formatCurrency, formatPercent } from '../../lib/formatters'
import { STORAGE_KEYS, API_BASE_URL } from '../../lib/constants'

export default function FireIntegrationCard({ summary, investments }) {
  const [fireData, setFireData] = useState(null)
  const [yearsToFire, setYearsToFire] = useState(null)

  // Load FI/RE calculator results from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CALCULATOR_RESULTS)
      if (stored) {
        setFireData(JSON.parse(stored))
      }
    } catch {}
  }, [])

  // Calculate years to FI/RE using portfolio projections
  useEffect(() => {
    if (!fireData || !investments.length || summary.totalValue <= 0) return

    const investmentInputs = investments.map((inv) => ({
      current_value: inv.currentShares * inv.currentPricePerShare,
      monthly_contribution: inv.monthlyContribution || 0,
      expected_annual_return: inv.expectedAnnualReturn || 7.0,
      name: inv.ticker || inv.name,
    }))

    fetch(`${API_BASE_URL}/project-portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ investments: investmentInputs, projection_years: 60 }),
    })
      .then((res) => res.json())
      .then((data) => {
        const targetYear = data.yearly_projections.find(
          (y) => y.total_balance >= fireData.fire_number
        )
        if (targetYear) {
          setYearsToFire(targetYear.year)
        }
      })
      .catch(() => {})
  }, [fireData, investments, summary.totalValue])

  if (!fireData) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-colors duration-300">
        <h2 className="mb-2 text-lg font-semibold text-card-foreground">FI/RE Goal Progress</h2>
        <p className="text-sm text-muted-foreground">
          Run the FI/RE Calculator first to see how your investments contribute to your financial independence goal.
        </p>
      </div>
    )
  }

  const fireNumber = fireData.fire_number
  const progressPct = fireNumber > 0 ? Math.min((summary.totalValue / fireNumber) * 100, 100) : 0
  const remaining = Math.max(fireNumber - summary.totalValue, 0)

  // Determine progress bar color
  const progressColor =
    progressPct >= 75 ? 'bg-green-500' :
    progressPct >= 50 ? 'bg-blue-500' :
    progressPct >= 25 ? 'bg-yellow-500' :
    'bg-primary'

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-colors duration-300">
      <h2 className="mb-4 text-lg font-semibold text-card-foreground">FI/RE Goal Progress</h2>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {formatPercent(progressPct, 1)} of FI/RE Number
          </span>
          <span className="text-sm font-medium text-card-foreground">
            {formatCurrency(summary.totalValue)} / {formatCurrency(fireNumber)}
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">FI/RE Number</p>
          <p className="text-lg font-bold text-card-foreground">{formatCurrency(fireNumber)}</p>
          <p className="text-xs text-muted-foreground">
            Based on {formatCurrency(fireData.inputs?.annual_expenses || 0)}/yr expenses
          </p>
        </div>

        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Remaining to Goal</p>
          <p className="text-lg font-bold text-card-foreground">{formatCurrency(remaining)}</p>
          {summary.totalMonthlyContribution > 0 && (
            <p className="text-xs text-muted-foreground">
              Contributing {formatCurrency(summary.totalMonthlyContribution)}/mo
            </p>
          )}
        </div>

        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Est. Years to FI/RE</p>
          {yearsToFire !== null ? (
            <>
              <p className="text-lg font-bold text-card-foreground">{yearsToFire} years</p>
              <p className="text-xs text-muted-foreground">
                Based on current portfolio projections
              </p>
            </>
          ) : progressPct >= 100 ? (
            <>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">Goal Reached!</p>
              <p className="text-xs text-muted-foreground">Congratulations!</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Calculating...</p>
          )}
        </div>
      </div>

      {/* Milestones */}
      <div className="mt-4 border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-card-foreground mb-2">Milestones</h3>
        <div className="space-y-2">
          {[25, 50, 75, 100].map((pct) => {
            const milestoneValue = fireNumber * (pct / 100)
            const reached = summary.totalValue >= milestoneValue
            return (
              <div key={pct} className="flex items-center gap-3 text-sm">
                <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  reached
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {reached ? (
                    <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3354 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                    </svg>
                  ) : pct}
                </div>
                <span className={`flex-1 ${reached ? 'text-card-foreground' : 'text-muted-foreground'}`}>
                  {pct}% — {formatCurrency(milestoneValue)}
                </span>
                {reached && (
                  <span className="text-xs text-green-600 dark:text-green-400">Reached</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
