import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useTheme } from '../ui/ThemeContext'
import { formatCurrency, formatPercent } from '../../lib/formatters'
import { CHART_COLORS, INVESTMENT_TYPE_MAP } from '../../lib/constants'

export default function AllocationPieChart({ allocationByType, allocationByTag }) {
  const { darkMode } = useTheme()
  const [view, setView] = useState('type')

  const allocation = view === 'type' ? allocationByType : allocationByTag

  const data = Object.entries(allocation)
    .map(([key, { value, pct }]) => ({
      name: view === 'type' ? (INVESTMENT_TYPE_MAP[key] || key) : key,
      value,
      pct,
    }))
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-card-foreground">Asset Allocation</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setView('type')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              view === 'type' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            By Type
          </button>
          <button
            onClick={() => setView('tag')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              view === 'tag' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            By Tag
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [formatCurrency(value), name]}
            contentStyle={{
              backgroundColor: darkMode ? 'hsl(222.2 84% 4.9%)' : 'hsl(0 0% 100%)',
              border: `1px solid ${darkMode ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(214.3 31.8% 91.4%)'}`,
              color: darkMode ? 'hsl(210 40% 98%)' : 'hsl(222.2 84% 4.9%)',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-2 space-y-1">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
            <span className="font-medium text-card-foreground">{formatPercent(entry.pct)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
