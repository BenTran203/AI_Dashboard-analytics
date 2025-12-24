// Metrics types
export interface MetricsSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  previousPeriodRevenue: number;
  previousPeriodOrders: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  revenue: number;
  unitsSold: number;
  orders: number;
}

export interface DailySales {
  date: string;
  revenue: number;
  orders: number;
}

export interface FunnelData {
  stage: string;
  value: number;
  percentage: number;
}

export interface AggregatedMetrics {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  summary: MetricsSummary;
  topProducts: TopProduct[];
  dailySales: DailySales[];
  funnel: FunnelData[];
  trends: {
    revenueByDay: { date: string; amount: number }[];
    ordersByDay: { date: string; count: number }[];
  };
}

// AI Insights types
export interface AIInsightRequest {
  metrics: AggregatedMetrics;
  periodType: 'weekly' | 'monthly';
  language: 'en' | 'vi';
}

export interface AIInsightResponse {
  summary: string;
  keyDrivers: string[];
  risks: string[];
  recommendations: string[];
  generatedAt: string;
}

