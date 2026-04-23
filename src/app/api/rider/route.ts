import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/rider — Get rider profile
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rider = await prisma.rider.findUnique({
      where: { id: user.riderId },
      include: {
        platforms: true,
        settings: true,
        autoAcceptRules: true,
        _count: {
          select: {
            deliveries: true,
            earnings: true,
            notifications: { where: { isRead: false } },
          },
        },
      },
    });

    if (!rider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
    }

    return NextResponse.json({
      rider: {
        id: rider.id,
        phone: rider.phone,
        name: rider.name,
        email: rider.email,
        vehicleType: rider.vehicleType,
        rating: rider.rating,
        totalDeliveries: rider.totalDeliveries,
        totalEarnings: rider.totalEarnings,
        tier: rider.tier,
        isOnline: rider.isOnline,
        mpgcsScore: rider.mpgcsScore,
        createdAt: rider.createdAt,
        updatedAt: rider.updatedAt,
      },
      platforms: rider.platforms,
      settings: rider.settings,
      autoAcceptRules: rider.autoAcceptRules,
      stats: {
        totalDeliveries: rider._count.deliveries,
        totalEarningRecords: rider._count.earnings,
        unreadNotifications: rider._count.notifications,
      },
    });
  } catch (error) {
    console.error('Get rider error:', error);
    return NextResponse.json({ error: 'Failed to fetch rider profile' }, { status: 500 });
  }
}

// PUT /api/rider — Update rider profile
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, vehicleType, isOnline } = body;

    // Only allow updating specific fields
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (vehicleType !== undefined) updateData.vehicleType = vehicleType;
    if (isOnline !== undefined) updateData.isOnline = isOnline;

    const rider = await prisma.rider.update({
      where: { id: user.riderId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      rider: {
        id: rider.id,
        phone: rider.phone,
        name: rider.name,
        email: rider.email,
        vehicleType: rider.vehicleType,
        rating: rider.rating,
        totalDeliveries: rider.totalDeliveries,
        totalEarnings: rider.totalEarnings,
        tier: rider.tier,
        isOnline: rider.isOnline,
        mpgcsScore: rider.mpgcsScore,
      },
    });
  } catch (error) {
    console.error('Update rider error:', error);
    return NextResponse.json({ error: 'Failed to update rider profile' }, { status: 500 });
  }
}
