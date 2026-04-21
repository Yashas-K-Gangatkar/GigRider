'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGigRiderStore, type Notification } from '@/lib/store';
import {
  Bell,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Gift,
  Layers,
  Crown,
  Package,
  Trash2,
  CheckCheck,
  ChevronLeft,
} from 'lucide-react';

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'order_accepted': return Package;
    case 'order_completed': return CheckCircle2;
    case 'earnings_milestone': return TrendingUp;
    case 'platform_update': return RefreshCw;
    case 'tier_upgrade': return Crown;
    case 'tip_received': return Gift;
    case 'stack_order': return Layers;
    default: return Bell;
  }
}

function getNotificationColor(type: Notification['type']) {
  switch (type) {
    case 'order_accepted': return '#2C4A3E';
    case 'order_completed': return '#1A6B4A';
    case 'earnings_milestone': return '#C9A96E';
    case 'platform_update': return '#8B5E3C';
    case 'tier_upgrade': return '#1B2A4A';
    case 'tip_received': return '#C9A96E';
    case 'stack_order': return '#1B2A4A';
    default: return '#7A7168';
  }
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function getDateGroup(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const oneDay = 86400000;
  if (diff < oneDay) return 'Today';
  if (diff < 2 * oneDay) return 'Yesterday';
  return 'Earlier';
}

interface NotificationsScreenProps {
  onBack: () => void;
}

export default function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const notifications = useGigRiderStore(s => s.notifications);
  const markNotificationRead = useGigRiderStore(s => s.markNotificationRead);
  const markAllNotificationsRead = useGigRiderStore(s => s.markAllNotificationsRead);
  const clearNotifications = useGigRiderStore(s => s.clearNotifications);

  // Group by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    notifications.forEach(n => {
      const group = getDateGroup(n.timestamp);
      if (!groups[group]) groups[group] = [];
      groups[group].push(n);
    });
    return groups;
  }, [notifications]);

  const groupOrder = ['Today', 'Yesterday', 'Earlier'];

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#D5CBBF] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={onBack}
              whileTap={{ scale: 0.9 }}
              className="p-1"
            >
              <ChevronLeft className="w-5 h-5 text-[#1B2A4A]" />
            </motion.button>
            <h1
              className="text-lg font-bold text-[#1B2A4A] tracking-wide"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              Notifications
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={markAllNotificationsRead}
              whileTap={{ scale: 0.9 }}
              className="p-1.5"
              title="Mark all read"
            >
              <CheckCheck className="w-4.5 h-4.5 text-[#7A7168]" />
            </motion.button>
            <motion.button
              onClick={clearNotifications}
              whileTap={{ scale: 0.9 }}
              className="p-1.5"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4 text-[#7A7168]" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F0EBE4] flex items-center justify-center mb-4 border border-[#D5CBBF]">
              <Bell className="w-8 h-8 text-[#7A7168]" />
            </div>
            <p
              className="text-[#7A7168] text-sm font-medium"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              No notifications yet
            </p>
            <p
              className="text-[#7A7168]/60 text-xs mt-1"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              You&apos;ll see order updates, earnings milestones, and more here
            </p>
          </div>
        )}

        {groupOrder.map(groupName => {
          const groupNotifications = groupedNotifications[groupName];
          if (!groupNotifications || groupNotifications.length === 0) return null;

          return (
            <div key={groupName}>
              {/* Date Group Header */}
              <div className="flex items-center gap-2 mb-3">
                <h3
                  className="text-xs font-semibold text-[#7A7168] tracking-wider uppercase"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {groupName}
                </h3>
                <div className="flex-1 h-px bg-[#D5CBBF]" />
              </div>

              {/* Notification Items */}
              <div className="space-y-2">
                <AnimatePresence>
                  {groupNotifications.map((notification, index) => {
                    const Icon = getNotificationIcon(notification.type);
                    const color = getNotificationColor(notification.type);

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -80 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => markNotificationRead(notification.id)}
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                          notification.isRead
                            ? 'bg-white border-[#D5CBBF] card-elegant'
                            : 'bg-[#1B2A4A]/[0.03] border-[#1B2A4A]/15 card-elegant'
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${color}15` }}
                        >
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm font-semibold ${notification.isRead ? 'text-[#2C2C2C]' : 'text-[#1B2A4A]'}`}
                              style={{ fontFamily: 'var(--font-playfair), serif' }}
                            >
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#C9A96E] shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p
                            className="text-xs text-[#7A7168] mt-0.5 leading-relaxed"
                            style={{ fontFamily: 'var(--font-lora), serif' }}
                          >
                            {notification.description}
                          </p>
                          <p
                            className="text-[10px] text-[#7A7168]/60 mt-1"
                            style={{ fontFamily: 'var(--font-lora), serif' }}
                          >
                            {formatTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
