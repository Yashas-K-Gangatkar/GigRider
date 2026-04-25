import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { hashOtp } from '../send-otp/route';

// Dynamic Prisma import — won't crash the route if DB isn't set up yet
async function getPrisma() {
  try {
    const { prisma } = await import('@/lib/db');
    return prisma;
  } catch {
    console.warn('[GigRider] Prisma client not available — running in demo mode. Run: npx prisma generate && npx prisma db push');
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, verifyToken, name, vehicleType } = await req.json();

    if (!phone || !otp || !verifyToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the temporary token and extract the OTP hash
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'gigrider-dev-secret');
    let tokenPayload: Record<string, unknown>;
    try {
      const { payload } = await jwtVerify(verifyToken, secret);
      tokenPayload = payload as Record<string, unknown>;
      if (tokenPayload.purpose !== 'otp-verify') {
        return NextResponse.json({ error: 'Invalid token purpose' }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid or expired verification token. Please resend OTP and try again.' }, { status: 401 });
    }

    // Verify OTP by comparing hashes
    const storedOtpHash = tokenPayload.otpHash as string | undefined;
    const inputOtpHash = hashOtp(otp);

    if (!storedOtpHash || storedOtpHash !== inputOtpHash) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // Verify the phone in the token matches the phone in the request
    if (tokenPayload.phone !== phone) {
      return NextResponse.json({ error: 'Phone number mismatch' }, { status: 401 });
    }

    // Find or create rider — gracefully handles missing database
    const prisma = await getPrisma();
    let rider;

    if (prisma) {
      try {
        rider = await prisma.rider.findUnique({ where: { phone } });
      } catch (dbError) {
        console.warn('[GigRider] DB read failed:', dbError);
      }

      if (!rider) {
        try {
          rider = await prisma.rider.create({
            data: {
              phone,
              name: name || `Rider ${phone.slice(-4)}`,
              vehicleType: vehicleType || 'bicycle',
            },
          });
        } catch (dbError) {
          console.warn('[GigRider] DB create failed:', dbError);
        }
      }
    }

    // Fallback demo rider if database is unavailable
    if (!rider) {
      rider = {
        id: `demo-${Date.now()}`,
        phone,
        name: name || `Rider ${phone.slice(-4)}`,
        email: null,
        vehicleType: vehicleType || 'bicycle',
        rating: 4.5,
        tier: 'free',
        totalDeliveries: 0,
        totalEarnings: 0,
        isOnline: false,
        mpgcsScore: 50,
      };
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
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
