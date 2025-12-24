import { prisma } from './prisma';
import { AggregatedMetrics, MetricsSummary, TopProduct, DailySales, FunnelData } from './types';

export class MetricsService {
  /**
   * Calculate aggregated metrics for a given date range
   */
  async getAggregatedMetrics(startDate: Date, endDate: Date): Promise<AggregatedMetrics> {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate previous period for comparison
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);
    const previousEndDate = new Date(startDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);

    // Fetch all necessary data
    const [
      currentOrders,
      previousOrders,
      topProducts,
      dailySales,
    ] = await Promise.all([
      this.getOrdersInRange(startDate, endDate),
      this.getOrdersInRange(previousStartDate, previousEndDate),
      this.getTopProducts(startDate, endDate),
      this.getDailySales(startDate, endDate),
    ]);

    // Calculate summary metrics
    const summary = this.calculateSummary(currentOrders, previousOrders);
    
    // Calculate funnel data
    const funnel = this.calculateFunnel(currentOrders);

    // Prepare trends
    const trends = {
      revenueByDay: dailySales.map(d => ({ date: d.date, amount: d.revenue })),
      ordersByDay: dailySales.map(d => ({ date: d.date, count: d.orders })),
    };

    return {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days,
      },
      summary,
      topProducts,
      dailySales,
      funnel,
      trends,
    };
  }

  /**
   * Get orders within a date range
   */
  private async getOrdersInRange(startDate: Date, endDate: Date) {
    return await prisma.order.findMany({
      where: {
        orderDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'completed',
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Calculate summary metrics
   */
  private calculateSummary(currentOrders: any[], previousOrders: any[]): MetricsSummary {
    const totalRevenue = currentOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = currentOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const previousPeriodRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0);
    const previousPeriodOrders = previousOrders.length;

    const revenueGrowth = previousPeriodRevenue > 0
      ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
      : 0;

    const ordersGrowth = previousPeriodOrders > 0
      ? ((totalOrders - previousPeriodOrders) / previousPeriodOrders) * 100
      : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      previousPeriodRevenue,
      previousPeriodOrders,
      revenueGrowth,
      ordersGrowth,
    };
  }

  /**
   * Get top products by revenue
   */
  private async getTopProducts(startDate: Date, endDate: Date): Promise<TopProduct[]> {
    const result = await prisma.$queryRaw<any[]>`
      SELECT 
        p.id,
        p.name,
        p.category,
        SUM(oi.subtotal) as revenue,
        SUM(oi.quantity) as units_sold,
        COUNT(DISTINCT o.id) as orders
      FROM products p
      INNER JOIN order_items oi ON p.id = oi."productId"
      INNER JOIN orders o ON oi."orderId" = o.id
      WHERE o."orderDate" >= ${startDate}
        AND o."orderDate" <= ${endDate}
        AND o.status = 'completed'
      GROUP BY p.id, p.name, p.category
      ORDER BY revenue DESC
      LIMIT 5
    `;

    return result.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      revenue: parseFloat(row.revenue),
      unitsSold: parseInt(row.units_sold),
      orders: parseInt(row.orders),
    }));
  }

  /**
   * Get daily sales data
   */
  private async getDailySales(startDate: Date, endDate: Date): Promise<DailySales[]> {
    const result = await prisma.$queryRaw<any[]>`
      SELECT 
        DATE(o."orderDate") as date,
        SUM(o.total) as revenue,
        COUNT(o.id) as orders
      FROM orders o
      WHERE o."orderDate" >= ${startDate}
        AND o."orderDate" <= ${endDate}
        AND o.status = 'completed'
      GROUP BY DATE(o."orderDate")
      ORDER BY date ASC
    `;

    return result.map(row => ({
      date: row.date.toISOString().split('T')[0],
      revenue: parseFloat(row.revenue),
      orders: parseInt(row.orders),
    }));
  }

  /**
   * Calculate funnel data
   */
  private calculateFunnel(orders: any[]): FunnelData[] {
    const totalVisitors = orders.length * 10; // Assume 10% conversion
    const cartAdds = orders.length * 3; // Assume 33% add to cart
    const checkoutStarts = orders.length * 1.5; // Assume 50% proceed to checkout
    const completed = orders.length;

    return [
      { stage: 'Visitors', value: totalVisitors, percentage: 100 },
      { stage: 'Add to Cart', value: cartAdds, percentage: (cartAdds / totalVisitors) * 100 },
      { stage: 'Checkout', value: checkoutStarts, percentage: (checkoutStarts / totalVisitors) * 100 },
      { stage: 'Completed', value: completed, percentage: (completed / totalVisitors) * 100 },
    ];
  }
}

