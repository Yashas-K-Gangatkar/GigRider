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
  { platform: 'Food Delivery S', amount: 3200, color: '#B87333', percentage: 38 },
  { platform: 'Food Delivery Z', amount: 2800, color: '#943540', percentage: 33 },
  { platform: 'Meal Delivery U', amount: 1450, color: '#2C7A5F', percentage: 17 },
  { platform: 'Delivery D', amount: 1000, color: '#A84020', percentage: 12 },
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
  { date: 'Today', platform: 'Food Delivery S', restaurant: 'The Grand Kitchens', amount: 45, status: 'completed' as const },
  { date: 'Today', platform: 'Food Delivery Z', restaurant: 'The Truffle Club', amount: 55, status: 'completed' as const },
  { date: 'Today', platform: 'Meal Delivery U', restaurant: 'McKinley\'s Grill', amount: 38, status: 'in-progress' as const },
  { date: 'Yesterday', platform: 'Food Delivery S', restaurant: 'Royal Biryani House', amount: 48, status: 'completed' as const },
  { date: 'Yesterday', platform: 'Delivery D', restaurant: 'The Spice Heritage', amount: 65, status: 'completed' as const },
  { date: 'Yesterday', platform: 'Food Delivery Z', restaurant: 'Dominique\'s', amount: 52, status: 'completed' as const },
  { date: '2 days ago', platform: 'Food Delivery S', restaurant: 'Colonel\'s Kitchen', amount: 42, status: 'completed' as const },
  { date: '2 days ago', platform: 'Meal Delivery U', restaurant: 'The Garden Table', amount: 35, status: 'completed' as const },
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
    <span style={{ fontFamily: 'var(--font-playfair), serif' }}>
      {prefix}{count.toLocaleString()}
    </span>
  );
}

const PLATFORM_COLORS: Record<string, string> = {
  'Food Delivery S': '#B87333',
  'Food Delivery Z': '#943540',
  'Meal Delivery U': '#2C7A5F',
  'Delivery D': '#A84020',
};

