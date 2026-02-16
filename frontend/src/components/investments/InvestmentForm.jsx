import { useState } from 'react'
import { Select } from '../ui/select'
import { Textarea } from '../ui/textarea'
import TagManager from './TagManager'
import { INVESTMENT_TYPES, DEFAULT_EXPECTED_RETURN } from '../../lib/constants'

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
}

export default function InvestmentForm({ investment, tags, onSave, onAddTag, onCancel }) {
  const [form, setForm] = useState(investment ? { ...emptyInvestment, ...investment } : emptyInvestment)

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (parseFloat(value) || 0) : value,
    }))
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
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Ticker / Symbol</label>
            <input
              type="text"
              name="ticker"
              value={form.ticker}
              onChange={handleChange}
              placeholder="e.g. VTI, AAPL"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm uppercase placeholder:normal-case focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Investment Name</label>
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
          <label className="mb-1 block text-sm font-medium text-muted-foreground">Investment Type</label>
          <Select name="type" value={form.type} onChange={handleChange}>
            {INVESTMENT_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>

        {/* Shares & Prices */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Current Shares</label>
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
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Cost Basis / Share</label>
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
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Current Price / Share</label>
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
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Monthly Contribution</label>
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
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Expected Annual Return</label>
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
          <label className="mb-1 block text-sm font-medium text-muted-foreground">Tags</label>
          <TagManager
            selectedTags={form.tags}
            availableTags={tags}
            onChange={(newTags) => setForm((prev) => ({ ...prev, tags: newTags }))}
            onAddTag={onAddTag}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">Notes (optional)</label>
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
