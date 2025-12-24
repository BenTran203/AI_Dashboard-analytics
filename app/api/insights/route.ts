import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MetricsService } from '@/lib/metricsService';
import axios from 'axios';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { periodType, language, startDate, endDate } = body;

    if (!periodType || !language) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: periodType, language' },
        { status: 400 }
      );
    }

    // Parse dates
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date();
    
    if (!startDate) {
      if (periodType === 'weekly') {
        start.setDate(start.getDate() - 7);
      } else {
        start.setDate(start.getDate() - 30);
      }
    }

    // Check if we have a cached insight
    const cached = await prisma.aIInsight.findFirst({
      where: {
        periodType,
        language,
        startDate: {
          gte: new Date(start.getTime() - 60 * 60 * 1000), // Within 1 hour
          lte: new Date(start.getTime() + 60 * 60 * 1000),
        },
        endDate: {
          gte: new Date(end.getTime() - 60 * 60 * 1000),
          lte: new Date(end.getTime() + 60 * 60 * 1000),
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Less than 24 hours old
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached.insights,
        cached: true,
        generatedAt: cached.createdAt,
      });
    }

    // Fetch fresh metrics
    const metricsService = new MetricsService();
    const metrics = await metricsService.getAggregatedMetrics(start, end);

    // Call Python FastAPI service to generate insights
    const response = await axios.post(
      `${PYTHON_API_URL}/generate-insights`,
      {
        metrics,
        periodType,
        language,
      },
      {
        timeout: 30000, // 30 second timeout
      }
    );

    const insights = response.data;

    // Cache the insights
    await prisma.aIInsight.create({
      data: {
        periodType,
        startDate: start,
        endDate: end,
        language,
        insights: insights,
        metricsSnapshot: metrics as any,
      },
    });

    return NextResponse.json({
      success: true,
      data: insights,
      cached: false,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate insights from Python service',
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate insights',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

