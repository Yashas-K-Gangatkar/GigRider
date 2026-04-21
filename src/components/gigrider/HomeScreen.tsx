'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
  platform: 'swiggy' | 'zomato' | 'ubereats' | 'doordash' | 'grubhub';
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

interface ActiveDelivery {
  id: string;
  platform: 'swiggy' | 'zomato' | 'ubereats' | 'doordash';
  restaurant: string;
  customer: string;
  eta: number;
  earnings: number;
}

const PLATFORM_CONFIG = {
  swiggy: { name: 'FOOD DELIVERY S', color: '#B87333', bg: 'bg-[#B87333]', letter: 'S' },
  zomato: { name: 'FOOD DELIVERY Z', color: '#943540', bg: 'bg-[#943540]', letter: 'Z' },
  ubereats: { name: 'MEAL DELIVERY U', color: '#2C7A5F', bg: 'bg-[#2C7A5F]', letter: 'U' },
  doordash: { name: 'DELIVERY D', color: '#A84020', bg: 'bg-[#A84020]', letter: 'D' },
  grubhub: { name: 'FOOD G', color: '#9E6B2F', bg: 'bg-[#9E6B2F]', letter: 'G' },
};

const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1',
    platform: 'swiggy',
    restaurant: 'The Grand Kitchens',
    distance: 2.3,
    pickup: 'MG Road Metro Station',
    drop: 'Koramangala 5th Block',
    earnings: 45,
    estimatedTime: 15,
    rank: 1,
    timer: 30,
    isNew: true,
  },
  {
    id: 'ord-2',
    platform: 'zomato',
    restaurant: 'Dominique\'s Pizzeria',
    distance: 3.1,
    pickup: 'Indiranagar 100ft Road',
    drop: 'HSR Layout Sector 2',
    earnings: 52,
    estimatedTime: 20,
    rank: 2,
    timer: 25,
    isNew: true,
  },
  {
    id: 'ord-3',
    platform: 'ubereats',
    restaurant: 'McKinley\'s Grill',
    distance: 1.8,
    pickup: 'Whitefield Main Rd',
    drop: 'ITPL Back Gate',
    earnings: 38,
    estimatedTime: 12,
    rank: 3,
    timer: 22,
    isNew: false,
  },
  {
    id: 'ord-4',
    platform: 'doordash',
    restaurant: 'The Spice Heritage',
    distance: 4.5,
    pickup: 'Jayanagar 4th Block',
    drop: 'BTM 2nd Stage',
    earnings: 65,
    estimatedTime: 25,
    timer: 18,
    isNew: false,
  },
  {
    id: 'ord-5',
    platform: 'swiggy',
    restaurant: 'Royal Biryani House',
    distance: 2.0,
    pickup: 'HSR BDA Complex',
    drop: 'Bellandur Outer Ring Rd',
    earnings: 48,
    estimatedTime: 14,
    timer: 28,
    isNew: true,
  },
];

const ACTIVE_DELIVERY: ActiveDelivery = {
  id: 'act-1',
  platform: 'zomato',
  restaurant: 'The Truffle Club',
  customer: 'St. Mark\'s Road',
  eta: 8,
  earnings: 55,
};

export default function HomeScreen() {
  const [isOnline, setIsOnline] = useState(true);
  const [smartMode, setSmartMode] = useState<'auto-rank' | 'first-come'>('auto-rank');
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [acceptedOrders, setAcceptedOrders] = useState<Set<string>>(new Set());
  const [declinedOrders, setDeclinedOrders] = useState<Set<string>>(new Set());
  const [showStats, setShowStats] = useState(false);
  const initialTimers: Record<string, number> = {};
  MOCK_ORDERS.forEach((order) => {
    initialTimers[order.id] = order.timer;
  });
  const [timers, setTimers] = useState<Record<string, number>>(initialTimers);
  const [activeDelivery] = useState<ActiveDelivery | null>(ACTIVE_DELIVERY);
  const [notificationCount] = useState(3);

  // Countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          if (next[id] > 0 && !acceptedOrders.has(id) && !declinedOrders.has(id)) {
            next[id] -= 1;
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [acceptedOrders, declinedOrders]);

  const handleAccept = useCallback((orderId: string) => {
    setAcceptedOrders((prev) => new Set(prev).add(orderId));
  }, []);

  const handleDecline = useCallback((orderId: string) => {
    setDeclinedOrders((prev) => new Set(prev).add(orderId));
  }, []);

  const activePlatforms = ['swiggy', 'zomato', 'ubereats', 'doordash'];

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
                onCheckedChange={setIsOnline}
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
            const config = PLATFORM_CONFIG[p as keyof typeof PLATFORM_CONFIG];
            return (
              <div key={p} className="flex items-center gap-1.5 shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white border border-[#C9A96E]/30"
                  style={{ backgroundColor: config.color }}
                >
                  {config.letter}
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
                  style={{ backgroundColor: PLATFORM_CONFIG[activeDelivery.platform].color }}
                >
                  {PLATFORM_CONFIG[activeDelivery.platform].letter}
                </div>
                <span
                  className="text-[10px] font-bold tracking-[0.12em] text-[#7A7168] uppercase"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {PLATFORM_CONFIG[activeDelivery.platform].name}
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
          {isOnline && orders
            .filter((o) => !declinedOrders.has(o.id) && !acceptedOrders.has(o.id))
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
                    style={{ borderLeft: `4px solid ${config.color}` }}
                  >
                    <div className="p-4">
                      {/* Platform + Timer Row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-[#C9A96E]/20"
                            style={{ backgroundColor: config.color }}
                          >
                            {config.letter}
                          </div>
                          <span
                            className="text-[11px] font-semibold tracking-[0.1em]"
                            style={{ color: config.color, fontFamily: 'var(--font-lora), serif' }}
                          >
                            {config.name}
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
        {acceptedOrders.size > 0 && (
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
                {acceptedOrders.size} order{acceptedOrders.size > 1 ? 's' : ''} accepted
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
                  ₹1,247
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
                  8
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
                  4h 23m
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
