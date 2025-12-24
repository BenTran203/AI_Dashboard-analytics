import numpy as np
from typing import Dict, List, Any
from scipy import stats


class AnalyticsService:
    """
    Service for trend detection, anomaly detection, and forecasting
    """
    
    def detect_trends(self, metrics: Any) -> Dict[str, Any]:
        """
        Detect trends in revenue and orders
        """
        daily_sales = metrics.dailySales
        
        if len(daily_sales) < 2:
            return {
                "revenueTrend": "insufficient_data",
                "ordersTrend": "insufficient_data",
                "trendStrength": 0
            }
        
        # Extract revenue and orders data
        revenues = [day.revenue for day in daily_sales]
        orders = [day.orders for day in daily_sales]
        x = np.arange(len(revenues))
        
        # Calculate linear regression for revenue
        revenue_slope, revenue_intercept, revenue_r, _, _ = stats.linregress(x, revenues)
        
        # Calculate linear regression for orders
        orders_slope, orders_intercept, orders_r, _, _ = stats.linregress(x, orders)
        
        # Determine trend direction
        revenue_trend = "increasing" if revenue_slope > 0 else "decreasing" if revenue_slope < 0 else "stable"
        orders_trend = "increasing" if orders_slope > 0 else "decreasing" if orders_slope < 0 else "stable"
        
        # Calculate recent momentum (last 7 days vs previous period)
        mid_point = len(revenues) // 2
        recent_avg_revenue = np.mean(revenues[mid_point:]) if len(revenues) > mid_point else np.mean(revenues)
        earlier_avg_revenue = np.mean(revenues[:mid_point]) if len(revenues) > mid_point else np.mean(revenues)
        momentum = ((recent_avg_revenue - earlier_avg_revenue) / earlier_avg_revenue * 100) if earlier_avg_revenue > 0 else 0
        
        return {
            "revenueTrend": revenue_trend,
            "ordersTrend": orders_trend,
            "revenueSlope": float(revenue_slope),
            "ordersSlope": float(orders_slope),
            "trendStrength": abs(float(revenue_r)),
            "momentum": float(momentum),
            "correlation": float(revenue_r)
        }
    
    def detect_anomalies(self, metrics: Any) -> Dict[str, Any]:
        """
        Detect anomalies in sales data using statistical methods
        """
        daily_sales = metrics.dailySales
        
        if len(daily_sales) < 5:
            return {
                "hasAnomalies": False,
                "anomalousDays": [],
                "totalAnomalies": 0
            }
        
        revenues = [day.revenue for day in daily_sales]
        dates = [day.date for day in daily_sales]
        
        # Calculate z-scores
        mean_revenue = np.mean(revenues)
        std_revenue = np.std(revenues)
        
        anomalies = []
        
        if std_revenue > 0:
            z_scores = [(r - mean_revenue) / std_revenue for r in revenues]
            
            # Flag days with |z-score| > 2 as anomalies
            for i, z in enumerate(z_scores):
                if abs(z) > 2:
                    anomalies.append({
                        "date": dates[i],
                        "revenue": revenues[i],
                        "deviation": float(z),
                        "type": "spike" if z > 0 else "drop"
                    })
        
        return {
            "hasAnomalies": len(anomalies) > 0,
            "anomalousDays": anomalies,
            "totalAnomalies": len(anomalies),
            "meanRevenue": float(mean_revenue),
            "stdDeviation": float(std_revenue)
        }
    
    def simple_forecast(self, metrics: Any) -> Dict[str, Any]:
        """
        Generate simple forecast for next 7 days using linear regression
        """
        daily_sales = metrics.dailySales
        
        if len(daily_sales) < 3:
            return {
                "nextWeekRevenue": 0,
                "nextWeekOrders": 0,
                "confidence": "low"
            }
        
        revenues = [day.revenue for day in daily_sales]
        orders = [day.orders for day in daily_sales]
        x = np.arange(len(revenues))
        
        # Fit linear regression
        revenue_slope, revenue_intercept, revenue_r, _, _ = stats.linregress(x, revenues)
        orders_slope, orders_intercept, orders_r, _, _ = stats.linregress(x, orders)
        
        # Forecast next 7 days
        forecast_days = 7
        forecast_x = np.arange(len(revenues), len(revenues) + forecast_days)
        
        forecast_revenues = [revenue_slope * x + revenue_intercept for x in forecast_x]
        forecast_orders = [orders_slope * x + orders_intercept for x in forecast_x]
        
        # Ensure non-negative values
        forecast_revenues = [max(0, r) for r in forecast_revenues]
        forecast_orders = [max(0, int(o)) for o in forecast_orders]
        
        total_forecast_revenue = sum(forecast_revenues)
        total_forecast_orders = sum(forecast_orders)
        
        # Determine confidence based on R-squared
        confidence = "high" if abs(revenue_r) > 0.7 else "medium" if abs(revenue_r) > 0.4 else "low"
        
        return {
            "nextWeekRevenue": float(total_forecast_revenue),
            "nextWeekOrders": int(total_forecast_orders),
            "dailyForecast": [
                {"day": i + 1, "revenue": float(r), "orders": int(o)}
                for i, (r, o) in enumerate(zip(forecast_revenues, forecast_orders))
            ],
            "confidence": confidence,
            "rSquared": float(revenue_r ** 2)
        }

