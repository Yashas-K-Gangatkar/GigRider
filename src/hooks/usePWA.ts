'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAStatus {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  installApp: () => Promise<void>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
}

function getIsInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches;
}

function getIsOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

export function usePWA(): PWAStatus {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(getIsInstalled);
  const [isOnline, setIsOnline] = useState(getIsOnline);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) return 'denied';
    const permission = await Notification.requestPermission();
    return permission;
  }, []);

  return { isInstallable, isInstalled, isOnline, installApp, requestNotificationPermission };
}
