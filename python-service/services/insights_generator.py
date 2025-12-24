from openai import AsyncOpenAI
import os
import json
from typing import Dict, Any, List


class InsightsGenerator:
    """
    Service for generating AI-powered insights using OpenAI
    """
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        self.client = AsyncOpenAI(api_key=api_key)
    
    async def generate_insights(
        self,
        metrics: Any,
        trends: Dict[str, Any],
        anomalies: Dict[str, Any],
        forecast: Dict[str, Any],
        period_type: str,
        language: str
    ) -> Dict[str, Any]:
        """
        Generate comprehensive AI insights from metrics and analysis
        """
        
        # Prepare context for the LLM
        context = self._prepare_context(metrics, trends, anomalies, forecast, period_type)
        
        # Generate prompt based on language
        prompt = self._build_prompt(context, period_type, language)
        
        try:
            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {
                        "role": "system",
                        "content": self._get_system_prompt(language)
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1500,
                response_format={"type": "json_object"}
            )
            
            # Parse response
            insights_text = response.choices[0].message.content
            insights = json.loads(insights_text)
            
            # Ensure all required fields are present
            return {
                "summary": insights.get("summary", "No summary available"),
                "keyDrivers": insights.get("keyDrivers", [])[:5],  # Max 5
                "risks": insights.get("risks", [])[:5],  # Max 5
                "recommendations": insights.get("recommendations", [])[:3],  # Max 3
            }
            
        except Exception as e:
            print(f"Error calling OpenAI API: {str(e)}")
            # Return fallback insights
            return self._generate_fallback_insights(metrics, trends, language)
    
    def _prepare_context(
        self,
        metrics: Any,
        trends: Dict[str, Any],
        anomalies: Dict[str, Any],
        forecast: Dict[str, Any],
        period_type: str
    ) -> Dict[str, Any]:
        """
        Prepare structured context from metrics and analysis
        """
        return {
            "period": {
                "type": period_type,
                "days": metrics.period["days"],
                "startDate": metrics.period["startDate"],
                "endDate": metrics.period["endDate"]
            },
            "summary": {
                "totalRevenue": metrics.summary.totalRevenue,
                "totalOrders": metrics.summary.totalOrders,
                "averageOrderValue": metrics.summary.averageOrderValue,
                "revenueGrowth": metrics.summary.revenueGrowth,
                "ordersGrowth": metrics.summary.ordersGrowth
            },
            "topProducts": [
                {
                    "name": p.name,
                    "category": p.category,
                    "revenue": p.revenue,
                    "units": p.unitsSold
                }
                for p in metrics.topProducts[:3]
            ],
            "trends": trends,
            "anomalies": anomalies,
            "forecast": forecast
        }
    
    def _get_system_prompt(self, language: str) -> str:
        """
        Get system prompt based on language
        """
        if language == "vi":
            return """Bạn là một chuyên gia phân tích bán hàng AI chuyên nghiệp. 
Nhiệm vụ của bạn là phân tích dữ liệu bán hàng và cung cấp thông tin chi tiết có thể hành động.
Hãy trả lời bằng tiếng Việt với giọng điệu chuyên nghiệp và rõ ràng.
Luôn trả về JSON với các trường: summary, keyDrivers (mảng), risks (mảng), recommendations (mảng tối đa 3 mục)."""
        else:
            return """You are a professional AI sales analyst.
Your task is to analyze sales data and provide actionable insights.
Respond in English with a professional and clear tone.
Always return JSON with fields: summary, keyDrivers (array), risks (array), recommendations (array with max 3 items)."""
    
    def _build_prompt(self, context: Dict[str, Any], period_type: str, language: str) -> str:
        """
        Build the prompt for OpenAI
        """
        context_json = json.dumps(context, indent=2)
        
        if language == "vi":
            return f"""Phân tích dữ liệu bán hàng sau đây cho khoảng thời gian {period_type}:

{context_json}

Vui lòng cung cấp:
1. summary: Tóm tắt hiệu suất tổng thể (2-3 câu)
2. keyDrivers: Mảng các yếu tố chính thúc đẩy doanh số (điều gì hoạt động tốt)
3. risks: Mảng các rủi ro và mối quan ngại (điều gì cần chú ý)
4. recommendations: Mảng tối đa 3 hành động được đề xuất (ưu tiên theo tác động)

Trả về JSON thuần túy, không có markdown hay giải thích thêm."""
        else:
            return f"""Analyze the following sales data for the {period_type} period:

{context_json}

Please provide:
1. summary: Overall performance summary (2-3 sentences)
2. keyDrivers: Array of key factors driving sales (what's working well)
3. risks: Array of risks and concerns (what needs attention)
4. recommendations: Array of max 3 recommended actions (prioritized by impact)

Return pure JSON, no markdown or additional explanation."""
    
    def _generate_fallback_insights(
        self,
        metrics: Any,
        trends: Dict[str, Any],
        language: str
    ) -> Dict[str, Any]:
        """
        Generate basic insights if OpenAI API fails
        """
        revenue = metrics.summary.totalRevenue
        growth = metrics.summary.revenueGrowth
        
        if language == "vi":
            summary = f"Tổng doanh thu là ${revenue:,.2f} với tốc độ tăng trưởng {growth:+.1f}%. "
            summary += "Xu hướng hiện tại cho thấy " + ("hiệu suất tích cực" if growth > 0 else "cần cải thiện") + "."
            
            return {
                "summary": summary,
                "keyDrivers": [
                    f"Tổng doanh thu đạt ${revenue:,.2f}",
                    f"Giá trị đơn hàng trung bình: ${metrics.summary.averageOrderValue:,.2f}"
                ],
                "risks": [
                    "Không thể tạo phân tích chi tiết do lỗi API",
                    "Cần xem xét dữ liệu thủ công"
                ],
                "recommendations": [
                    "Kiểm tra cấu hình API OpenAI",
                    "Xem lại xu hướng doanh số hàng ngày",
                    "Theo dõi sản phẩm bán chạy nhất"
                ]
            }
        else:
            summary = f"Total revenue is ${revenue:,.2f} with a growth rate of {growth:+.1f}%. "
            summary += "Current trends show " + ("positive performance" if growth > 0 else "need for improvement") + "."
            
            return {
                "summary": summary,
                "keyDrivers": [
                    f"Total revenue reached ${revenue:,.2f}",
                    f"Average order value: ${metrics.summary.averageOrderValue:,.2f}"
                ],
                "risks": [
                    "Unable to generate detailed analysis due to API error",
                    "Manual data review recommended"
                ],
                "recommendations": [
                    "Check OpenAI API configuration",
                    "Review daily sales trends",
                    "Monitor top-performing products"
                ]
            }

