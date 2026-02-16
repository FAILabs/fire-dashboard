import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useTheme } from '../ui/ThemeContext'
import { formatCurrency, formatPercent, formatCompactCurrency } from '../../lib/formatters'
import { CHART_COLORS, API_BASE_URL } from '../../lib/constants'

export default function ComparisonChart({ investments }) {
  const { darkMode } = useTheme()
  const [projectionData, setProjectionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('absolute') // 'absolute' or 'percentage'
  const [projectionYears, setProjectionYears] = useState(30)
  const [visibleInvestments, setVisibleInvestments] = useState(
    Object.fromEntries(investments.map((inv) => [inv.id, true]))
  )

  useEffect(() => {
    if (investments.length < 2) return

    setLoading(true)
    const investmentInputs = investments.map((inv) => ({
      current_value: inv.currentShares * inv.currentPricePerShare,
      monthly_contribution: inv.monthlyContribution || 0,
      expected_annual_return: inv.expectedAnnualReturn || 7.0,
      name: inv.ticker || inv.name,
    }))

    fetch(`${API_BASE_URL}/project-portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        investments: investmentInputs,
        projection_years: projectionYears,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setProjectionData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [investments, projectionYears])

  const toggleInvestment = (id) => {
    setVisibleInvestments((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (!projectionData || investments.length < 2) return null

  // Build chart data
  const chartData = projectionData.yearly_projections.map((yearData) => {
    const entry = { year: yearData.year }

    if (viewMode === 'percentage') {
      // Normalize to percentage growth
      investments.forEach((inv) => {
        const name = inv.ticker || inv.name
        const initialValue = inv.currentShares * inv.currentPricePerShare
        const currentBalance = yearData[name] || 0
        entry[name] = initialValue > 0 ? ((currentBalance - initialValue) / initialValue) * 100 : 0
      })
    } else {
      investments.forEach((inv) => {
        const name = inv.ticker || inv.name
        entry[name] = yearData[name] || 0
      })
    }

    return entry
  })

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-colors duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-card-foreground">Investment Comparison</h2>
        <div className="flex gap-2">
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('absolute')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === 'absolute' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              Dollar
            </button>
            <button
              onClick={() => setViewMode('percentage')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === 'percentage' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              % Growth
            </button>
          </div>
          <div className="flex gap-1">
            {[10, 20, 30].map((y) => (
              <button
                key={y}
                onClick={() => setProjectionYears(y)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  projectionYears === y ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {y}yr
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toggle Checkboxes */}
      <div className="flex flex-wrap gap-3 mb-4">
        {investments.map((inv, index) => (
          <label key={inv.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={visibleInvestments[inv.id] !== false}
              onChange={() => toggleInvestment(inv.id)}
              className="rounded"
            />
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            <span className="text-muted-foreground">{inv.ticker || inv.name}</span>
          </label>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading projections...</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={darkMode ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(214.3 31.8% 91.4%)'}
            />
            <XAxis
              dataKey="year"
              label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
              stroke={darkMode ? 'hsl(215 20.2% 65.1%)' : 'hsl(215.4 16.3% 46.9%)'}
            />
            <YAxis
              tickFormatter={(v) => viewMode === 'percentage' ? `${v.toFixed(0)}%` : formatCompactCurrency(v)}
              stroke={darkMode ? 'hsl(215 20.2% 65.1%)' : 'hsl(215.4 16.3% 46.9%)'}
            />
            <Tooltip
              formatter={(value, name) => [
                viewMode === 'percentage' ? formatPercent(value) : formatCurrency(value),
                name,
              ]}
              contentStyle={{
                backgroundColor: darkMode ? 'hsl(222.2 84% 4.9%)' : 'hsl(0 0% 100%)',
                border: `1px solid ${darkMode ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(214.3 31.8% 91.4%)'}`,
                color: darkMode ? 'hsl(210 40% 98%)' : 'hsl(222.2 84% 4.9%)',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            />
            {investments.map((inv, index) => {
              const name = inv.ticker || inv.name
              if (visibleInvestments[inv.id] === false) return null
              return (
                <Line
                  key={inv.id}
                  type="monotone"
                  dataKey={name}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  name={name}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Summary Table */}
      {projectionData.per_investment && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="grid gap-2">
            <div className="grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground pb-1 border-b border-border">
              <span>Investment</span>
              <span className="text-right">Current</span>
              <span className="text-right">Projected ({projectionYears}yr)</span>
              <span className="text-right">Growth</span>
              <span className="text-right">CAGR</span>
            </div>
            {projectionData.per_investment.map((inv, index) => (
              <div key={index} className="grid grid-cols-5 gap-2 text-xs">
                <span className="flex items-center gap-1.5 text-card-foreground font-medium">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  {inv.name}
                </span>
                <span className="text-right text-card-foreground">{formatCurrency(investments[index]?.currentShares * investments[index]?.currentPricePerShare || 0)}</span>
                <span className="text-right text-card-foreground">{formatCurrency(inv.final_value)}</span>
                <span className="text-right text-green-600 dark:text-green-400">{formatCurrency(inv.total_growth)}</span>
                <span className="text-right text-card-foreground">{formatPercent(inv.cagr)}</span>
              </div>
            ))}
            {/* Totals Row */}
            <div className="grid grid-cols-5 gap-2 text-xs font-semibold border-t border-border pt-1">
              <span className="text-card-foreground">Total</span>
              <span className="text-right text-card-foreground">
                {formatCurrency(investments.reduce((sum, inv) => sum + inv.currentShares * inv.currentPricePerShare, 0))}
              </span>
              <span className="text-right text-card-foreground">{formatCurrency(projectionData.final_total_value)}</span>
              <span className="text-right text-green-600 dark:text-green-400">{formatCurrency(projectionData.total_growth)}</span>
              <span className="text-right text-card-foreground">{formatPercent(projectionData.portfolio_cagr)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
