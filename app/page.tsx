'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Package, Calendar } from 'lucide-react';
import MetricCard from './components/MetricCard';
import SalesChart from './components/SalesChart';
import TopProductsTable from './components/TopProductsTable';
import SalesFunnel from './components/SalesFunnel';
import AIInsightsPanel from './components/AIInsightsPanel';
import axios from 'axios';
import { format, subDays } from 'date-fns';

interface MetricsData {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueGrowth: number;
    ordersGrowth: number;
  };
  topProducts: any[];
  dailySales: any[];
  funnel: any[];
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/metrics', {
        params: dateRange,
      });

      if (response.data.success) {
        setMetrics(response.data.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchMetrics}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Sales Analyst Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                {format(new Date(metrics.period.startDate), 'MMM dd, yyyy')} - {format(new Date(metrics.period.endDate), 'MMM dd, yyyy')}
              </p>
            </div>
            
            {/* Date Range Selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <label className="text-sm text-gray-600">From:</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">To:</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={metrics.summary.totalRevenue}
            change={metrics.summary.revenueGrowth}
            format="currency"
            icon={<DollarSign className="w-5 h-5" />}
          />
          <MetricCard
            title="Total Orders"
            value={metrics.summary.totalOrders}
            change={metrics.summary.ordersGrowth}
            icon={<ShoppingCart className="w-5 h-5" />}
          />
          <MetricCard
            title="Average Order Value"
            value={metrics.summary.averageOrderValue}
            format="currency"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <MetricCard
            title="Products Sold"
            value={metrics.topProducts.reduce((sum, p) => sum + p.unitsSold, 0)}
            icon={<Package className="w-5 h-5" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SalesChart data={metrics.dailySales} />
          </div>
          <div className="lg:col-span-1">
            <SalesFunnel data={metrics.funnel} />
          </div>
        </div>

        {/* Top Products */}
        <div className="mb-8">
          <TopProductsTable products={metrics.topProducts} />
        </div>

        {/* AI Insights Panel */}
        <div>
          <AIInsightsPanel 
            startDate={dateRange.startDate} 
            endDate={dateRange.endDate} 
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            AI Sales Analyst Dashboard © 2025 | Powered by OpenAI & FastAPI
          </p>
        </div>
      </footer>
    </div>
  );
}

