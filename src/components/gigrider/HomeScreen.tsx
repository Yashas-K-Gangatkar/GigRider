'use client';

import { useState } from 'react';
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
  ChevronDown,
  Bike,
  Package,
} from 'lucide-react';

interface Order {
  id: string;
  platform: PlatformId;
  restaurant: string;
  distance: number;
  pickup: string;
  drop: string;
  earnings: number;
  estimatedTime: number;
  rank?: number;
  timer: number;
  isNew: boolean;
}

const PLATFORM_CONFIG: Record<string, { name: string; color: string; bg: string; letter: string }> = {};
Object.entries(PLATFORMS).forEach(([id, p]) => {
  PLATFORM_CONFIG[id] = { name: p.name, color: p.color, bg: `bg-[${p.color}]`, letter: p.letter };
});

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

  const setOnline = useGigRiderStore(s => s.setOnline);
  const setSmartMode = useGigRiderStore(s => s.setSmartMode);
  const acceptOrder = useGigRiderStore(s => s.acceptOrder);
  const declineOrder = useGigRiderStore(s => s.declineOrder);
  const completeActiveDelivery = useGigRiderStore(s => s.completeActiveDelivery);

  const timers = useOrderTimers();
  const [showStats, setShowStats] = useState(false);
  const [notificationCount] = useState(3);

  const handleAccept = (orderId: string) => {
    acceptOrder(orderId);
  };

  const handleDecline = (orderId: string) => {
    declineOrder(orderId);
  };

  const handleDelivered = () => {
    completeActiveDelivery();
  };

  const activePlatforms = connectedPlatforms.map(p => p.id);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
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

            {/* Notification Bell */}
            <button className="relative p-1.5">
              <Bell className="w-5 h-5 text-[#7A7168]" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#722F37] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
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

      {/* Smart Mode Toggle */}
      <div className="px-4 pt-3">
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

            <div className="flex gap-2">
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1B2A4A] rounded-lg text-sm font-semibold text-[#FAF7F2] active:scale-[0.97] transition-all duration-200 shadow-sm"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                <Navigation className="w-4 h-4" />
                Navigate
              </button>
              <button
                onClick={handleDelivered}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white border border-[#1B2A4A]/30 rounded-lg text-sm font-semibold text-[#1B2A4A] active:scale-[0.97] transition-all duration-200"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                <CheckCircle2 className="w-4 h-4" />
                Delivered
              </button>
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
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F0EBE4] flex items-center justify-center mb-4 border border-[#D5CBBF]">
              <Bike className="w-8 h-8 text-[#7A7168]" />
            </div>
            <p
              className="text-[#7A7168] text-sm font-medium"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Go online to start receiving orders
            </p>
            <p
              className="text-[#7A7168]/60 text-xs mt-1"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Toggle the switch above to begin
            </p>
          </div>
        )}

        <AnimatePresence>
          {isOnline && incomingOrders
            .filter((o) => !declinedOrderIds.has(o.id) && !acceptedOrderIds.has(o.id))
            .sort((a, b) => {
              if (smartMode === 'auto-rank') {
                return (a.rank ?? 99) - (b.rank ?? 99);
              }
              return 0;
            })
            .map((order, index) => {
              const config = PLATFORM_CONFIG[order.platform];
              const timeLeft = timers[order.id] ?? order.timer;
              const isUrgent = timeLeft <= 10 && timeLeft > 0;

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
                    className={`rounded-xl bg-white overflow-hidden card-elegant ${
                      order.isNew ? 'animate-navy-pulse' : ''
                    }`}
                    style={{ borderLeft: `4px solid ${config?.color || '#7A7168'}` }}
                  >
                    <div className="p-4">
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
        {acceptedOrderIds.size > 0 && (
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
                {acceptedOrderIds.size} order{acceptedOrderIds.size > 1 ? 's' : ''} accepted
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Stats Bar */}
      <div className="fixed bottom-20 left-0 right-0 max-w-lg mx-auto px-4 z-30">
        <motion.div
          layout
          className="bg-white border border-[#D5CBBF] rounded-xl overflow-hidden card-elegant"
        >
          <button
            onClick={() => setShowStats(!showStats)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[#1B2A4A] font-bold text-sm"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  ₹{todayEarnings.toLocaleString()}
                </span>
                <span
                  className="text-[10px] text-[#7A7168] tracking-wider uppercase"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  earned
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[#2C2C2C] font-bold text-sm"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  {todayOrders}
                </span>
                <span
                  className="text-[10px] text-[#7A7168] tracking-wider uppercase"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  orders
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[#2C2C2C] font-bold text-sm"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  {formatOnlineTime(totalOnlineTime)}
                </span>
                <span
                  className="text-[10px] text-[#7A7168] tracking-wider uppercase"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  online
                </span>
              </div>
            </div>
            {showStats ? (
              <ChevronDown className="w-4 h-4 text-[#7A7168]" />
            ) : (
              <ChevronUp className="w-4 h-4 text-[#7A7168]" />
            )}
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
                <div className="px-4 pb-3 space-y-2 border-t border-[#D5CBBF] pt-3">
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
        </motion.div>
      </div>
    </div>
  );
}
