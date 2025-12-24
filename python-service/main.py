from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn
from services.analytics_service import AnalyticsService
from services.insights_generator import InsightsGenerator
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AI Sales Analytics Service",
    description="Python FastAPI microservice for AI-powered sales insights",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
analytics_service = AnalyticsService()
insights_generator = InsightsGenerator()


# Request/Response Models
class MetricsSummary(BaseModel):
    totalRevenue: float
    totalOrders: int
    averageOrderValue: float
    previousPeriodRevenue: float
    previousPeriodOrders: int
    revenueGrowth: float
    ordersGrowth: float


class TopProduct(BaseModel):
    id: str
    name: str
    category: str
    revenue: float
    unitsSold: int
    orders: int


class DailySales(BaseModel):
    date: str
    revenue: float
    orders: int


class FunnelData(BaseModel):
    stage: str
    value: int
    percentage: float


class AggregatedMetrics(BaseModel):
    period: Dict[str, Any]
    summary: MetricsSummary
    topProducts: List[TopProduct]
    dailySales: List[DailySales]
    funnel: List[FunnelData]
    trends: Dict[str, List[Dict[str, Any]]]


class InsightRequest(BaseModel):
    metrics: AggregatedMetrics
    periodType: str  # 'weekly' or 'monthly'
    language: str  # 'en' or 'vi'


class InsightResponse(BaseModel):
    summary: str
    keyDrivers: List[str]
    risks: List[str]
    recommendations: List[str]


@app.get("/")
async def root():
    return {
        "service": "AI Sales Analytics Service",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "openai_configured": bool(os.getenv("OPENAI_API_KEY"))
    }


@app.post("/generate-insights", response_model=InsightResponse)
async def generate_insights(request: InsightRequest):
    """
    Generate AI-powered insights from aggregated metrics
    """
    try:
        # Detect trends in the data
        trends = analytics_service.detect_trends(request.metrics)
        
        # Detect anomalies
        anomalies = analytics_service.detect_anomalies(request.metrics)
        
        # Generate forecasts
        forecast = analytics_service.simple_forecast(request.metrics)
        
        # Generate AI insights using OpenAI
        insights = await insights_generator.generate_insights(
            metrics=request.metrics,
            trends=trends,
            anomalies=anomalies,
            forecast=forecast,
            period_type=request.periodType,
            language=request.language
        )
        
        return insights
        
    except Exception as e:
        print(f"Error generating insights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")


@app.post("/analyze-trends")
async def analyze_trends(metrics: AggregatedMetrics):
    """
    Analyze trends in the sales data
    """
    try:
        trends = analytics_service.detect_trends(metrics)
        return {"success": True, "trends": trends}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect-anomalies")
async def detect_anomalies(metrics: AggregatedMetrics):
    """
    Detect anomalies in sales data
    """
    try:
        anomalies = analytics_service.detect_anomalies(metrics)
        return {"success": True, "anomalies": anomalies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/forecast")
async def forecast(metrics: AggregatedMetrics):
    """
    Generate simple sales forecast
    """
    try:
        forecast_data = analytics_service.simple_forecast(metrics)
        return {"success": True, "forecast": forecast_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

