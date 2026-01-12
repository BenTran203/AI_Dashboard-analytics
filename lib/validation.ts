import * as z from "zod";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function getEndOfTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
}

export const dateRangeSchema = z
  .object({
    startDate: z
      .string()
      .datetime()
      .refine((date) => {
        const parsed = new Date(date);
        return !Number.isNaN(parsed.getTime()) && parsed <= getEndOfTodayUTC();
      }, "Start date cannot be in future"),

    endDate: z
      .string()
      .datetime()
      .refine((date) => {
        const parsed = new Date(date);
        return !Number.isNaN(parsed.getTime()) && parsed <= getEndOfTodayUTC();
      }, "End date cannot be in future"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return false;
      }

      const days = Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY);
      return end >= start && days <= 90; // Max 90 days
    },
    {
      message: "Date range must be valid, with endDate >= startDate and <= 90 days",
    }
  );


export const insightsRequestSchema = z.object({
  periodType: z.enum(['weekly', 'monthly'] as const, {
    message: "Period type must be 'weekly' or 'monthly'",
  }),
  language: z.enum(['en', 'vi'] as const, {
    message: "Language must be 'en' or 'vi'",
  }),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).merge(dateRangeSchema.omit({ startDate: true, endDate: true }));

// Metrics response validation (for frontend)
export const metricsSummarySchema = z.object({
  totalRevenue: z.number().nonnegative(),
  totalOrders: z.number().int().nonnegative(),
  averageOrderValue: z.number().nonnegative(),
  previousPeriodRevenue: z.number().nonnegative(),
  previousPeriodOrders: z.number().int().nonnegative(),
  revenueGrowth: z.number(),
  ordersGrowth: z.number(),
});

export const metricsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    period: z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      days: z.number().positive(),
    }),
    summary: metricsSummarySchema,
    topProducts: z.array(z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
      revenue: z.number().nonnegative(),
      unitsSold: z.number().int().nonnegative(),
      orders: z.number().int().nonnegative(),
    })),
    dailySales: z.array(z.object({
      date: z.string(),
      revenue: z.number().nonnegative(),
      orders: z.number().int().nonnegative(),
    })),
    funnel: z.array(z.object({
      stage: z.string(),
      value: z.number().nonnegative(),
      percentage: z.number().min(0).max(100),
    })),
  }),
});