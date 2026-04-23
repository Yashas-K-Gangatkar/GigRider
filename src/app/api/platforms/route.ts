import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/platforms — Get rider's connected platforms
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const platforms = await prisma.riderPlatform.findMany({
      where: { riderId: user.riderId },
      orderBy: { connectedAt: 'desc' },
    });

    return NextResponse.json({ platforms });
  } catch (error) {
    console.error('Get platforms error:', error);
    return NextResponse.json({ error: 'Failed to fetch platforms' }, { status: 500 });
  }
}

// POST /api/platforms — Connect a new platform
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { platformId, shiftStart, shiftEnd, autoAccept, minPayout, maxDistance } = body;

    if (!platformId) {
      return NextResponse.json({ error: 'platformId is required' }, { status: 400 });
    }

    // Check if already connected
    const existing = await prisma.riderPlatform.findUnique({
      where: {
        riderId_platformId: {
          riderId: user.riderId,
          platformId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Platform already connected' }, { status: 409 });
    }

    const platform = await prisma.riderPlatform.create({
      data: {
        riderId: user.riderId,
        platformId,
        isOnline: false,
        isRegistered: true,
        shiftStart: shiftStart || null,
        shiftEnd: shiftEnd || null,
        autoAccept: autoAccept || false,
        minPayout: minPayout || 3000,
        maxDistance: maxDistance || 8.0,
      },
    });

    // Also create a default auto-accept rule for this platform
    await prisma.autoAcceptRule.upsert({
      where: {
        riderId_platformId: {
          riderId: user.riderId,
          platformId,
        },
      },
      create: {
        riderId: user.riderId,
        platformId,
        enabled: autoAccept || false,
        minPayout: minPayout || 3000,
        maxDistance: maxDistance || 8.0,
      },
      update: {},
    });

    return NextResponse.json({ success: true, platform }, { status: 201 });
  } catch (error) {
    console.error('Connect platform error:', error);
    return NextResponse.json({ error: 'Failed to connect platform' }, { status: 500 });
  }
}

// PUT /api/platforms — Update platform settings
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { platformId, isOnline, autoAccept, minPayout, maxDistance, shiftStart, shiftEnd, acceptanceRate, completionRate, rating } = body;

    if (!platformId) {
      return NextResponse.json({ error: 'platformId is required' }, { status: 400 });
    }

    // Check if the platform belongs to the rider
    const existing = await prisma.riderPlatform.findUnique({
      where: {
        riderId_platformId: {
          riderId: user.riderId,
          platformId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Platform not connected' }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (isOnline !== undefined) updateData.isOnline = isOnline;
    if (autoAccept !== undefined) updateData.autoAccept = autoAccept;
    if (minPayout !== undefined) updateData.minPayout = minPayout;
    if (maxDistance !== undefined) updateData.maxDistance = maxDistance;
    if (shiftStart !== undefined) updateData.shiftStart = shiftStart;
    if (shiftEnd !== undefined) updateData.shiftEnd = shiftEnd;
    if (acceptanceRate !== undefined) updateData.acceptanceRate = acceptanceRate;
    if (completionRate !== undefined) updateData.completionRate = completionRate;
    if (rating !== undefined) updateData.rating = rating;

    const platform = await prisma.riderPlatform.update({
      where: {
        riderId_platformId: {
          riderId: user.riderId,
          platformId,
        },
      },
      data: updateData,
    });

    // Also update the auto-accept rule if relevant fields changed
    if (autoAccept !== undefined || minPayout !== undefined || maxDistance !== undefined) {
      await prisma.autoAcceptRule.upsert({
        where: {
          riderId_platformId: {
            riderId: user.riderId,
            platformId,
          },
        },
        create: {
          riderId: user.riderId,
          platformId,
          enabled: autoAccept || false,
          minPayout: minPayout || 3000,
          maxDistance: maxDistance || 8.0,
        },
        update: {
          ...(autoAccept !== undefined && { enabled: autoAccept }),
          ...(minPayout !== undefined && { minPayout }),
          ...(maxDistance !== undefined && { maxDistance }),
        },
      });
    }

    // If toggling online, also update rider's isOnline if any platform is online
    if (isOnline !== undefined) {
      const onlinePlatforms = await prisma.riderPlatform.count({
        where: {
          riderId: user.riderId,
          isOnline: true,
        },
      });
      await prisma.rider.update({
        where: { id: user.riderId },
        data: { isOnline: onlinePlatforms > 0 },
      });
    }

    return NextResponse.json({ success: true, platform });
  } catch (error) {
    console.error('Update platform error:', error);
    return NextResponse.json({ error: 'Failed to update platform' }, { status: 500 });
  }
}

// DELETE /api/platforms — Disconnect a platform
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const platformId = searchParams.get('platformId');

    if (!platformId) {
      return NextResponse.json({ error: 'platformId query parameter is required' }, { status: 400 });
    }

    // Check if the platform belongs to the rider
    const existing = await prisma.riderPlatform.findUnique({
      where: {
        riderId_platformId: {
          riderId: user.riderId,
          platformId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Platform not connected' }, { status: 404 });
    }

    // Delete the platform connection (cascade will handle auto-accept rules)
    await prisma.riderPlatform.delete({
      where: {
        riderId_platformId: {
          riderId: user.riderId,
          platformId,
        },
      },
    });

    // Update rider's isOnline status
    const onlinePlatforms = await prisma.riderPlatform.count({
      where: {
        riderId: user.riderId,
        isOnline: true,
      },
    });
    await prisma.rider.update({
      where: { id: user.riderId },
      data: { isOnline: onlinePlatforms > 0 },
    });

    return NextResponse.json({ success: true, message: `Platform ${platformId} disconnected` });
  } catch (error) {
    console.error('Disconnect platform error:', error);
    return NextResponse.json({ error: 'Failed to disconnect platform' }, { status: 500 });
  }
}
