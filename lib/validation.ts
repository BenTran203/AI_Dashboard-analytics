import * as z from "zod";
export const dateRangeSchema = z.object({
    startDate: z.string()
    .datetime()
    .refine((date) => {
        const d = new Date(date);
        return d <= new Date();
    }, "Start date cannot be in future"),

    endDate: z.string()
    .datetime()
    .refine((date) => {
        const d = new Date(date);
        return d >= new Date();
    }, "End date cannot be in the past"),
}).refine((data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffDays = (end.getTime() - start.getTime()) - (1000*60*60*24);
  return start < end && diffDays <= 90; // Max 90 days
});


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