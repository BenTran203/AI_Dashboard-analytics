import { NextRequest, NextResponse } from 'next/server';
import { MetricsService } from '@/lib/metricsService';
import { dateRangeSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Default to last 30 days if not specified
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam ? new Date(startDateParam) : new Date();

    if (!startDateParam) {
      startDate.setDate(startDate.getDate() - 30);
    }


    const validation = dateRangeSchema.safeParse({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });


    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date range',
          details: validation.error.issues.map(i => i.message),
        },
        { status: 400 }
      );
    }


    const metricsService = new MetricsService();
    const metrics = await metricsService.getAggregatedMetrics(startDate, endDate);

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

