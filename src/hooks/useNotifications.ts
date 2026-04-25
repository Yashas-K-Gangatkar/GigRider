'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  showLocalNotification,
  createRiderNotification,
  subscribeToPushNotifications,
  NotificationTypes,
} from '@/lib/notifications';

interface UseNotificationsReturn {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  notify: (title: string, body: string, data?: Record<string, unknown>) => void;
  subscribe: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;

  useEffect(() => {
    if (isSupported) {
      // Use microtask to avoid synchronous setState in effect
      const currentPermission = Notification.permission;
      queueMicrotask(() => setPermission(currentPermission));
    }
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) return 'denied';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [isSupported]);

  const notify = useCallback(
    (title: string, body: string, data?: Record<string, unknown>) => {
      if (permission === 'granted') {
        createRiderNotification(NotificationTypes.PLATFORM_UPDATE, title, body, data);
      }
    },
    [permission],
  );

  const subscribe = useCallback(async () => {
    await subscribeToPushNotifications();
  }, []);

  return { permission, isSupported, requestPermission, notify, subscribe };
}
