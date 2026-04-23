import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/settings — Get rider's settings
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await prisma.riderSettings.findUnique({
      where: { riderId: user.riderId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.riderSettings.create({
        data: {
          riderId: user.riderId,
        },
      });
    }

    // Parse the notifications JSON string
    let notificationsConfig = {};
    try {
      notificationsConfig = JSON.parse(settings.notifications);
    } catch {
      // Keep default empty object if parse fails
    }

    return NextResponse.json({
      settings: {
        ...settings,
        notifications: notificationsConfig,
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/settings — Update rider's settings
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      notifications,
      theme,
      language,
      currency,
      soundEnabled,
      autoOnline,
      maxDailyKm,
      breakReminder,
      breakIntervalMinutes,
      dataExportFormat,
      privacyMode,
    } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (notifications !== undefined) updateData.notifications = JSON.stringify(notifications);
    if (theme !== undefined) updateData.theme = theme;
    if (language !== undefined) updateData.language = language;
    if (currency !== undefined) updateData.currency = currency;
    if (soundEnabled !== undefined) updateData.soundEnabled = soundEnabled;
    if (autoOnline !== undefined) updateData.autoOnline = autoOnline;
    if (maxDailyKm !== undefined) updateData.maxDailyKm = maxDailyKm;
    if (breakReminder !== undefined) updateData.breakReminder = breakReminder;
    if (breakIntervalMinutes !== undefined) updateData.breakIntervalMinutes = breakIntervalMinutes;
    if (dataExportFormat !== undefined) updateData.dataExportFormat = dataExportFormat;
    if (privacyMode !== undefined) updateData.privacyMode = privacyMode;

    // Upsert settings (create if doesn't exist)
    const settings = await prisma.riderSettings.upsert({
      where: { riderId: user.riderId },
      create: {
        riderId: user.riderId,
        notifications: notifications ? JSON.stringify(notifications) : '{}',
        theme: theme || 'light',
        language: language || 'en',
        currency: currency || 'INR',
        soundEnabled: soundEnabled !== undefined ? soundEnabled : true,
        autoOnline: autoOnline || false,
        maxDailyKm: maxDailyKm || 100,
        breakReminder: breakReminder !== undefined ? breakReminder : true,
        breakIntervalMinutes: breakIntervalMinutes || 120,
        dataExportFormat: dataExportFormat || 'csv',
        privacyMode: privacyMode || false,
      },
      update: updateData,
    });

    // Parse notifications JSON for response
    let notificationsConfig = {};
    try {
      notificationsConfig = JSON.parse(settings.notifications);
    } catch {
      // Keep default empty object if parse fails
    }

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        notifications: notificationsConfig,
      },
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
