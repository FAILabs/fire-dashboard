# FI/RE Dashboard 🔥💰

A Financial Independence / Retire Early (FI/RE) calculator with a Python FastAPI backend and React frontend using shadcn/ui components.

## Features

- 📊 Calculate your FI/RE number based on expenses and withdrawal rate
- 📈 Visualize portfolio growth over time
- 💰 Track contributions vs investment growth
- 🎯 Project years to financial independence
- 📱 Beautiful, responsive UI with shadcn/ui components
- 🐍 Python FastAPI backend for calculations

## Tech Stack

### Backend
- Python 3.8+
- FastAPI
- Pydantic for data validation
- Uvicorn ASGI server

### Frontend
- React 18
- Vite
- shadcn/ui components
- Tailwind CSS
- Recharts for visualizations

## Project Structure

```
fire-dashboard/
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ui/          # shadcn/ui components
    │   ├── App.jsx          # Main dashboard component
    │   └── main.jsx         # React entry point
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd fire-dashboard/backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd fire-dashboard/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. Start both the backend (port 8000) and frontend (port 5173)
2. Open your browser to `http://localhost:5173`
3. Enter your financial information:
   - Current age and savings
   - Annual income and expenses
   - Savings rate (%)
   - Expected investment return (%)
   - Withdrawal rate (typically 4%)
4. Click "Calculate FI/RE" to see your results

## API Endpoints

### `POST /calculate`
Calculate FI/RE metrics based on input parameters.

**Request Body:**
```json
{
  "current_age": 30,
  "retirement_age": 65,
  "current_savings": 50000,
  "annual_income": 80000,
  "annual_expenses": 40000,
  "savings_rate": 30,
  "expected_return": 7,
  "withdrawal_rate": 4
}
```

**Response:**
```json
{
  "fire_number": 1000000,
  "years_to_fire": 15.5,
  "retirement_age_projection": 45.5,
  "monthly_savings": 2000,
  "total_at_retirement": 1050000,
  "safe_withdrawal_amount": 42000,
  "yearly_projections": [...]
}
```

### `GET /health`
Health check endpoint.

## How It Works

### FI/RE Calculation

1. **FI/RE Number**: Annual expenses ÷ Withdrawal rate (%)
   - Based on the 4% rule (Trinity Study)
   - Example: $40,000 expenses ÷ 0.04 = $1,000,000

2. **Years to FI/RE**: Calculated using compound interest formula
   - Accounts for current savings, annual contributions, and expected returns
   - Iterates year by year until target is reached

3. **Safe Withdrawal Amount**: Total portfolio × Withdrawal rate (%)
   - The amount you can safely withdraw each year in retirement

## Customization

### Adjusting Default Values
Edit the `formData` state in `frontend/src/App.jsx`:

```javascript
const [formData, setFormData] = useState({
  current_age: 30,
  retirement_age: 65,
  current_savings: 50000,
  annual_income: 80000,
  annual_expenses: 40000,
  savings_rate: 30,
  expected_return: 7,
  withdrawal_rate: 4,
});
```

### Adding New Metrics
Add calculations in `backend/main.py` in the `calculate_fire_metrics` function.

## Production Deployment

### Backend
```bash
# Install production dependencies
pip install gunicorn

# Run with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The build output will be in `frontend/dist/` and can be served with any static file server.

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
```

Update the API_URL in `App.jsx` to use this:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project however you'd like!

## Resources

- [FI/RE Movement](https://www.investopedia.com/terms/f/financial-independence-retire-early-fire.asp)
- [The 4% Rule](https://www.investopedia.com/terms/f/four-percent-rule.asp)
- [Trinity Study](https://en.wikipedia.org/wiki/Trinity_study)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
