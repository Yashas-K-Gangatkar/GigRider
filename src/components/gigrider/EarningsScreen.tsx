'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGigRiderStore, PLATFORMS } from '@/lib/store';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from 'recharts';
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

export default function EarningsScreen() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const weekEarnings = useGigRiderStore(s => s.weekEarnings);
  const monthEarnings = useGigRiderStore(s => s.monthEarnings);
  const connectedPlatforms = useGigRiderStore(s => s.connectedPlatforms);
  const deliveryHistory = useGigRiderStore(s => s.deliveryHistory);
  const dailyEarnings = useGigRiderStore(s => s.dailyEarnings);
  const tipsThisWeek = useGigRiderStore(s => s.tipsThisWeek);
  const todayEarnings = useGigRiderStore(s => s.todayEarnings);

  const totalEarnings = period === 'week' ? weekEarnings : monthEarnings;
  const comparedPercent = period === 'week' ? 12 : 8;

  // Build platform earnings dynamically from connected platforms
  const totalPlatformEarnings = connectedPlatforms.reduce((sum, p) => sum + p.todayEarnings, 0) || 1;
  const platformEarnings = connectedPlatforms.map(p => {
    const config = PLATFORMS[p.id];
    return {
      platform: config?.displayName || p.id,
      amount: p.todayEarnings,
      color: config?.color || '#7A7168',
      letter: config?.letter || p.id[0].toUpperCase(),
      percentage: Math.round((p.todayEarnings / totalPlatformEarnings) * 100),
    };
  });

  // Map delivery history to transactions
  const transactions = deliveryHistory.slice(0, 8).map(d => {
    const config = PLATFORMS[d.platform];
    return {
      date: d.time,
      platform: config?.displayName || d.platform,
      restaurant: d.restaurant,
      amount: d.earnings,
      status: d.status as 'completed' | 'in-progress' | 'cancelled',
      color: config?.color || '#7A7168',
      letter: config?.letter || d.platform[0].toUpperCase(),
    };
  });

  // Calculate payout balance as a portion of today's earnings
  const payoutBalance = Math.round(todayEarnings * 0.7);

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
            {platformEarnings.map((item, index) => (
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
                      {item.letter}
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

        {/* Daily Earnings Chart */}
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

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyEarnings} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE4" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: '#7A7168', fontFamily: 'var(--font-lora)' }}
                  axisLine={{ stroke: '#D5CBBF' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#7A7168' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B2A4A',
                    border: '1px solid #C9A96E',
                    borderRadius: '8px',
                    color: '#FAF7F2',
                    fontSize: '12px',
                    fontFamily: 'var(--font-lora)',
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Earnings']}
                  cursor={{ fill: 'rgba(201, 169, 110, 0.08)' }}
                />
                <Bar
                  dataKey="amount"
                  fill="#1B2A4A"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Best Day Callout */}
          {dailyEarnings.filter(d => d.isBest).map(d => (
            <div key={d.day} className="mt-3 flex items-center gap-2 bg-[#1B2A4A]/5 rounded-lg p-2.5">
              <TrendingUp className="w-4 h-4 text-[#C9A96E]" />
              <span
                className="text-xs text-[#1B2A4A] font-medium"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Best day: <strong>{d.day}</strong> — ₹{d.amount.toLocaleString()} ({d.orders} orders)
              </span>
            </div>
          ))}
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
            {transactions.length > 0 ? transactions.map((tx, index) => (
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
                    style={{ backgroundColor: tx.color }}
                  >
                    {tx.letter}
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
            )) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                  No transactions yet
                </p>
              </div>
            )}
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
                ₹{payoutBalance.toLocaleString()}
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
            ₹<AnimatedCounter target={tipsThisWeek} prefix="" />
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
