import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'gigrider-dev-secret');

export interface AuthUser {
  riderId: string;
  phone: string;
  name: string;
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  try {
    const token = authHeader.substring(7);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AuthUser;
  } catch {
    return null;
  }
}
