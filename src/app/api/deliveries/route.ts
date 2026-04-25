import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/deliveries — Get rider's delivery history with pagination and filters
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // pending, accepted, picked_up, completed, cancelled
    const platform = searchParams.get('platform'); // swiggy, zomato, etc.
    const startDate = searchParams.get('startDate'); // ISO date string
    const endDate = searchParams.get('endDate'); // ISO date string

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      riderId: user.riderId,
    };

    if (status) where.status = status;
    if (platform) where.platform = platform;

    if (startDate || endDate) {
      const createdAt: Record<string, unknown> = {};
      if (startDate) createdAt.gte = new Date(startDate);
      if (endDate) createdAt.lte = new Date(endDate);
      where.createdAt = createdAt;
    }

    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.delivery.count({ where }),
    ]);

    return NextResponse.json({
      deliveries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
  }
}

// POST /api/deliveries — Create a new delivery record
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      platform,
      status,
      customerName,
      restaurantName,
      pickupAddress,
      dropoffAddress,
      earnings,
      tip,
      distance,
      duration,
      orderValue,
      platformFee,
    } = body;

    if (!platform || !customerName || !restaurantName || !pickupAddress || !dropoffAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, customerName, restaurantName, pickupAddress, dropoffAddress' },
        { status: 400 }
      );
    }

    const delivery = await prisma.delivery.create({
      data: {
        riderId: user.riderId,
        platform,
        status: status || 'pending',
        customerName,
        restaurantName,
        pickupAddress,
        dropoffAddress,
        earnings: earnings || 0,
        tip: tip || 0,
        distance: distance || 0,
        duration: duration || 0,
        orderValue: orderValue || 0,
        platformFee: platformFee || 0,
      },
    });

    // If the delivery is completed, update rider stats and create earning records
    if (delivery.status === 'completed') {
      await prisma.$transaction([
        // Update rider totals
        prisma.rider.update({
          where: { id: user.riderId },
          data: {
            totalDeliveries: { increment: 1 },
            totalEarnings: { increment: delivery.earnings + delivery.tip },
          },
        }),
        // Create delivery earning record
        prisma.earning.create({
          data: {
            riderId: user.riderId,
            deliveryId: delivery.id,
            amount: delivery.earnings,
            source: 'delivery',
            platform: delivery.platform,
            description: `Delivery earnings for ${delivery.restaurantName}`,
          },
        }),
        // Create tip earning record if there's a tip
        ...(delivery.tip > 0
          ? [
              prisma.earning.create({
                data: {
                  riderId: user.riderId,
                  deliveryId: delivery.id,
                  amount: delivery.tip,
                  source: 'tip',
                  platform: delivery.platform,
                  description: `Tip from ${delivery.customerName}`,
                },
              }),
            ]
          : []),
        // Update platform todayEarnings and todayOrders
        prisma.riderPlatform.updateMany({
          where: { riderId: user.riderId, platformId: delivery.platform },
          data: {
            todayEarnings: { increment: delivery.earnings + delivery.tip },
            todayOrders: { increment: 1 },
          },
        }),
      ]);
    }

    return NextResponse.json({ success: true, delivery }, { status: 201 });
  } catch (error) {
    console.error('Create delivery error:', error);
    return NextResponse.json({ error: 'Failed to create delivery' }, { status: 500 });
  }
}
