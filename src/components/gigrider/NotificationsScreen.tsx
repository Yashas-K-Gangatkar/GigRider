'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGigRiderStore } from '@/lib/store';
import {
  Bell,
  CheckCircle2,
  DollarSign,
  Star,
  TrendingUp,
  Package,
  Shield,
  Gift,
  Info,
  Trash2,
  CheckCheck,
  ChevronLeft,
} from 'lucide-react';

const NOTIFICATION_ICONS: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  order: { icon: Package, color: 'text-[#2C4A3E]', bg: 'bg-[#2C4A3E]/10' },
  earnings: { icon: DollarSign, color: 'text-[#1B2A4A]', bg: 'bg-[#1B2A4A]/10' },
  tip: { icon: Gift, color: 'text-[#C9A96E]', bg: 'bg-[#C9A96E]/10' },
  achievement: { icon: Star, color: 'text-[#8B5E3C]', bg: 'bg-[#8B5E3C]/10' },
  platform: { icon: Shield, color: 'text-[#1B2A4A]', bg: 'bg-[#1B2A4A]/10' },
  milestone: { icon: TrendingUp, color: 'text-[#2C4A3E]', bg: 'bg-[#2C4A3E]/10' },
  system: { icon: Info, color: 'text-[#7A7168]', bg: 'bg-[#F0EBE4]' },
};

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 2) return 'Yesterday';
  return `${days}d ago`;
}

function getTimeGroup(timestamp: number): string {
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
  const unreadCount = useGigRiderStore(s => s.unreadNotificationCount);
  const markRead = useGigRiderStore(s => s.markNotificationRead);
  const markAllRead = useGigRiderStore(s => s.markAllNotificationsRead);
  const clearAll = useGigRiderStore(s => s.clearNotifications);

  const grouped = notifications.reduce<Record<string, typeof notifications>>((acc, n) => {
    const group = getTimeGroup(n.timestamp);
    if (!acc[group]) acc[group] = [];
    acc[group].push(n);
    return acc;
  }, {});

  const groupOrder = ['Today', 'Yesterday', 'Earlier'];

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#D5CBBF] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1">
              <ChevronLeft className="w-5 h-5 text-[#1B2A4A]" />
            </button>
            <div>
              <h1
                className="text-lg font-bold text-[#1B2A4A] tracking-wide"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p
                  className="text-[10px] text-[#7A7168] tracking-wider uppercase"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={markAllRead}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1B2A4A]/5 rounded-lg text-[10px] font-semibold text-[#1B2A4A]"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </motion.button>
            )}
            {notifications.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={clearAll}
                className="p-1.5 rounded-lg hover:bg-[#722F37]/5 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-[#7A7168]" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
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
              We&apos;ll notify you about orders, earnings, and updates
            </p>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {groupOrder.map(groupName => {
              const groupNotifs = grouped[groupName];
              if (!groupNotifs || groupNotifs.length === 0) return null;

              return (
                <div key={groupName}>
                  {/* Group Header */}
                  <div className="flex items-center gap-2 mb-2">
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
                    {groupNotifs.map((notification, index) => {
                      const iconConfig = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.system;
                      const Icon = iconConfig.icon;

                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.04 }}
                          onClick={() => !notification.isRead && markRead(notification.id)}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                            notification.isRead
                              ? 'bg-white border-[#D5CBBF]'
                              : 'bg-[#1B2A4A]/[0.03] border-[#1B2A4A]/15 hover:bg-[#1B2A4A]/[0.05]'
                          } card-elegant`}
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconConfig.bg}`}>
                            <Icon className={`w-4.5 h-4.5 ${iconConfig.color}`} />
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
                              className="text-xs text-[#7A7168] mt-0.5 line-clamp-2"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                            >
                              {notification.message}
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
