from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import httpx

app = FastAPI(title="FI/RE Dashboard API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FireInput(BaseModel):
    current_age: int
    retirement_age: int
    current_savings: float
    annual_income: float
    annual_expenses: float
    savings_rate: float  # as percentage
    expected_return: float  # as percentage
    withdrawal_rate: float  # as percentage (typically 4%)

class FireMetrics(BaseModel):
    fire_number: float
    years_to_fire: float
    retirement_age_projection: float
    monthly_savings: float
    total_at_retirement: float
    safe_withdrawal_amount: float
    yearly_projections: List[dict]

class InvestmentProjectionInput(BaseModel):
    current_value: float
    monthly_contribution: float
    expected_annual_return: float  # percentage, e.g. 7.0
    projection_years: int = 30

class InvestmentProjectionResult(BaseModel):
    yearly_projections: List[dict]
    final_value: float
    total_contributions: float
    total_growth: float
    cagr: float

class PortfolioInvestmentInput(BaseModel):
    current_value: float
    monthly_contribution: float
    expected_annual_return: float
    projection_years: int = 30
    name: Optional[str] = ""

class PortfolioProjectionInput(BaseModel):
    investments: List[PortfolioInvestmentInput]
    projection_years: int = 30

class PortfolioProjectionResult(BaseModel):
    yearly_projections: List[dict]
    final_total_value: float
    total_contributions: float
    total_growth: float
    portfolio_cagr: float
    per_investment: List[dict]

def calculate_fire_metrics(input_data: FireInput) -> FireMetrics:
    """Calculate FI/RE metrics based on input parameters"""

    # Calculate FI/RE number (annual expenses / withdrawal rate)
    fire_number = input_data.annual_expenses / (input_data.withdrawal_rate / 100)

    # Monthly savings
    monthly_savings = (input_data.annual_income * (input_data.savings_rate / 100)) / 12
    annual_savings = monthly_savings * 12

    # Calculate years to FI/RE using compound interest formula
    current_value = input_data.current_savings
    target_value = fire_number
    annual_return = input_data.expected_return / 100

    # Year-by-year projection
    yearly_projections = []
    years_to_fire = 0
    age = input_data.current_age

    while current_value < target_value and years_to_fire < 100:
        yearly_projections.append({
            "year": years_to_fire,
            "age": age,
            "balance": round(current_value, 2),
            "contributions": round(annual_savings, 2),
            "investment_growth": round(current_value * annual_return, 2)
        })

        # Apply returns and add contributions
        current_value = current_value * (1 + annual_return) + annual_savings
        years_to_fire += 1
        age += 1

    # Add final year
    yearly_projections.append({
        "year": years_to_fire,
        "age": age,
        "balance": round(current_value, 2),
        "contributions": 0,
        "investment_growth": 0
    })

    retirement_age_projection = input_data.current_age + years_to_fire
    safe_withdrawal_amount = current_value * (input_data.withdrawal_rate / 100)

    return FireMetrics(
        fire_number=round(fire_number, 2),
        years_to_fire=round(years_to_fire, 1),
        retirement_age_projection=round(retirement_age_projection, 1),
        monthly_savings=round(monthly_savings, 2),
        total_at_retirement=round(current_value, 2),
        safe_withdrawal_amount=round(safe_withdrawal_amount, 2),
        yearly_projections=yearly_projections
    )

def project_single_investment(input_data: InvestmentProjectionInput) -> InvestmentProjectionResult:
    """Project growth of a single investment with monthly compounding."""
    balance = input_data.current_value
    monthly_return = (input_data.expected_annual_return / 100) / 12
    yearly_projections = []
    total_contributions = input_data.current_value
    initial_value = input_data.current_value

    for year in range(input_data.projection_years + 1):
        yearly_projections.append({
            "year": year,
            "balance": round(balance, 2),
            "contributions_cumulative": round(total_contributions, 2),
            "growth_cumulative": round(balance - total_contributions, 2),
        })
        if year < input_data.projection_years:
            for _ in range(12):
                balance = balance * (1 + monthly_return) + input_data.monthly_contribution
                total_contributions += input_data.monthly_contribution

    final_value = balance
    total_growth = final_value - total_contributions

    # CAGR calculation
    if initial_value > 0 and input_data.projection_years > 0:
        cagr = ((final_value / initial_value) ** (1 / input_data.projection_years) - 1) * 100
    elif total_contributions > 0 and input_data.projection_years > 0:
        cagr = ((final_value / (total_contributions / input_data.projection_years)) ** (1 / input_data.projection_years) - 1) * 100 if total_contributions > 0 else 0
    else:
        cagr = 0

    return InvestmentProjectionResult(
        yearly_projections=yearly_projections,
        final_value=round(final_value, 2),
        total_contributions=round(total_contributions, 2),
        total_growth=round(total_growth, 2),
        cagr=round(cagr, 2),
    )

@app.get("/")
def read_root():
    return {"message": "FI/RE Dashboard API"}

@app.post("/calculate", response_model=FireMetrics)
def calculate_fire(input_data: FireInput):
    """Calculate FI/RE metrics"""
    return calculate_fire_metrics(input_data)

@app.post("/project-investment", response_model=InvestmentProjectionResult)
def project_investment(input_data: InvestmentProjectionInput):
    """Project growth of a single investment over time."""
    return project_single_investment(input_data)

@app.post("/project-portfolio", response_model=PortfolioProjectionResult)
def project_portfolio(input_data: PortfolioProjectionInput):
    """Project growth of entire portfolio with per-investment breakdown."""
    per_investment_results = []

    for inv in input_data.investments:
        proj_input = InvestmentProjectionInput(
            current_value=inv.current_value,
            monthly_contribution=inv.monthly_contribution,
            expected_annual_return=inv.expected_annual_return,
            projection_years=input_data.projection_years,
        )
        result = project_single_investment(proj_input)
        per_investment_results.append({
            "name": inv.name or "Investment",
            "final_value": result.final_value,
            "total_contributions": result.total_contributions,
            "total_growth": result.total_growth,
            "cagr": result.cagr,
            "yearly_projections": result.yearly_projections,
        })

    # Aggregate yearly projections
    num_years = input_data.projection_years + 1
    combined_projections = []
    for year in range(num_years):
        entry = {"year": year, "total_balance": 0}
        for i, inv_result in enumerate(per_investment_results):
            if year < len(inv_result["yearly_projections"]):
                entry["total_balance"] += inv_result["yearly_projections"][year]["balance"]
                entry[inv_result["name"]] = inv_result["yearly_projections"][year]["balance"]
        entry["total_balance"] = round(entry["total_balance"], 2)
        combined_projections.append(entry)

    total_final = sum(r["final_value"] for r in per_investment_results)
    total_contributions = sum(r["total_contributions"] for r in per_investment_results)
    total_growth = total_final - total_contributions

    # Portfolio CAGR
    initial_total = sum(inv.current_value for inv in input_data.investments)
    if initial_total > 0 and input_data.projection_years > 0:
        portfolio_cagr = ((total_final / initial_total) ** (1 / input_data.projection_years) - 1) * 100
    else:
        portfolio_cagr = 0

    return PortfolioProjectionResult(
        yearly_projections=combined_projections,
        final_total_value=round(total_final, 2),
        total_contributions=round(total_contributions, 2),
        total_growth=round(total_growth, 2),
        portfolio_cagr=round(portfolio_cagr, 2),
        per_investment=per_investment_results,
    )

@app.get("/health")
def health_check():
    return {"status": "healthy"}


# --- Stock API Proxy Endpoints ---

class TickerSearchResult(BaseModel):
    symbol: str
    name: str
    type: str
    exchange: str

class TickerSearchResponse(BaseModel):
    results: List[TickerSearchResult]

class StockQuoteResponse(BaseModel):
    symbol: str
    name: str
    price: float
    currency: str
    market_state: str

class BatchQuoteRequest(BaseModel):
    tickers: List[str]

class BatchQuoteResult(BaseModel):
    symbol: str
    name: str
    price: float
    success: bool
    error: Optional[str] = None

class BatchQuoteResponse(BaseModel):
    results: List[BatchQuoteResult]

YAHOO_HEADERS = {"User-Agent": "Mozilla/5.0"}

@app.get("/search-ticker", response_model=TickerSearchResponse)
async def search_ticker(q: str):
    """Search for stock tickers via Yahoo Finance."""
    if not q or len(q.strip()) < 1:
        return TickerSearchResponse(results=[])

    url = "https://query1.finance.yahoo.com/v1/finance/search"
    params = {
        "q": q.strip(),
        "quotesCount": 8,
        "newsCount": 0,
        "listsCount": 0,
        "enableFuzzyQuery": False,
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params, headers=YAHOO_HEADERS, timeout=5.0)
            resp.raise_for_status()
            data = resp.json()

        results = []
        for quote in data.get("quotes", []):
            if quote.get("quoteType") in ("EQUITY", "ETF", "MUTUALFUND", "INDEX"):
                results.append(TickerSearchResult(
                    symbol=quote.get("symbol", ""),
                    name=quote.get("shortname") or quote.get("longname", ""),
                    type=quote.get("quoteType", ""),
                    exchange=quote.get("exchange", ""),
                ))

        return TickerSearchResponse(results=results)
    except Exception:
        return TickerSearchResponse(results=[])


async def _fetch_quote(client: httpx.AsyncClient, ticker: str) -> dict:
    """Fetch a single stock quote from Yahoo Finance."""
    url = f"https://query2.finance.yahoo.com/v10/finance/quoteSummary/{ticker.upper()}"
    params = {"modules": "price"}
    resp = await client.get(url, params=params, headers=YAHOO_HEADERS, timeout=5.0)
    resp.raise_for_status()
    data = resp.json()
    price_data = data["quoteSummary"]["result"][0]["price"]
    return {
        "symbol": price_data.get("symbol", ticker.upper()),
        "name": price_data.get("shortName") or price_data.get("longName", ""),
        "price": price_data.get("regularMarketPrice", {}).get("raw", 0),
        "currency": price_data.get("currency", "USD"),
        "market_state": price_data.get("marketState", "CLOSED"),
    }


@app.get("/stock-quote/{ticker}", response_model=StockQuoteResponse)
async def get_stock_quote(ticker: str):
    """Fetch current stock quote from Yahoo Finance."""
    try:
        async with httpx.AsyncClient() as client:
            quote = await _fetch_quote(client, ticker)
        return StockQuoteResponse(**quote)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch quote for {ticker}: {str(e)}")


@app.post("/stock-quotes-batch", response_model=BatchQuoteResponse)
async def get_stock_quotes_batch(request: BatchQuoteRequest):
    """Fetch quotes for multiple tickers."""
    results = []
    async with httpx.AsyncClient() as client:
        for ticker in request.tickers[:20]:
            try:
                quote = await _fetch_quote(client, ticker)
                results.append(BatchQuoteResult(
                    symbol=quote["symbol"],
                    name=quote["name"],
                    price=quote["price"],
                    success=True,
                ))
            except Exception as e:
                results.append(BatchQuoteResult(
                    symbol=ticker.upper(),
                    name="",
                    price=0,
                    success=False,
                    error=str(e),
                ))

    return BatchQuoteResponse(results=results)
