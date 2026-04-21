'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useGigRiderStore, type Notification } from '@/lib/store';
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
  Layers,
  Zap,
  Filter,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Bike,
  MapPin,
  Clock,
  Eye,
  Route,
} from 'lucide-react';

type NotifType = Notification['type'];
type FilterTab = 'all' | NotifType;

const NOTIFICATION_ICONS: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  order_accepted: { icon: Zap, color: 'text-[#2C4A3E]', bg: 'bg-[#2C4A3E]/10' },
  order_completed: { icon: CheckCircle2, color: 'text-[#2C4A3E]', bg: 'bg-[#2C4A3E]/10' },
  earnings_milestone: { icon: TrendingUp, color: 'text-[#1B2A4A]', bg: 'bg-[#1B2A4A]/10' },
  platform_update: { icon: Shield, color: 'text-[#1B2A4A]', bg: 'bg-[#1B2A4A]/10' },
  tier_upgrade: { icon: Star, color: 'text-[#8B5E3C]', bg: 'bg-[#8B5E3C]/10' },
  tip_received: { icon: Gift, color: 'text-[#C9A96E]', bg: 'bg-[#C9A96E]/10' },
  stack_order: { icon: Layers, color: 'text-[#1B2A4A]', bg: 'bg-[#1B2A4A]/10' },
  system: { icon: Info, color: 'text-[#7A7168]', bg: 'bg-[#F0EBE4]' },
};

// Action buttons per notification type
const NOTIFICATION_ACTIONS: Record<string, { label: string; icon: typeof ArrowRight; color: string }[]> = {
  order_accepted: [{ label: 'View Order', icon: Eye, color: 'text-[#2C4A3E] bg-[#2C4A3E]/8' }],
  order_completed: [
    { label: 'View Details', icon: Route, color: 'text-[#2C4A3E] bg-[#2C4A3E]/8' },
    { label: 'Earnings', icon: DollarSign, color: 'text-[#1B2A4A] bg-[#1B2A4A]/8' },
  ],
  earnings_milestone: [{ label: 'View Breakdown', icon: TrendingUp, color: 'text-[#1B2A4A] bg-[#1B2A4A]/8' }],
  platform_update: [{ label: 'View Update', icon: ArrowRight, color: 'text-[#1B2A4A] bg-[#1B2A4A]/8' }],
  tier_upgrade: [{ label: 'View Benefits', icon: Sparkles, color: 'text-[#8B5E3C] bg-[#8B5E3C]/8' }],
  tip_received: [{ label: 'Thank Customer', icon: Star, color: 'text-[#C9A96E] bg-[#C9A96E]/8' }],
  stack_order: [{ label: 'View Stack', icon: Layers, color: 'text-[#1B2A4A] bg-[#1B2A4A]/8' }],
  system: [],
};

