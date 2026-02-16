from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

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

@app.get("/")
def read_root():
    return {"message": "FI/RE Dashboard API"}

@app.post("/calculate", response_model=FireMetrics)
def calculate_fire(input_data: FireInput):
    """Calculate FI/RE metrics"""
    return calculate_fire_metrics(input_data)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
