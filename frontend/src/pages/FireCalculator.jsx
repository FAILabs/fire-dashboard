import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTheme } from '../components/ui/ThemeContext'
import { formatCurrency } from '../lib/formatters'
import { API_BASE_URL, STORAGE_KEYS } from '../lib/constants'

const defaultInputs = {
  current_age: 30,
  retirement_age: 65,
  current_savings: 50000,
  annual_income: 80000,
  annual_expenses: 40000,
  savings_rate: 50,
  expected_return: 7,
  withdrawal_rate: 4,
}

export default function FireCalculator() {
  const { darkMode } = useTheme()
  const [inputs, setInputs] = useState(defaultInputs)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
  }

  const handleCalculate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      })
      if (!res.ok) throw new Error('Calculation failed')
      const data = await res.json()
      setResults(data)
      // Save results to localStorage for cross-tab FI/RE integration
      localStorage.setItem(STORAGE_KEYS.CALCULATOR_RESULTS, JSON.stringify({
        ...data,
        inputs,
        calculatedAt: new Date().toISOString(),
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputFields = [
    { name: 'current_age', label: 'Current Age', suffix: 'years' },
    { name: 'retirement_age', label: 'Target Retirement Age', suffix: 'years' },
    { name: 'current_savings', label: 'Current Savings', prefix: '$' },
    { name: 'annual_income', label: 'Annual Income', prefix: '$' },
    { name: 'annual_expenses', label: 'Annual Expenses', prefix: '$' },
    { name: 'savings_rate', label: 'Savings Rate', suffix: '%' },
    { name: 'expected_return', label: 'Expected Return', suffix: '%' },
    { name: 'withdrawal_rate', label: 'Withdrawal Rate', suffix: '%' },
  ]

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Input Form */}
      <div className="lg:col-span-1">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-colors duration-300">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">Your Financial Details</h2>
          <div className="space-y-4">
            {inputFields.map(({ name, label, prefix, suffix }) => (
              <div key={name}>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">{label}</label>
                <div className="relative">
                  {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{prefix}</span>
                  )}
                  <input
                    type="number"
                    name={name}
                    value={inputs[name]}
                    onChange={handleChange}
                    className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-10' : ''}`}
                  />
                  {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{suffix}</span>
                  )}
                </div>
              </div>
            ))}
            <button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Calculating...' : 'Calculate FI/RE Plan'}
            </button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-2 space-y-6">
        {results ? (
          <>
            {/* Metrics Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: 'FI/RE Number', value: formatCurrency(results.fire_number) },
                { label: 'Years to FI/RE', value: results.years_to_fire },
                { label: 'Retirement Age', value: results.retirement_age_projection },
                { label: 'Monthly Savings', value: formatCurrency(results.monthly_savings) },
                { label: 'Total at Retirement', value: formatCurrency(results.total_at_retirement) },
                { label: 'Safe Withdrawal', value: formatCurrency(results.safe_withdrawal_amount) + '/yr' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-border bg-card p-4 shadow-sm transition-colors duration-300">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-card-foreground">{value}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-colors duration-300">
              <h2 className="mb-4 text-lg font-semibold text-card-foreground">Portfolio Growth Projection</h2>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={results.yearly_projections}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={darkMode ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(214.3 31.8% 91.4%)'}
                  />
                  <XAxis
                    dataKey="age"
                    label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
                    stroke={darkMode ? 'hsl(215 20.2% 65.1%)' : 'hsl(215.4 16.3% 46.9%)'}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    stroke={darkMode ? 'hsl(215 20.2% 65.1%)' : 'hsl(215.4 16.3% 46.9%)'}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: darkMode ? 'hsl(222.2 84% 4.9%)' : 'hsl(0 0% 100%)',
                      border: `1px solid ${darkMode ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(214.3 31.8% 91.4%)'}`,
                      color: darkMode ? 'hsl(210 40% 98%)' : 'hsl(222.2 84% 4.9%)',
                      borderRadius: '6px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="hsl(221.2 83.2% 53.3%)"
                    fill="hsl(221.2 83.2% 53.3%)"
                    fillOpacity={0.2}
                    name="Portfolio Balance"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-card transition-colors duration-300">
            <p className="text-muted-foreground">Enter your details and click calculate to see your FI/RE projections.</p>
          </div>
        )}
      </div>
    </div>
  )
}
