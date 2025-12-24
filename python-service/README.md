# Python FastAPI Microservice

AI-powered analytics and insights generation service.

## Features

- **Trend Detection**: Identifies revenue and order trends using linear regression
- **Anomaly Detection**: Flags unusual sales days using statistical methods
- **Forecasting**: Simple 7-day revenue and order predictions
- **AI Insights**: OpenAI GPT-4 powered insights generation
- **Multi-language**: English and Vietnamese support

## Requirements

- Python 3.9+
- OpenAI API key

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env` file:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Run the Service

```bash
python main.py
```

The service will start on **http://localhost:8000**

## API Endpoints

### Health Check

```
GET /health
```

Returns service status and configuration.

### Generate AI Insights

```
POST /generate-insights
Content-Type: application/json

{
  "metrics": { ... },
  "periodType": "weekly",
  "language": "en"
}
```

Returns comprehensive AI analysis with:
- Summary
- Key drivers
- Risks
- Recommendations

### Analyze Trends

```
POST /analyze-trends
Content-Type: application/json

{
  "metrics": { ... }
}
```

Returns trend analysis using statistical methods.

### Detect Anomalies

```
POST /detect-anomalies
Content-Type: application/json

{
  "metrics": { ... }
}
```

Returns anomalous days in sales data.

### Forecast

```
POST /forecast
Content-Type: application/json

{
  "metrics": { ... }
}
```

Returns 7-day sales forecast.

## API Documentation

Interactive API docs available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Architecture

```
python-service/
├── main.py                      # FastAPI application
├── services/
│   ├── analytics_service.py     # Statistical analysis
│   └── insights_generator.py    # OpenAI integration
├── requirements.txt             # Dependencies
└── .env                         # Configuration
```

## Services

### AnalyticsService

Provides statistical analysis:

- **detect_trends()**: Linear regression for trend analysis
- **detect_anomalies()**: Z-score based anomaly detection
- **simple_forecast()**: Linear forecasting for next 7 days

### InsightsGenerator

Generates AI insights using OpenAI:

- Structured prompt engineering
- Multi-language support
- Fallback insights if API fails
- JSON response parsing

## Error Handling

- Returns HTTP 500 with error details on failures
- Falls back to rule-based insights if OpenAI fails
- Validates all inputs using Pydantic models

## Development

### Add New Endpoint

```python
@app.post("/my-endpoint")
async def my_endpoint(request: MyRequest):
    # Your logic here
    return {"result": "success"}
```

### Run with Auto-reload

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Test Endpoint

```bash
curl -X POST http://localhost:8000/health
```

## Production Considerations

- Use environment-specific API keys
- Enable CORS only for trusted origins
- Add rate limiting
- Implement proper logging
- Use connection pooling for database
- Deploy with gunicorn or similar

## Troubleshooting

### ModuleNotFoundError

```bash
pip install --upgrade -r requirements.txt
```

### OpenAI API Error

- Verify API key is valid
- Check credit balance
- Ensure key has proper permissions

### Port Already in Use

```bash
# Change port in main.py
port = int(os.getenv("PORT", 8001))  # Use 8001 instead
```

## License

MIT

