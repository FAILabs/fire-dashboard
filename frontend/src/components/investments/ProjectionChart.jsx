import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useTheme } from '../ui/ThemeContext'
import { formatCurrency, formatCompactCurrency } from '../../lib/formatters'
import { STORAGE_KEYS } from '../../lib/constants'

export default function ProjectionChart({ data, title = 'Growth Projection' }) {
  const { darkMode } = useTheme()

  if (!data || data.length === 0) return null

  // Try to get FI/RE number for milestone line
  let fireNumber = null
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CALCULATOR_RESULTS)
    if (stored) {
      const parsed = JSON.parse(stored)
      fireNumber = parsed.fire_number
    }
  } catch {}

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-card-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
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
            tickFormatter={(v) => formatCompactCurrency(v)}
            stroke={darkMode ? 'hsl(215 20.2% 65.1%)' : 'hsl(215.4 16.3% 46.9%)'}
          />
          <Tooltip
            formatter={(value, name) => [formatCurrency(value), name]}
            contentStyle={{
              backgroundColor: darkMode ? 'hsl(222.2 84% 4.9%)' : 'hsl(0 0% 100%)',
              border: `1px solid ${darkMode ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(214.3 31.8% 91.4%)'}`,
              color: darkMode ? 'hsl(210 40% 98%)' : 'hsl(222.2 84% 4.9%)',
              borderRadius: '6px',
            }}
          />
          <Area
            type="monotone"
            dataKey="contributions_cumulative"
            stackId="1"
            stroke="hsl(215 20.2% 65.1%)"
            fill="hsl(215 20.2% 65.1%)"
            fillOpacity={0.3}
            name="Contributions"
          />
          <Area
            type="monotone"
            dataKey="growth_cumulative"
            stackId="1"
            stroke="hsl(142 76% 36%)"
            fill="hsl(142 76% 36%)"
            fillOpacity={0.3}
            name="Growth"
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="hsl(221.2 83.2% 53.3%)"
            fill="hsl(221.2 83.2% 53.3%)"
            fillOpacity={0.1}
            name="Total Balance"
          />
          {fireNumber && (
            <ReferenceLine
              y={fireNumber}
              stroke="hsl(48 96% 53%)"
              strokeDasharray="5 5"
              label={{
                value: `FI/RE: ${formatCompactCurrency(fireNumber)}`,
                position: 'right',
                fill: darkMode ? 'hsl(48 96% 53%)' : 'hsl(48 96% 40%)',
                fontSize: 11,
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
