import { useState, useMemo } from 'react'
import InvestmentCard from './InvestmentCard'
import { Select } from '../ui/select'

const SORT_OPTIONS = [
  { value: 'value_desc', label: 'Value (High to Low)' },
  { value: 'value_asc', label: 'Value (Low to High)' },
  { value: 'gain_desc', label: 'Gain % (High to Low)' },
  { value: 'gain_asc', label: 'Gain % (Low to High)' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'contribution_desc', label: 'Monthly Contribution (High to Low)' },
]

export default function InvestmentList({ investments, onSelect, onEdit, onDelete, selectedId }) {
  const [sortBy, setSortBy] = useState('value_desc')
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const types = useMemo(() => {
    const unique = new Set(investments.map((inv) => inv.type))
    return Array.from(unique)
  }, [investments])

  const sortedInvestments = useMemo(() => {
    let filtered = [...investments]

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((inv) => inv.type === filterType)
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (inv) =>
          inv.ticker.toLowerCase().includes(q) ||
          inv.name.toLowerCase().includes(q) ||
          inv.tags.some((t) => t.includes(q))
      )
    }

    // Sort
    const getValue = (inv) => inv.currentShares * inv.currentPricePerShare
    const getGainPct = (inv) => {
      const cost = inv.currentShares * inv.costBasisPerShare
      return cost > 0 ? ((getValue(inv) - cost) / cost) * 100 : 0
    }

    switch (sortBy) {
      case 'value_desc':
        filtered.sort((a, b) => getValue(b) - getValue(a))
        break
      case 'value_asc':
        filtered.sort((a, b) => getValue(a) - getValue(b))
        break
      case 'gain_desc':
        filtered.sort((a, b) => getGainPct(b) - getGainPct(a))
        break
      case 'gain_asc':
        filtered.sort((a, b) => getGainPct(a) - getGainPct(b))
        break
      case 'name_asc':
        filtered.sort((a, b) => (a.ticker || a.name).localeCompare(b.ticker || b.name))
        break
      case 'contribution_desc':
        filtered.sort((a, b) => (b.monthlyContribution || 0) - (a.monthlyContribution || 0))
        break
    }

    return filtered
  }, [investments, sortBy, filterType, searchQuery])

  return (
    <div>
      {/* Filter Controls */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by ticker, name, or tag..."
          className="min-w-[200px] flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-auto min-w-[140px]"
        >
          <option value="all">All Types</option>
          {types.map((type) => (
            <option key={type} value={type}>{type.replace('_', ' ')}</option>
          ))}
        </Select>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-auto min-w-[180px]"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
      </div>

      {/* Investment Cards */}
      <div className="space-y-3">
        {sortedInvestments.map((inv) => (
          <InvestmentCard
            key={inv.id}
            investment={inv}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            isSelected={inv.id === selectedId}
          />
        ))}
        {sortedInvestments.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No investments match your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
