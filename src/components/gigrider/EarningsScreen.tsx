'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGigRiderStore, PLATFORMS } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import {
  ComposedChart, Bar, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell,
} from 'recharts';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Gift,
  Calendar,
  Banknote,
  Sparkles,
  ChevronRight,
  Target,
  Clock,
  Crown,
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

export default function EarningsScreen({ onOpenWallet }: { onOpenWallet?: () => void }) {
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const weekEarnings = useGigRiderStore(s => s.weekEarnings);
  const monthEarnings = useGigRiderStore(s => s.monthEarnings);
  const connectedPlatforms = useGigRiderStore(s => s.connectedPlatforms);
  const deliveryHistory = useGigRiderStore(s => s.deliveryHistory);
  const dailyEarnings = useGigRiderStore(s => s.dailyEarnings);
  const tipsThisWeek = useGigRiderStore(s => s.tipsThisWeek);
  const todayEarnings = useGigRiderStore(s => s.todayEarnings);

  const { toast } = useToast();

  const totalEarnings = period === 'week' ? weekEarnings : monthEarnings;
  const lastWeekEarnings = Math.round(weekEarnings * 0.87);
  const comparedPercent = period === 'week'
    ? Math.round(((weekEarnings - lastWeekEarnings) / lastWeekEarnings) * 100)
    : 8;
  const isUp = comparedPercent > 0;

  // Earnings Goal
  const weeklyGoal = 10000;
  const goalProgress = Math.min((weekEarnings / weeklyGoal) * 100, 100);

  // Build platform earnings dynamically — weekly estimates from todayEarnings
  const totalPlatformEarningsWeekly = connectedPlatforms.reduce((sum, p) => sum + Math.round(p.todayEarnings * 6.5), 0) || 1;
  const platformEarningsWeekly = connectedPlatforms.map(p => {
    const config = PLATFORMS[p.id];
    const weeklyAmount = Math.round(p.todayEarnings * 6.5);
    return {
      platform: config?.displayName || p.id,
      amount: weeklyAmount,
      color: config?.color || '#7A7168',
      letter: config?.letter || p.id[0].toUpperCase(),
      percentage: Math.round((weeklyAmount / totalPlatformEarningsWeekly) * 100),
    };
  });

  // Best Platform (weekly)
  const bestPlatform = platformEarningsWeekly.reduce((best, curr) => curr.amount > best.amount ? curr : best, platformEarningsWeekly[0]);

  // Peak hours — mock data per requirements
  const peakHoursData = [
    { label: '12pm-1pm', earnings: 1850, highlight: true },
    { label: '7pm-9pm', earnings: 3530, highlight: true },
  ];

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
            {isUp ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-[#2C4A3E]" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-[#722F37]" />
            )}
            <span
              className={`text-sm font-semibold ${isUp ? 'text-[#2C4A3E]' : 'text-[#722F37]'}`}
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              {isUp ? '+' : ''}{comparedPercent}% from last {period === 'week' ? 'week' : 'month'}
            </span>
          </div>
        </motion.div>

        {/* This Week vs Last Week Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl p-4 border border-[#D5CBBF] card-elegant"
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-sm font-semibold text-[#2C2C2C] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              <TrendingUp className="w-4 h-4 text-[#1B2A4A]" />
              This Week vs Last Week
            </h3>
            <Badge
              className={`text-[10px] px-2 py-0.5 ${
                isUp
                  ? 'bg-[#2C4A3E]/10 text-[#2C4A3E] border-[#2C4A3E]/15'
                  : 'bg-[#722F37]/10 text-[#722F37] border-[#722F37]/15'
              }`}
            >
              {isUp ? '+' : ''}{comparedPercent}%
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[#7A7168] tracking-wider uppercase" style={{ fontFamily: 'var(--font-lora), serif' }}>
                  This Week
                </span>
                <span className="text-sm font-bold text-[#1B2A4A]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                  ₹{weekEarnings.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-[#F0EBE4] rounded-full h-3">
                <motion.div
                  className="h-3 rounded-full bg-gradient-to-r from-[#1B2A4A] to-[#2A3F6A]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(weekEarnings / Math.max(weekEarnings, lastWeekEarnings)) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[#7A7168] tracking-wider uppercase" style={{ fontFamily: 'var(--font-lora), serif' }}>
                  Last Week
                </span>
                <span className="text-sm font-bold text-[#7A7168]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                  ₹{lastWeekEarnings.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-[#F0EBE4] rounded-full h-3">
                <motion.div
                  className="h-3 rounded-full bg-[#D5CBBF]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(lastWeekEarnings / Math.max(weekEarnings, lastWeekEarnings)) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 justify-center">
            {isUp ? (
              <ArrowUpRight className="w-3 h-3 text-[#2C4A3E]" />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-[#722F37]" />
            )}
            <span className={`text-xs font-semibold ${isUp ? 'text-[#2C4A3E]' : 'text-[#722F37]'}`} style={{ fontFamily: 'var(--font-lora), serif' }}>
              ₹{Math.abs(weekEarnings - lastWeekEarnings).toLocaleString()} {isUp ? 'more' : 'less'} than last week
            </span>
          </div>
        </motion.div>

        {/* Earnings Goal Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-gradient-to-r from-[#C9A96E]/8 to-[#1B2A4A]/5 rounded-xl p-4 border border-[#C9A96E]/20"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#C9A96E]" />
              <h3 className="text-sm font-semibold text-[#8B5E3C]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                Weekly Goal
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="text-[10px] px-2 py-0.5 bg-[#C9A96E]/15 text-[#8B5E3C] border-[#C9A96E]/25">
                {Math.round(goalProgress)}%
              </Badge>
              <span className="text-xs text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                ₹{weekEarnings.toLocaleString()} / ₹{weeklyGoal.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="w-full bg-[#F0EBE4] rounded-full h-3">
            <motion.div
              className="h-3 rounded-full bg-gradient-to-r from-[#C9A96E] to-[#D4BC8E]"
              initial={{ width: 0 }}
              animate={{ width: `${goalProgress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-[#7A7168] mt-2" style={{ fontFamily: 'var(--font-lora), serif' }}>
            {goalProgress >= 100 ? '🎉 Goal achieved! Set a higher target.' : `₹${(weeklyGoal - weekEarnings).toLocaleString()} more to reach your goal`}
          </p>
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
            {platformEarningsWeekly.map((item, index) => (
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

        {/* Insights Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
          className="flex items-center gap-2 pt-1"
        >
          <Sparkles className="w-4 h-4 text-[#C9A96E]" />
          <h2
            className="text-sm font-bold text-[#1B2A4A] tracking-wide"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            Insights
          </h2>
        </motion.div>

        {/* Best Platform + Peak Hours Insight Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Best Platform */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl p-4 border border-[#D5CBBF] card-elegant"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Crown className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span className="text-[9px] text-[#7A7168] tracking-wider uppercase" style={{ fontFamily: 'var(--font-lora), serif' }}>
                Best Platform
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: bestPlatform?.color || '#7A7168' }}
              >
                {bestPlatform?.letter || '?'}
              </div>
              <span className="text-sm font-bold text-[#1B2A4A]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                {bestPlatform?.platform || '-'}
              </span>
            </div>
            <p className="text-lg font-bold text-[#2C4A3E]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              ₹{bestPlatform?.amount.toLocaleString() || 0}
            </p>
            <p className="text-[9px] text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
              this week
            </p>
          </motion.div>

          {/* Peak Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 border border-[#D5CBBF] card-elegant"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span className="text-[9px] text-[#7A7168] tracking-wider uppercase" style={{ fontFamily: 'var(--font-lora), serif' }}>
                Peak Hours
              </span>
            </div>
            <div className="space-y-1.5">
              {peakHoursData.map((ph) => (
                <div key={ph.label} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1B2A4A]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    {ph.label}
                  </span>
                  <span className="text-[10px] font-semibold text-[#8B5E3C]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                    ₹{ph.earnings.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-[#7A7168] mt-2" style={{ fontFamily: 'var(--font-lora), serif' }}>
              highest earning windows
            </p>
          </motion.div>
        </div>

        {/* Daily Earnings Chart with Gradient Area Fill */}
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
              <ComposedChart data={dailyEarnings} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1B2A4A" stopOpacity={1} />
                    <stop offset="100%" stopColor="#2A3F6A" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="bestBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A96E" stopOpacity={1} />
                    <stop offset="100%" stopColor="#A88B52" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A96E" stopOpacity={0.25} />
                    <stop offset="50%" stopColor="#C9A96E" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#C9A96E" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="amount"
                  fill="url(#areaGradient)"
                  stroke="none"
                  animationDuration={1200}
                />
                <Bar
                  dataKey="amount"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                >
                  {dailyEarnings.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isBest ? 'url(#bestBarGradient)' : 'url(#barGradient)'}
                    />
                  ))}
                </Bar>
              </ComposedChart>
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
              <p className="text-2xl font-bold text-[#1B2A4A]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                <AnimatedCounter target={payoutBalance} />
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onOpenWallet && (
                <motion.button
                  onClick={onOpenWallet}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 bg-[#C9A96E]/10 rounded-lg text-[11px] font-semibold text-[#8B5E3C] active:bg-[#C9A96E]/20 transition-colors flex items-center gap-1.5"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  View Wallet
                </motion.button>
              )}
              <button
                onClick={() => toast({ title: 'Coming soon!', description: 'Withdrawal feature is under development.' })}
                className="px-4 py-2 bg-[#1B2A4A] rounded-lg text-sm font-semibold text-[#FAF7F2] active:scale-[0.97] transition-all duration-200 shadow-sm hover:bg-[#2A3F6A]"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Withdraw
              </button>
            </div>
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
