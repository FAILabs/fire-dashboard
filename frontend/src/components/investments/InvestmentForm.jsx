import { useState } from 'react'
import { Select } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { InfoTooltip } from '../ui/info-tooltip'
import TagManager from './TagManager'
import TickerAutocomplete from './TickerAutocomplete'
import { INVESTMENT_TYPES, DEFAULT_EXPECTED_RETURN, DEFAULT_RETURNS_BY_TYPE, API_BASE_URL } from '../../lib/constants'

const FIELD_TOOLTIPS = {
  ticker: "The stock exchange symbol (e.g., VTI, AAPL, GOOGL). Used to look up real-time price data.",
  name: "A descriptive name for this investment, e.g., 'Vanguard Total Stock Market ETF'.",
  type: "The category of investment. Affects risk classification and default expected return.",
  currentShares: "The number of shares or units you currently hold in this investment.",
  costBasisPerShare: "The average price you paid per share. Used to calculate unrealized gains and losses.",
  currentPricePerShare: "The current market price per share. Select a ticker to auto-fill from market data.",
  monthlyContribution: "How much you plan to invest in this holding each month. Used for growth projections.",
  expectedAnnualReturn: "The annual growth rate you expect, as a percentage. Historical S&P 500 average is ~10% nominal, ~7% real.",
  tags: "Custom labels to organize investments (e.g., 'retirement', 'taxable', 'growth'). Type and press Enter to add.",
  notes: "Any personal notes or reminders about this investment.",
}

const emptyInvestment = {
  ticker: '',
  name: '',
  type: 'etf',
  currentShares: 0,
  costBasisPerShare: 0,
  currentPricePerShare: 0,
  monthlyContribution: 0,
  expectedAnnualReturn: DEFAULT_EXPECTED_RETURN,
  tags: [],
  notes: '',
  lastPriceUpdate: null,
}

