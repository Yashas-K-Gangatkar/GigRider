// Push notification utilities for GigRider
// Uses the Web Push API via the service worker

export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) return null;

  const registration = await navigator.serviceWorker.ready;

  // Check if already subscribed
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  // For VAPID, we'd need a public key from the server
  // For now, we use the service worker's push without VAPID
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // In production, add applicationServerKey (VAPID public key)
    });
    return subscription;
  } catch (error) {
    console.warn('Push subscription failed:', error);
    return null;
  }
}

export function showLocalNotification(title: string, options?: NotificationOptions): void {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/gigrider-logo.png',
      badge: '/gigrider-logo.png',
      vibrate: [100, 50, 100],
      ...options,
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, {
          icon: '/gigrider-logo.png',
          badge: '/gigrider-logo.png',
          vibrate: [100, 50, 100],
          ...options,
        });
      }
    });
  }
}

// Notification types for GigRider
export const NotificationTypes = {
  NEW_ORDER: 'new_order',
  ORDER_ACCEPTED: 'order_accepted',
  ORDER_PICKED_UP: 'order_picked_up',
  ORDER_COMPLETED: 'order_completed',
  SURGE_ALERT: 'surge_alert',
  EARNING_RECEIVED: 'earning_received',
  TIP_RECEIVED: 'tip_received',
  PLATFORM_UPDATE: 'platform_update',
  SHIFT_REMINDER: 'shift_reminder',
  BREAK_REMINDER: 'break_reminder',
  ACHIEVEMENT: 'achievement',
} as const;

// Create a rider-specific notification
export function createRiderNotification(
  type: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
): void {
  showLocalNotification(`GigRider — ${title}`, {
    body,
    icon: '/gigrider-logo.png',
    data: { type, ...data },
    tag: `gigrider-${type}-${Date.now()}`,
  });
}
