import { useState, useCallback } from 'react'
import { API_BASE_URL, DEFAULT_PROJECTION_YEARS } from '../lib/constants'

export function useProjection() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const projectInvestment = useCallback(async (investment, projectionYears = DEFAULT_PROJECTION_YEARS) => {
    setLoading(true)
    setError(null)
    try {
      const currentValue = investment.currentShares * investment.currentPricePerShare
      const res = await fetch(`${API_BASE_URL}/project-investment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_value: currentValue,
          monthly_contribution: investment.monthlyContribution || 0,
          expected_annual_return: investment.expectedAnnualReturn || 7.0,
          projection_years: projectionYears,
        }),
      })
      if (!res.ok) throw new Error('Projection calculation failed')
      const data = await res.json()
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const projectPortfolio = useCallback(async (investments, projectionYears = DEFAULT_PROJECTION_YEARS) => {
    setLoading(true)
    setError(null)
    try {
      const investmentInputs = investments.map((inv) => ({
        current_value: inv.currentShares * inv.currentPricePerShare,
        monthly_contribution: inv.monthlyContribution || 0,
        expected_annual_return: inv.expectedAnnualReturn || 7.0,
        projection_years: projectionYears,
        name: inv.ticker || inv.name,
      }))
      const res = await fetch(`${API_BASE_URL}/project-portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investments: investmentInputs,
          projection_years: projectionYears,
        }),
      })
      if (!res.ok) throw new Error('Portfolio projection failed')
      const data = await res.json()
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { projectInvestment, projectPortfolio, loading, error }
}
