import { useState, useCallback } from 'react'
import { API_BASE_URL } from '../lib/constants'

export function useStockQuote() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchQuote = useCallback(async (ticker) => {
    if (!ticker) return null
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/stock-quote/${encodeURIComponent(ticker)}`)
      if (!res.ok) throw new Error(`Failed to fetch quote for ${ticker}`)
      return await res.json()
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchBatchQuotes = useCallback(async (tickers) => {
    if (!tickers || tickers.length === 0) return []
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/stock-quotes-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers }),
      })
      if (!res.ok) throw new Error('Failed to fetch batch quotes')
      const data = await res.json()
      return data.results || []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return { fetchQuote, fetchBatchQuotes, loading, error }
}