export default function InvestmentForm({ investment, tags, onSave, onAddTag, onCancel }) {
  const [form, setForm] = useState(investment ? { ...emptyInvestment, ...investment } : emptyInvestment)
  const [fetchingPrice, setFetchingPrice] = useState(false)

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'number' ? (parseFloat(value) || 0) : value,
      }
      if (name === 'type' && DEFAULT_RETURNS_BY_TYPE[value] !== undefined) {
        updated.expectedAnnualReturn = DEFAULT_RETURNS_BY_TYPE[value]
      }
      return updated
    })
  }

  const fetchQuote = async (ticker) => {
    if (!ticker) return
    setFetchingPrice(true)
    try {
      const res = await fetch(`${API_BASE_URL}/stock-quote/${encodeURIComponent(ticker)}`)
      if (res.ok) {
        const data = await res.json()
        setForm(prev => ({
          ...prev,
          name: data.name || prev.name,
          currentPricePerShare: data.price || prev.currentPricePerShare,
          lastPriceUpdate: new Date().toISOString(),
        }))
      }
    } catch {
      // Silently fail -- user can still enter price manually
    } finally {
      setFetchingPrice(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.ticker.trim() && !form.name.trim()) return
    onSave({
      ...form,
      ticker: form.ticker.trim().toUpperCase(),
      name: form.name.trim(),
    })
  }

  const currentValue = form.currentShares * form.currentPricePerShare
  const costBasis = form.currentShares * form.costBasisPerShare
  const gainLoss = currentValue - costBasis
  const gainLossPct = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="mb-4 text-lg font-semibold text-card-foreground">
        {investment ? 'Edit Investment' : 'Add Investment'}
      </h3>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {/* Ticker & Name */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 flex items-center text-sm font-medium text-muted-foreground">Ticker / Symbol<InfoTooltip text={FIELD_TOOLTIPS.ticker} /></label>
            <TickerAutocomplete
              value={form.ticker}
              onChange={(val) => setForm(prev => ({ ...prev, ticker: val.toUpperCase() }))}
              onSelect={(result) => {
                setForm(prev => ({
                  ...prev,
                  ticker: result.symbol,
                  name: result.name || prev.name,
                }))
                fetchQuote(result.symbol)
              }}
            />
          </div>
          <div>
            <label className="mb-1 flex items-center text-sm font-medium text-muted-foreground">Investment Name<InfoTooltip text={FIELD_TOOLTIPS.name} /></label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Vanguard Total Stock Market"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="mb-1 flex items-center text-sm font-medium text-muted-foreground">Investment Type<InfoTooltip text={FIELD_TOOLTIPS.type} /></label>
          <Select name="type" value={form.type} onChange={handleChange}>
            {INVESTMENT_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>

        {/* Shares & Prices */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 flex items-center text-sm font-medium text-muted-foreground">Current Shares<InfoTooltip text={FIELD_TOOLTIPS.currentShares} /></label>
            <input
              type="number"
              name="currentShares"
              value={form.currentShares || ''}
              onChange={handleChange}
              step="any"
              min="0"
              placeholder="0"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 flex items-center text-sm font-medium text-muted-foreground">Cost Basis / Share<InfoTooltip text={FIELD_TOOLTIPS.costBasisPerShare} /></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                name="costBasisPerShare"
                value={form.costBasisPerShare || ''}
                onChange={handleChange}
                step="any"
                min="0"
                placeholder="0.00"
                className="w-full rounded-md border border-input bg-background pl-7 pr-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 flex items-center text-sm font-medium text-muted-foreground">
              Current Price / Share<InfoTooltip text={FIELD_TOOLTIPS.currentPricePerShare} />
              {fetchingPrice && <span className="ml-2 text-xs text-primary">Fetching...</span>}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                name="currentPricePerShare"
                value={form.currentPricePerShare || ''}
                onChange={handleChange}
                step="any"
                min="0"
                placeholder="0.00"
                className="w-full rounded-md border border-input bg-background pl-7 pr-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Live Preview */}
        {form.currentShares > 0 && form.currentPricePerShare > 0 && (
          <div className="rounded-md bg-muted/50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Value</span>
              <span className="font-medium text-card-foreground">${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            {costBasis > 0 && (
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Unrealized Gain/Loss</span>
                <span className={`font-medium ${gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {gainLoss >= 0 ? '+' : ''}{gainLoss.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} ({gainLossPct >= 0 ? '+' : ''}{gainLossPct.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Monthly Contribution & Expected Return */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 flex items-center text-sm font-medium text-muted-foreground">Monthly Contribution<InfoTooltip text={FIELD_TOOLTIPS.monthlyContribution} /></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                name="monthlyContribution"
                value={form.monthlyContribution || ''}
                onChange={handleChange}
                step="any"
                min="0"
                placeholder="0"
                className="w-full rounded-md border border-input bg-background pl-7 pr-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 flex items-center text-sm font-medium text-muted-foreground">Expected Annual Return<InfoTooltip text={FIELD_TOOLTIPS.expectedAnnualReturn} /></label>
            <div className="relative">
              <input
                type="number"
                name="expectedAnnualReturn"
                value={form.expectedAnnualReturn || ''}
                onChange={handleChange}
                step="any"
                placeholder="7.0"
                className="w-full rounded-md border border-input bg-background px-3 pr-8 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1 flex items-center text-sm font-medium text-muted-foreground">Tags<InfoTooltip text={FIELD_TOOLTIPS.tags} /></label>
          <TagManager
            selectedTags={form.tags}
            availableTags={tags}
            onChange={(newTags) => setForm((prev) => ({ ...prev, tags: newTags }))}
            onAddTag={onAddTag}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 flex items-center text-sm font-medium text-muted-foreground">Notes (optional)<InfoTooltip text={FIELD_TOOLTIPS.notes} /></label>
          <Textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Any notes about this investment..."
            rows={2}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90 transition-colors"
        >
          {investment ? 'Save Changes' : 'Add Investment'}
        </button>
      </div>
    </form>
  )
}
