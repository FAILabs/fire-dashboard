export const STORAGE_KEYS = {
  INVESTMENTS: 'fire-investments',
  CALCULATOR_RESULTS: 'fire-calculator-results',
}

export const INVESTMENT_TYPES = [
  { value: 'stock', label: 'Individual Stock' },
  { value: 'etf', label: 'ETF' },
  { value: 'index_fund', label: 'Index Fund' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'bond', label: 'Bond / Fixed Income' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'real_estate', label: 'Real Estate / REIT' },
  { value: 'other', label: 'Other' },
]

export const INVESTMENT_TYPE_MAP = Object.fromEntries(
  INVESTMENT_TYPES.map((t) => [t.value, t.label])
)

export const RISK_TIERS = {
  stock: 'high',
  etf: 'medium',
  index_fund: 'medium',
  mutual_fund: 'medium',
  bond: 'low',
  crypto: 'high',
  real_estate: 'medium',
  other: 'medium',
}

export const RISK_LABELS = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
}

export const RISK_COLORS = {
  low: 'hsl(142 76% 36%)',
  medium: 'hsl(48 96% 53%)',
  high: 'hsl(0 84% 60%)',
}

export const CHART_COLORS = [
  'hsl(221.2 83.2% 53.3%)',  // blue (primary)
  'hsl(142 76% 36%)',         // green
  'hsl(280 68% 60%)',         // purple
  'hsl(24 95% 53%)',          // orange
  'hsl(348 83% 47%)',         // red
  'hsl(187 85% 43%)',         // teal
  'hsl(48 96% 53%)',          // yellow
  'hsl(316 73% 52%)',         // pink
  'hsl(168 76% 36%)',         // emerald
  'hsl(262 83% 58%)',         // violet
]

export const DEFAULT_RETURNS_BY_TYPE = {
  stock: 10.0,
  etf: 8.0,
  index_fund: 8.0,
  mutual_fund: 7.0,
  bond: 4.0,
  crypto: 15.0,
  real_estate: 8.0,
  other: 7.0,
}

export const API_BASE_URL = 'http://localhost:8000'

export const DEFAULT_PROJECTION_YEARS = 30
export const DEFAULT_EXPECTED_RETURN = 7.0
