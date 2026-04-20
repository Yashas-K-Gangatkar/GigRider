'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  ArrowUpRight,
  Wallet,
  Gift,
  Calendar,
  Banknote,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const PLATFORM_EARNINGS = [
  { platform: 'Swiggy', amount: 3200, color: '#FC8019', percentage: 38 },
  { platform: 'Zomato', amount: 2800, color: '#E23744', percentage: 33 },
  { platform: 'Uber Eats', amount: 1450, color: '#06C167', percentage: 17 },
  { platform: 'DoorDash', amount: 1000, color: '#FF3008', percentage: 12 },
];

const DAILY_EARNINGS = [
  { day: 'Mon', amount: 1120, isBest: false },
  { day: 'Tue', amount: 1450, isBest: false },
  { day: 'Wed', amount: 980, isBest: false },
  { day: 'Thu', amount: 1680, isBest: true },
  { day: 'Fri', amount: 1320, isBest: false },
  { day: 'Sat', amount: 1100, isBest: false },
  { day: 'Sun', amount: 800, isBest: false },
];

const TRANSACTIONS = [
  { date: 'Today', platform: 'Swiggy', restaurant: 'Pizza Hut', amount: 45, status: 'completed' as const },
  { date: 'Today', platform: 'Zomato', restaurant: 'Truffles', amount: 55, status: 'completed' as const },
  { date: 'Today', platform: 'Uber Eats', restaurant: 'McDonald\'s', amount: 38, status: 'in-progress' as const },
  { date: 'Yesterday', platform: 'Swiggy', restaurant: 'Biryani Blues', amount: 48, status: 'completed' as const },
  { date: 'Yesterday', platform: 'DoorDash', restaurant: 'Chennai Express', amount: 65, status: 'completed' as const },
  { date: 'Yesterday', platform: 'Zomato', restaurant: 'Domino\'s', amount: 52, status: 'completed' as const },
  { date: '2 days ago', platform: 'Swiggy', restaurant: 'KFC', amount: 42, status: 'completed' as const },
  { date: '2 days ago', platform: 'Uber Eats', restaurant: 'Subway', amount: 35, status: 'completed' as const },
];

function AnimatedCounter({ target, prefix = '₹', duration = 1500 }: { target: number; prefix?: string; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return (
    <span>
      {prefix}{count.toLocaleString()}
    </span>
  );
}

const PLATFORM_COLORS: Record<string, string> = {
  Swiggy: '#FC8019',
  Zomato: '#E23744',
  'Uber Eats': '#06C167',
  DoorDash: '#FF3008',
};

export default function EarningsScreen() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const totalEarnings = period === 'week' ? 8450 : 32450;
  const comparedPercent = period === 'week' ? 12 : 8;

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#222222] px-4 py-3">
        <h1 className="text-lg font-bold text-white">Earnings</h1>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#141414] to-[#1E1E1E] rounded-xl p-5 border border-[#222222]"
        >
          <div className="flex items-center justify-between mb-4">
            <Tabs value={period} onValueChange={(v) => setPeriod(v as 'week' | 'month')}>
              <TabsList className="bg-[#0A0A0A] h-8">
                <TabsTrigger value="week" className="text-xs px-3 h-6 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                  This Week
                </TabsTrigger>
                <TabsTrigger value="month" className="text-xs px-3 h-6 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                  This Month
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="text-center mb-3">
            <p className="text-4xl font-black text-white">
              <AnimatedCounter target={totalEarnings} />
            </p>
            <p className="text-xs text-zinc-500 mt-1">Total Earnings</p>
          </div>

          <div className="flex items-center justify-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-green-400" />
            <span className="text-sm font-semibold text-green-400">{comparedPercent}% from last {period === 'week' ? 'week' : 'month'}</span>
          </div>
        </motion.div>

        {/* Platform Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#141414] rounded-xl p-4 border border-[#222222]"
        >
          <h3 className="text-sm font-bold text-zinc-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Earnings by Platform
          </h3>

          <div className="space-y-3">
            {PLATFORM_EARNINGS.map((item, index) => (
              <motion.div
                key={item.platform}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.platform[0]}
                    </div>
                    <span className="text-sm text-white font-medium">{item.platform}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">₹{item.amount.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-500">{item.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-[#0A0A0A] rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Daily Earnings Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#141414] rounded-xl p-4 border border-[#222222]"
        >
          <h3 className="text-sm font-bold text-zinc-300 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-400" />
            Daily Earnings
          </h3>

          <div className="grid grid-cols-7 gap-2">
            {DAILY_EARNINGS.map((day) => (
              <div key={day.day} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-zinc-500">{day.day}</span>
                <div
                  className={`w-full aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold ${
                    day.isBest
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-[#1E1E1E] text-zinc-300'
                  }`}
                >
                  {(day.amount / 100).toFixed(0)}h
                </div>
                <span className={`text-[9px] ${day.isBest ? 'text-green-400 font-semibold' : 'text-zinc-600'}`}>
                  ₹{(day.amount / 100).toFixed(0)}h
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-zinc-600 mt-2 text-center">
            Values shown as hundreds (₹11 = ₹1,100)
          </p>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#141414] rounded-xl border border-[#222222] overflow-hidden"
        >
          <div className="p-4 pb-2">
            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-green-400" />
              Recent Transactions
            </h3>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {TRANSACTIONS.map((tx, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center justify-between px-4 py-3 border-b border-[#1E1E1E] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: PLATFORM_COLORS[tx.platform] || '#666' }}
                  >
                    {tx.platform[0]}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{tx.restaurant}</p>
                    <p className="text-[10px] text-zinc-500">{tx.platform} · {tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-400">+₹{tx.amount}</p>
                  <Badge
                    className={`text-[8px] px-1 py-0 ${
                      tx.status === 'completed'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {tx.status === 'completed' ? 'Done' : 'Active'}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Payout Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#141414] rounded-xl p-4 border border-[#222222]"
        >
          <h3 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-green-400" />
            Payouts
          </h3>

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-zinc-500">Current Balance</p>
              <p className="text-2xl font-black text-white">₹2,450</p>
            </div>
            <button className="px-4 py-2 bg-green-500 rounded-lg text-sm font-bold text-white active:scale-95 transition-transform">
              Withdraw
            </button>
          </div>

          <div className="bg-[#1E1E1E] rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white">
                🏦
              </div>
              <div>
                <p className="text-xs text-white font-medium">HDFC Bank ****4523</p>
                <p className="text-[10px] text-zinc-500">Savings Account</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-amber-500/10 to-green-500/10 rounded-xl p-4 border border-amber-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-amber-400">Tips Earned</h3>
          </div>
          <p className="text-2xl font-black text-white mb-1">
            ₹<AnimatedCounter target={680} prefix="" />
          </p>
          <p className="text-xs text-zinc-400">This Week</p>
          <div className="flex items-center gap-1 mt-2">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <p className="text-xs text-amber-400">3 customers tipped today!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