export default function EarningsScreen() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const totalEarnings = period === 'week' ? 8450 : 32450;
  const comparedPercent = period === 'week' ? 12 : 8;

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#D5CBBF] px-4 py-3">
        <h1
          className="text-lg font-bold text-[#1B2A4A] tracking-wide"
          style={{ fontFamily: 'var(--font-playfair), serif' }}
        >
          Earnings
        </h1>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-[#F5F0EB] rounded-xl p-5 border border-[#D5CBBF] card-elegant"
        >
          <div className="flex items-center justify-between mb-4">
            <Tabs value={period} onValueChange={(v) => setPeriod(v as 'week' | 'month')}>
              <TabsList className="bg-[#F0EBE4] h-8">
                <TabsTrigger
                  value="week"
                  className="text-xs px-3 h-6 data-[state=active]:bg-[#1B2A4A] data-[state=active]:text-[#FAF7F2]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  This Week
                </TabsTrigger>
                <TabsTrigger
                  value="month"
                  className="text-xs px-3 h-6 data-[state=active]:bg-[#1B2A4A] data-[state=active]:text-[#FAF7F2]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  This Month
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="text-center mb-3">
            <p className="text-4xl font-bold text-[#1B2A4A]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              <AnimatedCounter target={totalEarnings} />
            </p>
            <p
              className="text-xs text-[#7A7168] mt-1 tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Total Earnings
            </p>
          </div>

          <div className="flex items-center justify-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#2C4A3E]" />
            <span
              className="text-sm font-semibold text-[#2C4A3E]"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              {comparedPercent}% from last {period === 'week' ? 'week' : 'month'}
            </span>
          </div>
        </motion.div>

        {/* Platform Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-[#D5CBBF] card-elegant"
        >
          <h3
            className="text-sm font-semibold text-[#2C2C2C] mb-4 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            <TrendingUp className="w-4 h-4 text-[#1B2A4A]" />
            Earnings by Platform
          </h3>

          <div className="space-y-3">
            {PLATFORM_EARNINGS.map((item, index) => (
              <motion.div
                key={item.platform}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white border border-[#C9A96E]/20"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.platform.split(' ').pop()}
                    </div>
                    <span
                      className="text-sm text-[#2C2C2C] font-medium"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      {item.platform}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-bold text-[#1B2A4A]"
                      style={{ fontFamily: 'var(--font-playfair), serif' }}
                    >
                      ₹{item.amount.toLocaleString()}
                    </span>
                    <span
                      className="text-[10px] text-[#7A7168]"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-[#F0EBE4] rounded-full h-2">
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
          className="bg-white rounded-xl p-4 border border-[#D5CBBF] card-elegant"
        >
          <h3
            className="text-sm font-semibold text-[#2C2C2C] mb-4 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            <Calendar className="w-4 h-4 text-[#1B2A4A]" />
            Daily Earnings
          </h3>

          <div className="grid grid-cols-7 gap-2">
            {DAILY_EARNINGS.map((day) => (
              <div key={day.day} className="flex flex-col items-center gap-1.5">
                <span
                  className="text-[10px] text-[#7A7168]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {day.day}
                </span>
                <div
                  className={`w-full aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold ${
                    day.isBest
                      ? 'bg-[#1B2A4A]/10 text-[#1B2A4A] border border-[#1B2A4A]/20'
                      : 'bg-[#F5F0EB] text-[#2C2C2C]'
                  }`}
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  {(day.amount / 100).toFixed(0)}h
                </div>
                <span
                  className={`text-[9px] ${day.isBest ? 'text-[#1B2A4A] font-semibold' : 'text-[#7A7168]'}`}
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  ₹{(day.amount / 100).toFixed(0)}h
                </span>
              </div>
            ))}
          </div>
          <p
            className="text-[10px] text-[#7A7168]/60 mt-2 text-center"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            Values shown as hundreds (₹11 = ₹1,100)
          </p>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-[#D5CBBF] overflow-hidden card-elegant"
        >
          <div className="p-4 pb-2">
            <h3
              className="text-sm font-semibold text-[#2C2C2C] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              <Banknote className="w-4 h-4 text-[#1B2A4A]" />
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
                className="flex items-center justify-between px-4 py-3 border-b border-[#F0EBE4] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-[#C9A96E]/20"
                    style={{ backgroundColor: PLATFORM_COLORS[tx.platform] || '#7A7168' }}
                  >
                    {tx.platform.split(' ').pop()}
                  </div>
                  <div>
                    <p
                      className="text-sm text-[#2C2C2C] font-medium"
                      style={{ fontFamily: 'var(--font-playfair), serif' }}
                    >
                      {tx.restaurant}
                    </p>
                    <p
                      className="text-[10px] text-[#7A7168]"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      {tx.platform} · {tx.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm font-bold text-[#2C4A3E]"
                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                  >
                    +₹{tx.amount}
                  </p>
                  <Badge
                    className={`text-[8px] px-1 py-0 ${
                      tx.status === 'completed'
                        ? 'bg-[#2C4A3E]/10 text-[#2C4A3E] border-[#2C4A3E]/15'
                        : 'bg-[#8B5E3C]/10 text-[#8B5E3C] border-[#8B5E3C]/15'
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
          className="bg-white rounded-xl p-4 border border-[#D5CBBF] card-elegant"
        >
          <h3
            className="text-sm font-semibold text-[#2C2C2C] mb-3 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            <Wallet className="w-4 h-4 text-[#1B2A4A]" />
            Payouts
          </h3>

          <div className="flex items-center justify-between mb-3">
            <div>
              <p
                className="text-xs text-[#7A7168] tracking-wider uppercase"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Current Balance
              </p>
              <p
                className="text-2xl font-bold text-[#1B2A4A]"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                ₹2,450
              </p>
            </div>
            <button
              className="px-4 py-2 bg-[#1B2A4A] rounded-lg text-sm font-semibold text-[#FAF7F2] active:scale-[0.97] transition-all duration-200 shadow-sm"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Withdraw
            </button>
          </div>

          <div className="bg-[#F5F0EB] rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#1B2A4A]/10 flex items-center justify-center text-[10px] font-bold text-[#1B2A4A]">
                B
              </div>
              <div>
                <p
                  className="text-xs text-[#2C2C2C] font-medium"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  HDFC Bank ****4523
                </p>
                <p
                  className="text-[10px] text-[#7A7168]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Savings Account
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7A7168]" />
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-[#C9A96E]/8 to-[#1B2A4A]/5 rounded-xl p-4 border border-[#C9A96E]/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-[#C9A96E]" />
            <h3
              className="text-sm font-semibold text-[#8B5E3C]"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              Tips Earned
            </h3>
          </div>
          <p
            className="text-2xl font-bold text-[#1B2A4A] mb-1"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            ₹<AnimatedCounter target={680} prefix="" />
          </p>
          <p
            className="text-xs text-[#7A7168]"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            This Week
          </p>
          <div className="flex items-center gap-1 mt-2">
            <Sparkles className="w-3 h-3 text-[#C9A96E]" />
            <p
              className="text-xs text-[#8B5E3C]"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              3 customers tipped today!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
