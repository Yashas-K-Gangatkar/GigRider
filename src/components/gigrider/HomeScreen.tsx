'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useGigRiderStore, PLATFORMS, type PlatformId } from '@/lib/store';
import { useOrderTimers, formatOnlineTime } from '@/hooks/use-order-simulation';
import {
  Bell,
  MapPin,
  Navigation,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  ChevronUp,
  Bike,
  Package,
  Layers,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Power,
} from 'lucide-react';

const PLATFORM_CONFIG: Record<string, { name: string; color: string; bg: string; letter: string }> = {};
Object.entries(PLATFORMS).forEach(([id, p]) => {
  PLATFORM_CONFIG[id] = { name: p.name, color: p.color, bg: `bg-[${p.color}]`, letter: p.letter };
});

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getTimeEmoji(): string {
  const hour = new Date().getHours();
  if (hour < 12) return '\u2600\uFE0F';
  if (hour < 17) return '\uD83C\uDF24\uFE0F';
  return '\uD83C\uDF19';
}

export default function HomeScreen() {
  const isOnline = useGigRiderStore(s => s.isOnline);
  const smartMode = useGigRiderStore(s => s.smartMode);
  const incomingOrders = useGigRiderStore(s => s.incomingOrders);
  const acceptedOrderIds = useGigRiderStore(s => s.acceptedOrderIds);
  const declinedOrderIds = useGigRiderStore(s => s.declinedOrderIds);
  const activeDelivery = useGigRiderStore(s => s.activeDelivery);
  const connectedPlatforms = useGigRiderStore(s => s.connectedPlatforms);
  const todayEarnings = useGigRiderStore(s => s.todayEarnings);
  const todayOrders = useGigRiderStore(s => s.todayOrders);
  const totalOnlineTime = useGigRiderStore(s => s.totalOnlineTime);
  const rider = useGigRiderStore(s => s.rider);
  const unreadNotificationCount = useGigRiderStore(s => s.unreadNotificationCount);

  const setOnline = useGigRiderStore(s => s.setOnline);
  const setSmartMode = useGigRiderStore(s => s.setSmartMode);
  const acceptOrder = useGigRiderStore(s => s.acceptOrder);
  const declineOrder = useGigRiderStore(s => s.declineOrder);
  const completeActiveDelivery = useGigRiderStore(s => s.completeActiveDelivery);

  const timers = useOrderTimers();
  const [showStats, setShowStats] = useState(false);
  const [showDeliveredSuccess, setShowDeliveredSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bellRinging, setBellRinging] = useState(false);
  const prevOrderCountRef = useRef(0);

  // Detect stacked orders
  const stackIds = useMemo(() => {
    const ids = new Set<string>();
    incomingOrders.forEach(o => { if (o.stackId) ids.add(o.stackId); });
    return ids;
  }, [incomingOrders]);

  // Count orders per stack
  const stackCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    incomingOrders.forEach(o => {
      if (o.stackId) {
        counts[o.stackId] = (counts[o.stackId] || 0) + 1;
      }
    });
    return counts;
  }, [incomingOrders]);

  // Detect new orders appearing - trigger bell ring animation
  const filteredOrders = incomingOrders
    .filter((o) => !declinedOrderIds.includes(o.id) && !acceptedOrderIds.includes(o.id))
    .sort((a, b) => {
      if (smartMode === 'auto-rank') {
        return (a.rank ?? 99) - (b.rank ?? 99);
      }
      return 0;
    });

  useEffect(() => {
    const currentCount = filteredOrders.length;
    if (currentCount > prevOrderCountRef.current && prevOrderCountRef.current >= 0 && isOnline) {
      setBellRinging(true);
      const timer = setTimeout(() => setBellRinging(false), 1500);
      prevOrderCountRef.current = currentCount;
      return () => clearTimeout(timer);
    }
    prevOrderCountRef.current = currentCount;
  }, [filteredOrders.length, isOnline]);

  const handleAccept = (orderId: string) => {
    acceptOrder(orderId);
  };

  const handleDecline = (orderId: string) => {
    declineOrder(orderId);
  };

  const handleDelivered = () => {
    setShowDeliveredSuccess(true);
    setTimeout(() => {
      completeActiveDelivery();
      setShowDeliveredSuccess(false);
    }, 1200);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const activePlatforms = connectedPlatforms.map(p => p.id);
  const riderName = rider?.name || 'Rider';
  const firstName = riderName.split(' ')[0];

  // Distance progress for active delivery (simulated)
  const deliveryProgress = activeDelivery
    ? Math.min(((Date.now() - activeDelivery.startedAt) / 1000 / (activeDelivery.eta * 60)) * 100, 95)
    : 0;

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Full-screen delivered success overlay */}
      <AnimatePresence>
        {showDeliveredSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B2A4A]/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 12 }}
                className="w-24 h-24 rounded-full bg-[#2C4A3E] flex items-center justify-center"
              >
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
                >
                  <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
                </motion.div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white text-xl font-bold tracking-wide"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                Delivered!
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.7 }}
                className="text-white/70 text-sm"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Great work, {firstName}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#D5CBBF]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className="text-lg tracking-[0.12em] text-[#1B2A4A]"
              style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 700 }}
            >
              GIG<span className="text-[#C9A96E]">RIDER</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Online/Offline Toggle */}
            <div className="flex items-center gap-2">
              {isOnline && (
                <motion.div
                  className="flex items-center gap-1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1A6B4A] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2C4A3E]" />
                  </span>
                  <span
                    className="text-[10px] font-bold text-[#2C4A3E] tracking-[0.15em] uppercase"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    LIVE
                  </span>
                </motion.div>
              )}
              <Switch
                checked={isOnline}
                onCheckedChange={setOnline}
                className={`${isOnline ? 'bg-[#2C4A3E]' : 'bg-[#D5CBBF]'} data-[state=checked]:bg-[#2C4A3E]`}
              />
            </div>

            {/* Notification Bell with enhanced ring animation */}
            <motion.button
              className="relative p-1.5"
              whileTap={{ scale: 0.9 }}
              animate={
                bellRinging
                  ? { rotate: [0, -15, 15, -10, 10, -5, 5, 0] }
                  : unreadNotificationCount > 0
                    ? { rotate: [0, -8, 8, -4, 4, 0] }
                    : {}
              }
              transition={
                bellRinging
                  ? { duration: 0.8, ease: 'easeInOut' }
                  : { duration: 0.5, repeat: unreadNotificationCount > 0 ? 2 : 0, repeatDelay: 3 }
              }
            >
              <Bell className={`w-5 h-5 ${bellRinging ? 'text-[#C9A96E]' : 'text-[#7A7168]'} transition-colors duration-300`} />
              {/* Ring pulse effect when new orders arrive */}
              {bellRinging && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-[#C9A96E]/30"
                />
              )}
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#722F37] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Active Platforms Bar */}
        <div className="flex items-center gap-3 px-4 pb-2.5 overflow-x-auto no-scrollbar">
          {activePlatforms.map((p) => {
            const config = PLATFORM_CONFIG[p];
            return (
              <div key={p} className="flex items-center gap-1.5 shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white border border-[#C9A96E]/30"
                  style={{ backgroundColor: config?.color || '#7A7168' }}
                >
                  {config?.letter || p[0].toUpperCase()}
                </div>
                <span className="relative flex h-2 w-2">
                  {isOnline && (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2C4A3E] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1A6B4A]" />
                    </>
                  )}
                  {!isOnline && <span className="inline-flex rounded-full h-2 w-2 bg-[#D5CBBF]" />}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Greeting Section */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-3 pb-1"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-xl font-bold text-[#1B2A4A]"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              {getTimeEmoji()} {getGreeting()}, {firstName}
            </h2>
            <p
              className="text-xs text-[#7A7168] mt-0.5"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              {isOnline ? `${connectedPlatforms.filter(p => p.isOnline).length} platforms active` : 'You\'re currently offline'}
            </p>
          </div>
          {/* Pull to refresh indicator */}
          <motion.button
            onClick={handleRefresh}
            whileTap={{ scale: 0.85, rotate: 180 }}
            className="p-2 rounded-full bg-white border border-[#D5CBBF]"
          >
            <RefreshCw className={`w-4 h-4 text-[#7A7168] ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Smart Mode Toggle */}
      <div className="px-4 pt-2">
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-[#D5CBBF]">
          <button
            onClick={() => setSmartMode('auto-rank')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-medium transition-all duration-300 ${
              smartMode === 'auto-rank'
                ? 'bg-[#1B2A4A] text-[#FAF7F2] shadow-sm'
                : 'text-[#7A7168] hover:text-[#2C2C2C]'
            }`}
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            <Zap className="w-3.5 h-3.5" />
            Auto-Rank
          </button>
          <button
            onClick={() => setSmartMode('first-come')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-medium transition-all duration-300 ${
              smartMode === 'first-come'
                ? 'bg-[#1B2A4A] text-[#FAF7F2] shadow-sm'
                : 'text-[#7A7168] hover:text-[#2C2C2C]'
            }`}
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            <Clock className="w-3.5 h-3.5" />
            First Come
          </button>
        </div>
      </div>

      {/* Active Delivery Card */}
      {activeDelivery && isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-4 pt-3"
        >
          <div className="border-2 border-[#C9A96E]/50 rounded-xl bg-white p-4 animate-border-pulse-gold card-elegant">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-[#C9A96E]/30"
                  style={{ backgroundColor: PLATFORM_CONFIG[activeDelivery.platform]?.color || '#7A7168' }}
                >
                  {PLATFORM_CONFIG[activeDelivery.platform]?.letter || '?'}
                </div>
                <span
                  className="text-[10px] font-bold tracking-[0.12em] text-[#7A7168] uppercase"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {PLATFORM_CONFIG[activeDelivery.platform]?.name || activeDelivery.platform}
                </span>
              </div>
              <Badge className="bg-[#2C4A3E]/10 text-[#2C4A3E] border-[#2C4A3E]/20 text-[10px]">
                <Bike className="w-3 h-3 mr-1" />
                EN ROUTE
              </Badge>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex flex-col items-center">
                <Package className="w-4 h-4 text-[#2C4A3E]" />
                <div className="w-px h-6 bg-[#C9A96E]/30 my-1" />
                <MapPin className="w-4 h-4 text-[#C9A96E]" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p
                    className="text-[10px] text-[#7A7168] tracking-wider uppercase"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    Pickup
                  </p>
                  <p
                    className="text-sm font-semibold text-[#2C2C2C]"
                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                  >
                    {activeDelivery.restaurant}
                  </p>
                </div>
                <div>
                  <p
                    className="text-[10px] text-[#7A7168] tracking-wider uppercase"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    Drop-off
                  </p>
                  <p
                    className="text-sm font-semibold text-[#2C2C2C]"
                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                  >
                    {activeDelivery.customer}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className="text-lg font-bold text-[#1B2A4A]"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  ₹{activeDelivery.earnings}
                </p>
                <p
                  className="text-xs text-[#7A7168]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {activeDelivery.eta} min left
                </p>
              </div>
            </div>

            {/* Distance Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-[9px] text-[#7A7168] tracking-wider uppercase"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Delivery Progress
                </span>
                <span
                  className="text-[9px] text-[#2C4A3E] font-semibold"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {Math.round(deliveryProgress)}%
                </span>
              </div>
              <div className="w-full bg-[#F0EBE4] rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-[#2C4A3E] to-[#1A6B4A]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.max(deliveryProgress, 10)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1B2A4A] rounded-lg text-sm font-semibold text-[#FAF7F2] active:scale-[0.97] transition-all duration-200 shadow-sm"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                <Navigation className="w-4 h-4" />
                Navigate
              </button>
              <motion.button
                onClick={handleDelivered}
                whileTap={{ scale: 0.95 }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#2C4A3E] hover:bg-[#1A6B4A] rounded-lg text-sm font-semibold text-white transition-all duration-200 shadow-sm"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                <motion.div
                  animate={showDeliveredSuccess ? { scale: [1, 1.3, 1], rotate: [0, 360] } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </motion.div>
                {showDeliveredSuccess ? 'Done!' : 'Delivered'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Order Feed */}
      <div className="px-4 pt-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className="text-sm font-semibold text-[#2C2C2C] tracking-wide"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            {isOnline ? 'Incoming Orders' : 'You\'re Offline'}
          </h2>
          {isOnline && (
            <span
              className="text-[10px] text-[#2C4A3E] font-medium flex items-center gap-1 tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2C4A3E] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#1A6B4A]" />
              </span>
              Listening
            </span>
          )}
        </div>

        {!isOnline && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-[#F0EBE4] flex items-center justify-center mb-5 border border-[#D5CBBF]">
              <Bike className="w-10 h-10 text-[#7A7168]" />
            </div>
            <p
              className="text-[#7A7168] text-sm font-medium"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Go online to start receiving orders
            </p>
            <p
              className="text-[#7A7168]/60 text-xs mt-1 mb-5"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Toggle the switch above or tap below
            </p>
            {/* Go Online CTA Button */}
            <motion.button
              onClick={() => setOnline(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-3 bg-[#1B2A4A] rounded-xl text-sm font-semibold text-[#FAF7F2] shadow-md active:shadow-sm transition-all duration-200"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              <Power className="w-4 h-4" />
              Go Online to Start
            </motion.button>
          </div>
        )}

        {/* Waiting for orders - enhanced animated pulse */}
        {isOnline && filteredOrders.length === 0 && !activeDelivery && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            {/* Multi-ring pulse animation */}
            <div className="relative w-24 h-24 flex items-center justify-center mb-5">
              {/* Outer ring */}
              <motion.div
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.15, 0.05, 0.15],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-full border-2 border-[#1B2A4A]/20"
              />
              {/* Middle ring */}
              <motion.div
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.2, 0.08, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.3,
                }}
                className="absolute inset-2 rounded-full border border-[#C9A96E]/30"
              />
              {/* Inner circle */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1B2A4A]/8 to-[#C9A96E]/10 flex items-center justify-center"
              >
                <Bike className="w-7 h-7 text-[#1B2A4A]/50" />
              </motion.div>
            </div>

            {/* Animated dots text */}
            <div className="flex items-center gap-0.5">
              <p
                className="text-[#1B2A4A]/60 text-sm font-medium"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                Waiting for orders
              </p>
              <span className="flex gap-0.5 ml-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: 'easeInOut',
                    }}
                    className="text-[#1B2A4A]/60 text-sm"
                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                  >
                    .
                  </motion.span>
                ))}
              </span>
            </div>
            <p
              className="text-[#7A7168]/50 text-xs mt-1.5"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              New orders will appear here
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {isOnline && filteredOrders.map((order, index) => {
            const config = PLATFORM_CONFIG[order.platform];
            const timeLeft = timers[order.id] ?? order.timer;
            const isUrgent = timeLeft <= 10 && timeLeft > 0;
            const isStacked = !!order.stackId;
            const stackCount = order.stackId ? (stackCounts[order.stackId] || 1) : 1;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: 30, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -80, scale: 0.95 }}
                transition={{
                  duration: 0.5,
                  delay: order.isNew ? 0.08 * index : 0,
                  type: 'spring',
                  stiffness: 120,
                }}
              >
                <div
                  className={`rounded-xl bg-white overflow-hidden card-elegant relative ${
                    order.isNew ? 'animate-navy-pulse' : ''
                  }`}
                  style={{ borderLeft: `4px solid ${config?.color || '#7A7168'}` }}
                >
                  {/* Swipe hint overlay - subtle directional indicators */}
                  <div className="absolute inset-y-0 left-0 w-8 flex items-center justify-center opacity-[0.07] pointer-events-none">
                    <ChevronLeft className="w-4 h-4 text-[#722F37]" />
                  </div>
                  <div className="absolute inset-y-0 right-0 w-8 flex items-center justify-center opacity-[0.07] pointer-events-none">
                    <ChevronRight className="w-4 h-4 text-[#1B2A4A]" />
                  </div>
                  {/* Swipe hint bottom text */}
                  <div className="flex items-center justify-center pt-1 pb-0">
                    <motion.p
                      animate={{ opacity: [0.15, 0.35, 0.15] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-[8px] text-[#7A7168] tracking-widest uppercase flex items-center gap-2"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      <ChevronLeft className="w-2.5 h-2.5" />
                      swipe to decline
                      <span className="text-[#C9A96E]">|</span>
                      accept
                      <ChevronRight className="w-2.5 h-2.5" />
                    </motion.p>
                  </div>

                  <div className="p-4 pt-2">
                    {/* Platform + Timer Row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-[#C9A96E]/20"
                          style={{ backgroundColor: config?.color || '#7A7168' }}
                        >
                          {config?.letter || order.platform[0].toUpperCase()}
                        </div>
                        <span
                          className="text-[11px] font-semibold tracking-[0.1em]"
                          style={{ color: config?.color || '#7A7168', fontFamily: 'var(--font-lora), serif' }}
                        >
                          {config?.name || order.platform}
                        </span>
                        {order.rank && order.rank <= 3 && (
                          <Badge className="bg-[#1B2A4A]/8 text-[#1B2A4A] border-[#1B2A4A]/15 text-[9px] px-1.5 py-0">
                            <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                            RANK #{order.rank}
                          </Badge>
                        )}
                        {/* Smart Stack Badge with count */}
                        {isStacked && (
                          <Badge className="bg-[#C9A96E]/15 text-[#8B5E3C] border-[#C9A96E]/25 text-[9px] px-1.5 py-0">
                            <Layers className="w-2.5 h-2.5 mr-0.5" />
                            {stackCount > 1 ? `${stackCount}× ` : ''}SMART STACK
                          </Badge>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 ${isUrgent ? 'animate-timer-urgent' : ''}`}>
                        <Clock className="w-3.5 h-3.5 text-[#7A7168]" />
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            isUrgent ? 'text-[#722F37]' : timeLeft <= 15 ? 'text-[#8B5E3C]' : 'text-[#7A7168]'
                          }`}
                        >
                          {timeLeft}s
                        </span>
                      </div>
                    </div>

                    {/* Restaurant + Distance */}
                    <h3
                      className="text-[#2C2C2C] font-bold text-base mb-1"
                      style={{ fontFamily: 'var(--font-playfair), serif' }}
                    >
                      {order.restaurant}{' '}
                      <span
                        className="text-[#7A7168] font-normal text-sm"
                        style={{ fontFamily: 'var(--font-lora), serif' }}
                      >
                        — {order.distance} km
                      </span>
                    </h3>

                    {/* Pickup / Drop */}
                    <div className="flex items-start gap-2 mb-3">
                      <div className="flex flex-col items-center mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-[#2C4A3E]" />
                        <div className="w-px h-4 bg-[#D5CBBF]" />
                        <div className="w-2 h-2 rounded-full bg-[#C9A96E]" />
                      </div>
                      <div className="space-y-1.5">
                        <p
                          className="text-xs text-[#7A7168]"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          {order.pickup}
                        </p>
                        <p
                          className="text-xs text-[#7A7168]"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          {order.drop}
                        </p>
                      </div>
                    </div>

                    {/* Earnings + Time + Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p
                            className="text-2xl font-bold text-[#1B2A4A]"
                            style={{ fontFamily: 'var(--font-playfair), serif' }}
                          >
                            ₹{order.earnings}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[#7A7168]">
                          <Clock className="w-3 h-3" />
                          <span
                            className="text-xs"
                            style={{ fontFamily: 'var(--font-lora), serif' }}
                          >
                            {order.estimatedTime} min
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecline(order.id)}
                          className="px-3 py-2 text-xs text-[#7A7168] hover:text-[#722F37] transition-colors duration-200"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          Decline
                        </button>
                        <motion.button
                          onClick={() => handleAccept(order.id)}
                          whileTap={{ scale: 0.93 }}
                          whileHover={{ scale: 1.02 }}
                          className="px-5 py-2.5 bg-[#1B2A4A] hover:bg-[#2A3F6A] rounded-lg text-sm font-semibold text-[#FAF7F2] shadow-sm transition-all duration-200"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          ACCEPT
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Accepted Orders Summary */}
        {acceptedOrderIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#2C4A3E]/8 border border-[#2C4A3E]/15 rounded-xl p-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#2C4A3E]" />
              <span
                className="text-sm font-semibold text-[#2C4A3E]"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                {acceptedOrderIds.length} order{acceptedOrderIds.length > 1 ? 's' : ''} accepted
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Stats Bar - enhanced with gradient */}
      <div className="fixed bottom-20 left-0 right-0 max-w-lg mx-auto px-4 z-30">
        <motion.div
          layout
          className="overflow-hidden card-elegant rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF7F2 40%, #F5F0EB 70%, #FFFFFF 100%)',
            boxShadow: '0 2px 12px rgba(44, 44, 44, 0.08), 0 4px 24px rgba(44, 44, 44, 0.06), 0 0 0 1px rgba(213, 203, 191, 0.5)',
          }}
        >
          {/* Top gold accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#C9A96E]/40 to-transparent" />

          <button
            onClick={() => setShowStats(!showStats)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-5">
              {/* Earnings - highlighted as primary stat */}
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#C9A96E] to-[#A88B52]" />
                <span
                  className="text-[#1B2A4A] font-bold text-base"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  ₹{todayEarnings.toLocaleString()}
                </span>
                <span
                  className="text-[9px] text-[#7A7168] tracking-wider uppercase"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  earned
                </span>
              </div>
              {/* Orders */}
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[#2C2C2C] font-bold text-sm"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  {todayOrders}
                </span>
                <span
                  className="text-[9px] text-[#7A7168] tracking-wider uppercase"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  orders
                </span>
              </div>
              {/* Online time */}
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[#2C2C2C] font-bold text-sm"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  {formatOnlineTime(totalOnlineTime)}
                </span>
                <span
                  className="text-[9px] text-[#7A7168] tracking-wider uppercase"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  online
                </span>
              </div>
            </div>
            <motion.div
              animate={{ rotate: showStats ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronUp className="w-4 h-4 text-[#7A7168]" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 space-y-2 border-t border-[#D5CBBF]/50 pt-3">
                  <div className="flex justify-between text-xs">
                    <span
                      className="text-[#7A7168]"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      Acceptance Rate
                    </span>
                    <span
                      className="text-[#2C4A3E] font-semibold"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      87%
                    </span>
                  </div>
                  <div className="w-full bg-[#F0EBE4] rounded-full h-1.5">
                    <div className="bg-[#2C4A3E] h-1.5 rounded-full" style={{ width: '87%' }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                      Avg. Delivery Time
                    </span>
                    <span className="text-[#2C2C2C] font-semibold" style={{ fontFamily: 'var(--font-lora), serif' }}>
                      18 min
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                      Peak Earnings Today
                    </span>
                    <span className="text-[#8B5E3C] font-semibold" style={{ fontFamily: 'var(--font-lora), serif' }}>
                      ₹320 (12pm-1pm)
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                      This Week Trend
                    </span>
                    <span className="text-[#2C4A3E] font-semibold flex items-center gap-0.5" style={{ fontFamily: 'var(--font-lora), serif' }}>
                      <TrendingUp className="w-3 h-3" /> +12%
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom gold accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}
