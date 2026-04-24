import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/db';

// ==================== CONSTANTS ====================

const MAX_ACCOUNTS_PER_IP = 3;
const MAX_ACCOUNTS_PER_LOCATION = 5;
const MAX_REFERRALS_PER_MONTH = 10;

// ==================== HELPERS ====================

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Haversine distance between two lat/lon points.
 * Returns distance in meters.
 */
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

// ==================== HANDLERS ====================

async function handleDeviceDuplicate(body: { deviceId: string; riderId: string }) {
  const { deviceId, riderId } = body;

  const existing = await prisma.deviceFingerprint.findFirst({
    where: {
      deviceId,
      riderId: { not: riderId },
    },
    select: { riderId: true },
  });

  return NextResponse.json({ existingRiderId: existing?.riderId ?? null });
}

async function handleRegisterDevice(
  body: { riderId: string; deviceId: string; fingerprint: Record<string, unknown> },
  req: NextRequest
) {
  const { riderId, deviceId, fingerprint } = body;
  const ip = getClientIp(req);
  const fp = fingerprint as Record<string, unknown>;

  // Upsert: if deviceId already exists for this rider, update; otherwise create
  await prisma.deviceFingerprint.upsert({
    where: { deviceId },
    update: {
      userAgent: String(fp.userAgent ?? ''),
      screenResolution: String(fp.screenResolution ?? ''),
      timezone: String(fp.timezone ?? ''),
      language: String(fp.language ?? ''),
      platform: String(fp.platform ?? ''),
      canvasHash: String(fp.canvasHash ?? ''),
      webglHash: String(fp.webglHash ?? ''),
      audioHash: String(fp.audioHash ?? ''),
      ipAddress: ip,
    },
    create: {
      riderId,
      deviceId,
      userAgent: String(fp.userAgent ?? ''),
      screenResolution: String(fp.screenResolution ?? ''),
      timezone: String(fp.timezone ?? ''),
      language: String(fp.language ?? ''),
      platform: String(fp.platform ?? ''),
      canvasHash: String(fp.canvasHash ?? ''),
      webglHash: String(fp.webglHash ?? ''),
      audioHash: String(fp.audioHash ?? ''),
      ipAddress: ip,
    },
  });

  return NextResponse.json({ success: true });
}

async function handleLocationCluster(
  body: { ip: string; latitude: number; longitude: number; riderId: string }
) {
  const { ip, latitude, longitude, riderId } = body;

  // Count accounts from same IP in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const ipDevices = await prisma.deviceFingerprint.findMany({
    where: {
      ipAddress: ip,
      createdAt: { gt: thirtyDaysAgo },
    },
    select: { riderId: true },
  });

  // Deduplicate by riderId — one rider may have multiple devices
  const ipRiderIds = new Set(ipDevices.map((d) => d.riderId));
  const ipAccountCount = ipRiderIds.size;

  // Count accounts within 500m radius in last 24 hours
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  const nearbyDevices = await prisma.deviceFingerprint.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
      createdAt: { gt: twentyFourHoursAgo },
    },
    select: {
      riderId: true,
      latitude: true,
      longitude: true,
    },
  });

  // Filter by Haversine distance <= 500m and deduplicate by riderId
  const nearbyRiderIds = new Set<string>();
  for (const device of nearbyDevices) {
    if (device.latitude != null && device.longitude != null) {
      const dist = haversineDistance(latitude, longitude, device.latitude, device.longitude);
      if (dist <= 500) {
        nearbyRiderIds.add(device.riderId);
      }
    }
  }
  const locationAccountCount = nearbyRiderIds.size;

  return NextResponse.json({
    ipAccountCount,
    locationAccountCount,
    isVPN: false,
    isProxy: false,
  });
}

async function handleCheckReferralVelocity(body: { riderId: string }) {
  const { riderId } = body;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const referralCount = await prisma.referral.count({
    where: {
      referrerId: riderId,
      createdAt: { gt: thirtyDaysAgo },
    },
  });

  return NextResponse.json({
    referralCount,
    isFlagged: referralCount >= MAX_REFERRALS_PER_MONTH,
  });
}

// ==================== ROUTE ====================

export async function POST(req: NextRequest) {
  // Auth check
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type } = body as { type: string };

    switch (type) {
      case 'device_duplicate':
        return await handleDeviceDuplicate(body);

      case 'register_device':
        return await handleRegisterDevice(body, req);

      case 'location_cluster':
        return await handleLocationCluster(body);

      case 'check_referral_velocity':
        return await handleCheckReferralVelocity(body);

      default:
        return NextResponse.json(
          { error: `Unknown check type: ${type}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[fraud-check] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
