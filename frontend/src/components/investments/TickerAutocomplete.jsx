import { useState, useRef, useEffect } from 'react'
import { API_BASE_URL } from '../../lib/constants'

export default function TickerAutocomplete({ value, onChange, onSelect }) {
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  const searchTickers = async (q) => {
    if (!q || q.length < 1) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/search-ticker?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results || [])
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    onChange(val)
    setShowDropdown(true)

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchTickers(val), 300)
  }

  const handleSelect = (result) => {
    setQuery(result.symbol)
    setShowDropdown(false)
    setResults([])
    onSelect(result)
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => { if (results.length > 0) setShowDropdown(true) }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder="e.g. VTI, AAPL"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm uppercase placeholder:normal-case focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
      />
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">...</span>
      )}

      {showDropdown && results.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-card shadow-md">
          {results.map((result) => (
            <button
              key={result.symbol}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(result)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-foreground hover:bg-accent transition-colors"
            >
              <span>
                <span className="font-medium">{result.symbol}</span>
                <span className="ml-2 text-muted-foreground">{result.name}</span>
              </span>
              <span className="ml-2 shrink-0 text-xs text-muted-foreground">{result.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
