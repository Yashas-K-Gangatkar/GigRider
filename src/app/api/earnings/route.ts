import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/earnings — Get rider's earnings summary (today, week, month breakdowns)
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'all'; // today, week, month, all
    const platform = searchParams.get('platform'); // filter by platform

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Build base where clause
    const baseWhere: Record<string, unknown> = {
      riderId: user.riderId,
    };
    if (platform) baseWhere.platform = platform;

    // Fetch earnings for different periods in parallel
    const [todayEarnings, weekEarnings, monthEarnings, allEarnings, recentEarnings, platformBreakdown, sourceBreakdown] =
      await Promise.all([
        // Today's earnings
        prisma.earning.aggregate({
          where: { ...baseWhere, createdAt: { gte: todayStart } },
          _sum: { amount: true },
          _count: true,
        }),
        // This week's earnings
        prisma.earning.aggregate({
          where: { ...baseWhere, createdAt: { gte: weekStart } },
          _sum: { amount: true },
          _count: true,
        }),
        // This month's earnings
        prisma.earning.aggregate({
          where: { ...baseWhere, createdAt: { gte: monthStart } },
          _sum: { amount: true },
          _count: true,
        }),
        // All-time earnings
        prisma.earning.aggregate({
          where: baseWhere,
          _sum: { amount: true },
          _count: true,
        }),
        // Recent earnings (last 50)
        prisma.earning.findMany({
          where: baseWhere,
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        // Earnings breakdown by platform
        prisma.earning.groupBy({
          by: ['platform'],
          where: { ...baseWhere, createdAt: { gte: monthStart } },
          _sum: { amount: true },
          _count: true,
        }),
        // Earnings breakdown by source
        prisma.earning.groupBy({
          by: ['source'],
          where: { ...baseWhere, createdAt: { gte: monthStart } },
          _sum: { amount: true },
          _count: true,
        }),
      ]);

    // Calculate daily earnings for the week chart
    const dailyEarnings = await prisma.earning.groupBy({
      by: ['createdAt'],
      where: { ...baseWhere, createdAt: { gte: weekStart } },
      _sum: { amount: true },
    });

    // Group daily earnings by day of week
    const dailyMap = new Map<string, number>();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (const entry of dailyEarnings) {
      const date = new Date(entry.createdAt);
      const dayName = dayNames[date.getDay()];
      dailyMap.set(dayName, (dailyMap.get(dayName) || 0) + (entry._sum.amount || 0));
    }

    const weekChartData = dayNames.map((day) => ({
      day,
      amount: dailyMap.get(day) || 0,
    }));

    // Get rider's total stats
    const rider = await prisma.rider.findUnique({
      where: { id: user.riderId },
      select: { totalEarnings: true, totalDeliveries: true },
    });

    // Determine which period to return based on request
    let filteredEarnings = recentEarnings;
    let periodSummary;
    switch (period) {
      case 'today':
        periodSummary = {
          amount: todayEarnings._sum.amount || 0,
          count: todayEarnings._count,
        };
        filteredEarnings = recentEarnings.filter((e) => new Date(e.createdAt) >= todayStart);
        break;
      case 'week':
        periodSummary = {
          amount: weekEarnings._sum.amount || 0,
          count: weekEarnings._count,
        };
        filteredEarnings = recentEarnings.filter((e) => new Date(e.createdAt) >= weekStart);
        break;
      case 'month':
        periodSummary = {
          amount: monthEarnings._sum.amount || 0,
          count: monthEarnings._count,
        };
        filteredEarnings = recentEarnings.filter((e) => new Date(e.createdAt) >= monthStart);
        break;
      default:
        periodSummary = {
          amount: allEarnings._sum.amount || 0,
          count: allEarnings._count,
        };
    }

    return NextResponse.json({
      summary: {
        today: {
          amount: todayEarnings._sum.amount || 0,
          count: todayEarnings._count,
        },
        week: {
          amount: weekEarnings._sum.amount || 0,
          count: weekEarnings._count,
        },
        month: {
          amount: monthEarnings._sum.amount || 0,
          count: monthEarnings._count,
        },
        allTime: {
          amount: allEarnings._sum.amount || 0,
          count: allEarnings._count,
        },
        riderTotal: {
          earnings: rider?.totalEarnings || 0,
          deliveries: rider?.totalDeliveries || 0,
        },
      },
      period: periodSummary,
      weekChart: weekChartData,
      platformBreakdown: platformBreakdown.map((p) => ({
        platform: p.platform,
        amount: p._sum.amount || 0,
        count: p._count,
      })),
      sourceBreakdown: sourceBreakdown.map((s) => ({
        source: s.source,
        amount: s._sum.amount || 0,
        count: s._count,
      })),
      recentEarnings: filteredEarnings,
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 });
  }
}
