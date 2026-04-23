import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

// In production, use Twilio/MSG91 to send real OTPs
// For now, we generate an OTP and store it in a temporary map
const otpStore = new Map<string, { otp: string; expires: number }>();

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^\+?\d{10,15}$/.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Store OTP with 5-minute expiry
    otpStore.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 });

    // In production: Send via Twilio/MSG91
    // await twilio.messages.create({ to: phone, body: `Your GigRider OTP is ${otp}` });

    console.log(`[GigRider Auth] OTP for ${phone}: ${otp}`);

    // Generate a temporary token for OTP verification
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'gigrider-dev-secret');
    const verifyToken = await new SignJWT({ phone, purpose: 'otp-verify' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('5m')
      .sign(secret);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      verifyToken,
      // In development mode, return the OTP for testing
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}

export { otpStore };
