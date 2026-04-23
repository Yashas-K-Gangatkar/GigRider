import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { otpStore } from '../send-otp/route';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, verifyToken, name, vehicleType } = await req.json();

    if (!phone || !otp || !verifyToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the temporary token
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'gigrider-dev-secret');
    try {
      const { payload } = await jwtVerify(verifyToken, secret);
      if (payload.purpose !== 'otp-verify') {
        return NextResponse.json({ error: 'Invalid token purpose' }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 401 });
    }

    // Check OTP
    const stored = otpStore.get(phone);
    if (!stored || stored.otp !== otp || stored.expires < Date.now()) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // Clear used OTP
    otpStore.delete(phone);

    // Find or create rider
    let rider = await prisma.rider.findUnique({
      where: { phone },
      include: { settings: true },
    });

    if (!rider) {
      rider = await prisma.rider.create({
        data: {
          phone,
          name: name || `Rider ${phone.slice(-4)}`,
          vehicleType: vehicleType || 'bicycle',
          settings: {
            create: {}, // Create default settings
          },
        },
        include: { settings: true },
      });
    }

    // Generate session token
    const sessionToken = await new SignJWT({
      riderId: rider.id,
      phone: rider.phone,
      name: rider.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    return NextResponse.json({
      success: true,
      rider: {
        id: rider.id,
        phone: rider.phone,
        name: rider.name,
        email: rider.email,
        vehicleType: rider.vehicleType,
        rating: rider.rating,
        tier: rider.tier,
        totalDeliveries: rider.totalDeliveries,
        totalEarnings: rider.totalEarnings,
        isOnline: rider.isOnline,
        mpgcsScore: rider.mpgcsScore,
      },
      token: sessionToken,
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
