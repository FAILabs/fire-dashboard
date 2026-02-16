import { useMemo } from 'react'
import { RISK_TIERS } from '../lib/constants'

export function usePortfolioSummary(investments) {
  return useMemo(() => {
    if (!investments || investments.length === 0) {
      return {
        totalValue: 0,
        totalCostBasis: 0,
        totalMonthlyContribution: 0,
        totalUnrealizedGain: 0,
        totalUnrealizedGainPct: 0,
        allocationByType: {},
        allocationByTag: {},
        riskProfile: { low: 0, medium: 0, high: 0 },
        diversificationScore: 0,
        investmentCount: 0,
      }
    }

    let totalValue = 0
    let totalCostBasis = 0
    let totalMonthlyContribution = 0
    const typeValues = {}
    const tagValues = {}
    const riskValues = { low: 0, medium: 0, high: 0 }

    for (const inv of investments) {
      const value = inv.currentShares * inv.currentPricePerShare
      const cost = inv.currentShares * inv.costBasisPerShare

      totalValue += value
      totalCostBasis += cost
      totalMonthlyContribution += inv.monthlyContribution || 0

      // Allocation by type
      if (!typeValues[inv.type]) typeValues[inv.type] = 0
      typeValues[inv.type] += value

      // Allocation by tag
      for (const tag of inv.tags || []) {
        if (!tagValues[tag]) tagValues[tag] = 0
        tagValues[tag] += value
      }

      // Risk profile
      const risk = RISK_TIERS[inv.type] || 'medium'
      riskValues[risk] += value
    }

    const totalUnrealizedGain = totalValue - totalCostBasis
    const totalUnrealizedGainPct = totalCostBasis > 0
      ? ((totalUnrealizedGain / totalCostBasis) * 100)
      : 0

    // Build allocation objects with percentages
    const allocationByType = {}
    for (const [type, value] of Object.entries(typeValues)) {
      allocationByType[type] = {
        value,
        pct: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }
    }

    const allocationByTag = {}
    for (const [tag, value] of Object.entries(tagValues)) {
      allocationByTag[tag] = {
        value,
        pct: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }
    }

    // Risk profile percentages
    const riskProfile = {
      low: totalValue > 0 ? (riskValues.low / totalValue) * 100 : 0,
      medium: totalValue > 0 ? (riskValues.medium / totalValue) * 100 : 0,
      high: totalValue > 0 ? (riskValues.high / totalValue) * 100 : 0,
    }

    // Diversification score (inverse HHI, scaled 0-100)
    // HHI = sum of squared allocation percentages / 10000
    // Perfect diversification among N assets = 100/N per asset
    const allocPcts = investments.map((inv) => {
      const val = inv.currentShares * inv.currentPricePerShare
      return totalValue > 0 ? (val / totalValue) * 100 : 0
    })
    const hhi = allocPcts.reduce((sum, pct) => sum + pct * pct, 0)
    // HHI ranges from 10000/N (perfect) to 10000 (single asset)
    // Score: 100 when perfectly diversified, 0 when single asset
    const minHHI = investments.length > 0 ? 10000 / investments.length : 10000
    const diversificationScore = investments.length <= 1
      ? 0
      : Math.round(((10000 - hhi) / (10000 - minHHI)) * 100)

    return {
      totalValue,
      totalCostBasis,
      totalMonthlyContribution,
      totalUnrealizedGain,
      totalUnrealizedGainPct,
      allocationByType,
      allocationByTag,
      riskProfile,
      diversificationScore: Math.max(0, Math.min(100, diversificationScore)),
      investmentCount: investments.length,
    }
  }, [investments])
}
