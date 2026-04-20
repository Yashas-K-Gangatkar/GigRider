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
  X,
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
  swiggy: { name: 'SWIGGY', color: '#FC8019', bg: 'bg-[#FC8019]', letter: 'S' },
  zomato: { name: 'ZOMATO', color: '#E23744', bg: 'bg-[#E23744]', letter: 'Z' },
  ubereats: { name: 'UBER EATS', color: '#06C167', bg: 'bg-[#06C167]', letter: 'U' },
  doordash: { name: 'DOORDASH', color: '#FF3008', bg: 'bg-[#FF3008]', letter: 'D' },
  grubhub: { name: 'GRUBHUB', color: '#F06617', bg: 'bg-[#F06617]', letter: 'G' },
};

const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1',
    platform: 'swiggy',
    restaurant: 'Pizza Hut',
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
    restaurant: 'Domino\'s Pizza',
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
    restaurant: 'McDonald\'s',
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
    restaurant: 'Chennai Express',
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
    restaurant: 'Biryani Blues',
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
  restaurant: 'Truffles',
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
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#222222]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-wider text-white">
              GIG<span className="text-green-400">RIDER</span>
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
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                  </span>
                  <span className="text-[10px] font-bold text-green-400 tracking-widest">LIVE</span>
                </motion.div>
              )}
              <Switch
                checked={isOnline}
                onCheckedChange={setIsOnline}
                className={`${isOnline ? 'bg-green-500' : 'bg-zinc-600'} data-[state=checked]:bg-green-500`}
              />
            </div>

            {/* Notification Bell */}
            <button className="relative p-1.5">
              <Bell className="w-5 h-5 text-zinc-400" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
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
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ backgroundColor: config.color }}
                >
                  {config.letter}
                </div>
                <span className="relative flex h-2 w-2">
                  {isOnline && (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </>
                  )}
                  {!isOnline && <span className="inline-flex rounded-full h-2 w-2 bg-zinc-600" />}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Mode Toggle */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-1 bg-[#141414] rounded-lg p-1">
          <button
            onClick={() => setSmartMode('auto-rank')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${
              smartMode === 'auto-rank'
                ? 'bg-green-500/20 text-green-400'
                : 'text-zinc-500 hover:text-zinc-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Auto-Rank
          </button>
          <button
            onClick={() => setSmartMode('first-come')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${
              smartMode === 'first-come'
                ? 'bg-green-500/20 text-green-400'
                : 'text-zinc-500 hover:text-zinc-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            First Come
          </button>
        </div>
      </div>

      {/* Active Delivery Card */}
      {activeDelivery && isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pt-3"
        >
          <div className="border-2 border-green-500/60 rounded-xl bg-[#141414] p-4 animate-border-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: PLATFORM_CONFIG[activeDelivery.platform].color }}
                >
                  {PLATFORM_CONFIG[activeDelivery.platform].letter}
                </div>
                <span className="text-[10px] font-bold tracking-wider text-zinc-400">
                  {PLATFORM_CONFIG[activeDelivery.platform].name}
                </span>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">
                <Bike className="w-3 h-3 mr-1" />
                DELIVERING
              </Badge>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex flex-col items-center">
                <Package className="w-4 h-4 text-green-400" />
                <div className="w-px h-6 bg-green-500/30 my-1" />
                <MapPin className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-xs text-zinc-500">Pickup</p>
                  <p className="text-sm font-semibold text-white">{activeDelivery.restaurant}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Drop-off</p>
                  <p className="text-sm font-semibold text-white">{activeDelivery.customer}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-400">₹{activeDelivery.earnings}</p>
                <p className="text-xs text-zinc-500">{activeDelivery.eta} min left</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 rounded-lg text-sm font-bold text-white active:scale-95 transition-transform">
                <Navigation className="w-4 h-4" />
                Navigate
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1E1E1E] border border-green-500/30 rounded-lg text-sm font-semibold text-green-400 active:scale-95 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
                Mark Delivered
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Order Feed */}
      <div className="px-4 pt-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-300">
            {isOnline ? 'Incoming Orders' : 'You\'re Offline'}
          </h2>
          {isOnline && (
            <span className="text-[10px] text-green-400 font-semibold flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              Listening...
            </span>
          )}
        </div>

        {!isOnline && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <Bike className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-zinc-500 text-sm font-medium">Go online to start receiving orders</p>
            <p className="text-zinc-600 text-xs mt-1">Toggle the switch above to get started</p>
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
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -100, scale: 0.9 }}
                  transition={{
                    duration: 0.4,
                    delay: order.isNew ? 0.1 * index : 0,
                    type: 'spring',
                    stiffness: 150,
                  }}
                >
                  <div
                    className={`rounded-xl bg-[#141414] overflow-hidden ${
                      order.isNew ? 'animate-green-pulse' : ''
                    }`}
                    style={{ borderLeft: `4px solid ${config.color}` }}
                  >
                    <div className="p-4">
                      {/* Platform + Timer Row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: config.color }}
                          >
                            {config.letter}
                          </div>
                          <span
                            className="text-[11px] font-bold tracking-wider"
                            style={{ color: config.color }}
                          >
                            {config.name}
                          </span>
                          {order.rank && order.rank <= 3 && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[9px] px-1.5 py-0">
                              <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                              RANK #{order.rank}
                            </Badge>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 ${isUrgent ? 'animate-timer-urgent' : ''}`}>
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span
                            className={`text-sm font-bold tabular-nums ${
                              isUrgent ? 'text-red-500' : timeLeft <= 15 ? 'text-amber-400' : 'text-zinc-400'
                            }`}
                          >
                            {timeLeft}s
                          </span>
                        </div>
                      </div>

                      {/* Restaurant + Distance */}
                      <h3 className="text-white font-bold text-base mb-1">
                        {order.restaurant}{' '}
                        <span className="text-zinc-500 font-normal text-sm">— {order.distance} km</span>
                      </h3>

                      {/* Pickup / Drop */}
                      <div className="flex items-start gap-2 mb-3">
                        <div className="flex flex-col items-center mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <div className="w-px h-4 bg-zinc-700" />
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs text-zinc-400">{order.pickup}</p>
                          <p className="text-xs text-zinc-400">{order.drop}</p>
                        </div>
                      </div>

                      {/* Earnings + Time + Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-2xl font-black text-green-400">₹{order.earnings}</p>
                          </div>
                          <div className="flex items-center gap-1 text-zinc-500">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{order.estimatedTime} min</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDecline(order.id)}
                            className="px-3 py-2 text-xs text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            Decline
                          </button>
                          <motion.button
                            onClick={() => handleAccept(order.id)}
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.02 }}
                            className="px-5 py-2.5 bg-green-500 hover:bg-green-400 rounded-lg text-sm font-bold text-white shadow-lg shadow-green-500/25 active:shadow-green-500/50 transition-all"
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/20 rounded-xl p-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-sm font-semibold text-green-400">
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
          className="bg-[#141414] border border-[#222222] rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setShowStats(!showStats)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-green-400 font-bold text-sm">₹1,247</span>
                <span className="text-[10px] text-zinc-600">earned</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold text-sm">8</span>
                <span className="text-[10px] text-zinc-600">orders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold text-sm">4h 23m</span>
                <span className="text-[10px] text-zinc-600">online</span>
              </div>
            </div>
            {showStats ? (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            ) : (
              <ChevronUp className="w-4 h-4 text-zinc-500" />
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
                <div className="px-4 pb-3 space-y-2 border-t border-[#222222] pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Acceptance Rate</span>
                    <span className="text-green-400 font-semibold">87%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '87%' }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Avg. Delivery Time</span>
                    <span className="text-white font-semibold">18 min</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Peak Earnings Today</span>
                    <span className="text-amber-400 font-semibold">₹320 (12pm-1pm)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">This Week Trend</span>
                    <span className="text-green-400 font-semibold flex items-center gap-0.5">
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
