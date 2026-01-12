import { NextRequest, NextResponse } from 'next/server';
import { MetricsService } from '@/lib/metricsService';
import { dateRangeSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseDateParam(value: string | null, kind: 'start' | 'end'): Date | null {
  if (!value) return null;

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const parsed = isDateOnly
    ? new Date(kind === 'end' ? `${value}T23:59:59.999Z` : `${value}T00:00:00.000Z`)
    : new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const parsedStartDate = parseDateParam(startDateParam, 'start');
    const parsedEndDate = parseDateParam(endDateParam, 'end');

    if ((startDateParam && !parsedStartDate) || (endDateParam && !parsedEndDate)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date range',
          details: ['startDate/endDate must be a valid ISO date or YYYY-MM-DD'],
        },
        { status: 400 }
      );
    }

    // Default to last 30 days if not specified
    const endDate = parsedEndDate ?? new Date();
    const startDate = parsedStartDate ?? new Date();

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

