'use client';

import { useState } from 'react';
import { Sparkles, Calendar, Globe, Loader2, AlertCircle, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface AIInsight {
  summary: string;
  keyDrivers: string[];
  risks: string[];
  recommendations: string[];
}

interface AIInsightsPanelProps {
  startDate: string;
  endDate: string;
}

export default function AIInsightsPanel({ startDate, endDate }: AIInsightsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'vi'>('en');
  const [cached, setCached] = useState(false);

  const generateInsights = async (periodType: 'weekly' | 'monthly') => {
    setLoading(true);
    setError(null);
    setInsights(null);

    try {
      const response = await axios.post('/api/insights', {
        periodType,
        language,
        startDate,
        endDate,
      });

      if (response.data.success) {
        setInsights(response.data.data);
        setCached(response.data.cached);
      } else {
        setError(response.data.error || 'Failed to generate insights');
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900">Ask Your Data</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-500" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'vi')}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => generateInsights('weekly')}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Weekly Analysis
        </button>
        
        <button
          onClick={() => generateInsights('monthly')}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Monthly Analysis
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <span className="ml-3 text-gray-600">Generating AI insights...</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-6 animate-fade-in">
          {cached && (
            <div className="text-xs text-gray-500 italic">
              ℹ️ Showing cached insights (generated within last 24 hours)
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <h4 className="font-semibold text-primary-900">Summary</h4>
            </div>
            <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
          </div>

          {/* Key Drivers */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Key Drivers</h4>
            </div>
            <ul className="space-y-2">
              {insights.keyDrivers.map((driver, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{driver}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risks */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold text-gray-900">Risks & Concerns</h4>
            </div>
            <ul className="space-y-2">
              {insights.risks.map((risk, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Recommended Actions</h4>
            </div>
            <ol className="space-y-2 list-decimal list-inside">
              {insights.recommendations.map((recommendation, index) => (
                <li key={index} className="text-gray-700">
                  {recommendation}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