const FILTER_TABS: { id: FilterTab; label: string; icon: typeof Bell }[] = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'order_completed', label: 'Deliveries', icon: CheckCircle2 },
  { id: 'earnings_milestone', label: 'Earnings', icon: DollarSign },
  { id: 'tip_received', label: 'Tips', icon: Gift },
  { id: 'platform_update', label: 'Platforms', icon: Shield },
  { id: 'stack_order', label: 'Stacks', icon: Layers },
];

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

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (dismissedIds.has(n.id)) return false;
      if (activeFilter !== 'all' && n.type !== activeFilter) return false;
      return true;
    });
  }, [notifications, activeFilter, dismissedIds]);

  // Group by time
  const grouped = filteredNotifications.reduce<Record<string, typeof filteredNotifications>>((acc, n) => {
    const group = getTimeGroup(n.timestamp);
    if (!acc[group]) acc[group] = [];
    acc[group].push(n);
    return acc;
  }, {});

  const groupOrder = ['Today', 'Yesterday', 'Earlier'];

  const handleSwipeDismiss = (notifId: string, info: PanInfo) => {
    if (info.offset.x > 80 || info.offset.x < -80) {
      setDismissedIds(prev => new Set([...prev, notifId]));
      markRead(notifId);
    }
  };

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notifications.length };
    notifications.forEach(n => {
      counts[n.type] = (counts[n.type] || 0) + 1;
    });
    return counts;
  }, [notifications]);

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
            {/* Sound toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-lg transition-colors duration-200 ${
                soundEnabled ? 'bg-[#2C4A3E]/10' : 'bg-[#F0EBE4]'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#2C4A3E]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-[#7A7168]" />
              )}
            </motion.button>

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

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 mt-3 overflow-x-auto no-scrollbar -mx-1 px-1">
          {FILTER_TABS.map((tab) => {
            const count = filterCounts[tab.id] || 0;
            if (tab.id !== 'all' && count === 0) return null;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeFilter === tab.id
                    ? 'bg-[#1B2A4A] text-[#FAF7F2]'
                    : 'bg-white border border-[#D5CBBF] text-[#7A7168]'
                }`}
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
                {count > 0 && (
                  <span className={`text-[9px] font-bold ${
                    activeFilter === tab.id ? 'text-[#FAF7F2]/70' : 'text-[#7A7168]/60'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
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
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#F0EBE4] flex items-center justify-center mb-4 border border-[#D5CBBF]">
              <Filter className="w-8 h-8 text-[#D5CBBF]" />
            </div>
            <p
              className="text-[#7A7168] text-sm font-medium"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              No matching notifications
            </p>
            <button
              onClick={() => setActiveFilter('all')}
              className="text-[#1B2A4A] text-xs font-semibold mt-2 underline underline-offset-2"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {groupOrder.map(groupName => {
              const groupNotifs = grouped[groupName];
              if (!groupNotifs || groupNotifs.length === 0) return null;

              const groupUnread = groupNotifs.filter(n => !n.isRead).length;

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
                    <span
                      className="text-[10px] text-[#7A7168]/60"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      {groupNotifs.length}
                    </span>
                    {groupUnread > 0 && (
                      <Badge className="bg-[#C9A96E]/10 text-[#8B5E3C] border-[#C9A96E]/20 text-[8px] px-1.5 py-0">
                        {groupUnread} new
                      </Badge>
                    )}
                    <div className="flex-1 h-px bg-gradient-to-r from-[#D5CBBF] to-transparent" />
                  </div>

                  {/* Notification Items */}
                  <div className="space-y-2">
                    {groupNotifs.map((notification, index) => {
                      const iconConfig = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.system;
                      const Icon = iconConfig.icon;
                      const actions = NOTIFICATION_ACTIONS[notification.type] || [];
                      const isExpanded = expandedId === notification.id;

                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.04 }}
                          drag="x"
                          dragConstraints={{ left: -80, right: 80 }}
                          dragElastic={0.15}
                          onDragEnd={(_, info) => handleSwipeDismiss(notification.id, info)}
                          className="relative"
                        >
                          {/* Swipe background */}
                          <div className="absolute inset-0 rounded-xl bg-[#722F37]/10 flex items-center justify-end pr-4 overflow-hidden">
                            <div className="flex items-center gap-1.5 text-[10px] text-[#722F37] font-medium" style={{ fontFamily: 'var(--font-lora), serif' }}>
                              <X className="w-3.5 h-3.5" />
                              Dismiss
                            </div>
                          </div>

                          <div
                            onClick={() => {
                              if (!notification.isRead) markRead(notification.id);
                              setExpandedId(isExpanded ? null : notification.id);
                            }}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 relative ${
                              notification.isRead
                                ? 'bg-white border-[#D5CBBF]'
                                : 'bg-[#1B2A4A]/[0.03] border-[#1B2A4A]/15 hover:bg-[#1B2A4A]/[0.05]'
                            } card-elegant`}
                          >
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconConfig.bg}`}>
                              <Icon className={`w-4 h-4 ${iconConfig.color}`} />
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
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-2 h-2 rounded-full bg-[#C9A96E] shrink-0 mt-1.5"
                                  />
                                )}
                              </div>
                              <p
                                className="text-xs text-[#7A7168] mt-0.5 line-clamp-2"
                                style={{ fontFamily: 'var(--font-lora), serif' }}
                              >
                                {notification.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <p
                                  className="text-[10px] text-[#7A7168]/60"
                                  style={{ fontFamily: 'var(--font-lora), serif' }}
                                >
                                  {formatTimeAgo(notification.timestamp)}
                                </p>
                                {!notification.isRead && (
                                  <span
                                    className="text-[9px] text-[#C9A96E] font-semibold bg-[#C9A96E]/10 px-1.5 py-0 rounded"
                                    style={{ fontFamily: 'var(--font-lora), serif' }}
                                  >
                                    NEW
                                  </span>
                                )}
                              </div>

                              {/* Action buttons - shown on expanded or for unread */}
                              {(isExpanded || !notification.isRead) && actions.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 }}
                                  className="flex items-center gap-2 mt-2.5"
                                >
                                  {actions.map((action, i) => {
                                    const ActionIcon = action.icon;
                                    return (
                                      <button
                                        key={i}
                                        onClick={(e) => { e.stopPropagation(); }}
                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all duration-200 ${action.color} hover:opacity-80 active:scale-[0.97]`}
                                        style={{ fontFamily: 'var(--font-lora), serif' }}
                                      >
                                        <ActionIcon className="w-3 h-3" />
                                        {action.label}
                                      </button>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </div>
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
