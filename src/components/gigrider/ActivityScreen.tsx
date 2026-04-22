'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useGigRiderStore, PLATFORMS } from '@/lib/store';
import {
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  Package,
  Star,
  TrendingUp,
  Search,
  Download,
  ChevronRight,
  Calendar,
  Timer,
  ArrowUpDown,
  Filter,
  X,
  Bike,
  Route,
  RefreshCw,
  Sparkles,
  Eye,
} from 'lucide-react';

function formatTimestamp(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const oneDay = 86400000;
  if (diff < oneDay) return 'Today';
  if (diff < 2 * oneDay) return 'Yesterday';
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
}

type SortMode = 'newest' | 'oldest' | 'highest' | 'longest';

// Animated counter hook
function useAnimatedNumber(target: number, duration = 800) {
  const [current, setCurrent] = useState(0);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (prevTarget.current === target) return;
    prevTarget.current = target;
    const start = current;
    const diff = target - start;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, current]);

  return current;
}

export default function ActivityScreen() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const deliveryHistory = useGigRiderStore(s => s.deliveryHistory);

  // Live clock for session timer display - initialize on client only to avoid hydration mismatch
  useEffect(() => {
    setCurrentTime(Date.now());
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredDeliveries = deliveryHistory.filter((d) => {
    if (filter !== 'all' && d.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const config = PLATFORMS[d.platform];
      return (
        d.restaurant.toLowerCase().includes(q) ||
        d.customer.toLowerCase().includes(q) ||
        (config?.displayName || '').toLowerCase().includes(q) ||
        d.platform.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort deliveries
  const sortedDeliveries = useMemo(() => {
    const sorted = [...filteredDeliveries];
    switch (sortMode) {
      case 'newest': sorted.sort((a, b) => b.timestamp - a.timestamp); break;
      case 'oldest': sorted.sort((a, b) => a.timestamp - b.timestamp); break;
      case 'highest': sorted.sort((a, b) => b.earnings - a.earnings); break;
      case 'longest': sorted.sort((a, b) => b.duration - a.duration); break;
    }
    return sorted;
  }, [filteredDeliveries, sortMode]);

  // Group by date
  const groupedDeliveries = useMemo(() => {
    const groups: Record<string, typeof sortedDeliveries> = {};
    sortedDeliveries.forEach(d => {
      const group = formatTimestamp(d.timestamp);
      if (!groups[group]) groups[group] = [];
      groups[group].push(d);
    });
    return groups;
  }, [sortedDeliveries]);

  // Smart date ordering
  const groupOrder = useMemo(() => {
    const keys = Object.keys(groupedDeliveries);
    const priority = ['Today', 'Yesterday'];
    const priorityKeys = priority.filter(k => keys.includes(k));
    const otherKeys = keys.filter(k => !priority.includes(k));
    return [...priorityKeys, ...otherKeys];
  }, [groupedDeliveries]);

  const completedToday = deliveryHistory.filter((d) => d.status === 'completed' && Date.now() - d.timestamp < 86400000).length;
  const totalEarnings = deliveryHistory.filter((d) => d.status === 'completed').reduce((sum, d) => sum + d.earnings, 0);
  const totalTips = deliveryHistory.filter((d) => d.status === 'completed' && d.tip).reduce((sum, d) => sum + (d.tip || 0), 0);
  const avgDeliveryTime = deliveryHistory.filter(d => d.status === 'completed' && d.duration > 0).length > 0
    ? Math.round(deliveryHistory.filter(d => d.status === 'completed' && d.duration > 0).reduce((sum, d) => sum + d.duration, 0) / deliveryHistory.filter(d => d.status === 'completed' && d.duration > 0).length)
    : 0;
  const avgEarnings = completedToday > 0 ? Math.round(totalEarnings / deliveryHistory.filter(d => d.status === 'completed').length) : 0;

  // Animated values
  const animatedEarnings = useAnimatedNumber(totalEarnings);
  const animatedTips = useAnimatedNumber(totalTips);
  const animatedCompleted = useAnimatedNumber(completedToday);

  // Per-platform breakdown for today
  const platformBreakdown = useMemo(() => {
    const today = deliveryHistory.filter(d => d.status === 'completed' && Date.now() - d.timestamp < 86400000);
    const breakdown: Record<string, { earnings: number; count: number; color: string; letter: string }> = {};
    today.forEach(d => {
      const config = PLATFORMS[d.platform];
      if (!breakdown[d.platform]) {
        breakdown[d.platform] = { earnings: 0, count: 0, color: config?.color || '#7A7168', letter: config?.letter || d.platform[0].toUpperCase() };
      }
      breakdown[d.platform].earnings += d.earnings + (d.tip || 0);
      breakdown[d.platform].count += 1;
    });
    return Object.entries(breakdown).sort(([, a], [, b]) => b.earnings - a.earnings);
  }, [deliveryHistory]);

  const sortLabels: Record<SortMode, string> = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    highest: 'Highest Pay',
    longest: 'Longest Trip',
  };

  // Swipe handler
  const handleSwipe = (deliveryId: string, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 80) {
      setSwipedId(deliveryId);
      setTimeout(() => setSwipedId(null), 1500);
    }
  };

  // Refresh handler with visual feedback
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  // Pull-to-refresh animation progress
  const [pullProgress, setPullProgress] = useState(0);
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop === 0) {
      setPullProgress(1);
    } else {
      setPullProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#D5CBBF]">
        {/* Refresh progress bar */}
        <AnimatePresence>
          {isRefreshing && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              className="h-0.5 bg-gradient-to-r from-[#1B2A4A] via-[#C9A96E] to-[#1B2A4A] origin-left"
            />
          )}
        </AnimatePresence>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1
                className="text-lg font-bold text-[#1B2A4A] tracking-wide"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                Activity
              </h1>
              <motion.button
                onClick={handleRefresh}
                whileTap={{ scale: 0.85, rotate: 180 }}
                className="p-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#7A7168] ${isRefreshing ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
            <div className="flex items-center gap-2">
              {/* Sort Button */}
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200 ${
                    sortMode !== 'newest'
                      ? 'bg-[#1B2A4A] text-[#FAF7F2]'
                      : 'bg-[#1B2A4A]/5 text-[#1B2A4A]'
                  }`}
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  {sortLabels[sortMode]}
                </motion.button>
                <AnimatePresence>
                  {showSortMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 bg-white border border-[#D5CBBF] rounded-xl shadow-lg overflow-hidden z-50 min-w-[160px]"
                    >
                      {(Object.keys(sortLabels) as SortMode[]).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => { setSortMode(mode); setShowSortMenu(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                            sortMode === mode
                              ? 'bg-[#1B2A4A]/5 text-[#1B2A4A] font-semibold'
                              : 'text-[#7A7168] hover:bg-[#F5F0EB]'
                          }`}
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          {sortLabels[mode]}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Export Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2A4A]/5 rounded-lg text-[10px] font-semibold text-[#1B2A4A]"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Today's Highlights - Enhanced with animated counters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-xs font-semibold text-[#7A7168] tracking-wider uppercase flex items-center gap-1.5"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
              Today&apos;s Highlights
            </h3>
            <span
              className="text-[10px] text-[#C9A96E] font-semibold"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              {currentTime > 0 ? new Date(currentTime).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' }) : ''}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white rounded-xl p-4 border border-[#D5CBBF] card-elegant col-span-1">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-full bg-[#2C4A3E]/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#2C4A3E]" />
                </div>
                <Badge className="bg-[#2C4A3E]/10 text-[#2C4A3E] border-0 text-[9px]">
                  <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                  +12%
                </Badge>
              </div>
              <p
                className="text-2xl font-bold text-[#1B2A4A] tabular-nums"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                {animatedCompleted}
              </p>
              <p
                className="text-[10px] text-[#7A7168] tracking-wider uppercase mt-0.5"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Completed Trips
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#D5CBBF] card-elegant">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-full bg-[#8B5E3C]/10 flex items-center justify-center">
                  <Route className="w-4 h-4 text-[#8B5E3C]" />
                </div>
                <span
                  className="text-[10px] text-[#2C4A3E] font-semibold"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  avg ₹{avgEarnings}
                </span>
              </div>
              <p
                className="text-2xl font-bold text-[#2C4A3E] tabular-nums"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                ₹{animatedEarnings.toLocaleString()}
              </p>
              <p
                className="text-[10px] text-[#7A7168] tracking-wider uppercase mt-0.5"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Total Earned
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#D5CBBF] card-elegant">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
                  <Star className="w-4 h-4 text-[#C9A96E]" />
                </div>
              </div>
              <p
                className="text-2xl font-bold text-[#8B5E3C] tabular-nums"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                ₹{animatedTips}
              </p>
              <p
                className="text-[10px] text-[#7A7168] tracking-wider uppercase mt-0.5"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Tips Earned
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#D5CBBF] card-elegant">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center">
                  <Timer className="w-4 h-4 text-[#1B2A4A]" />
                </div>
              </div>
              <p
                className="text-2xl font-bold text-[#1B2A4A] tabular-nums"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                {avgDeliveryTime}m
              </p>
              <p
                className="text-[10px] text-[#7A7168] tracking-wider uppercase mt-0.5"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Avg Delivery
              </p>
            </div>
          </div>

          {/* Platform Earnings Breakdown - Mini bar chart */}
          {platformBreakdown.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-3 bg-white rounded-xl p-3 border border-[#D5CBBF] card-elegant"
            >
              <p
                className="text-[9px] text-[#7A7168] tracking-wider uppercase mb-2.5"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Today&apos;s Platform Breakdown
              </p>
              <div className="space-y-2">
                {platformBreakdown.map(([platformId, data]) => {
                  const maxEarning = platformBreakdown[0][1].earnings || 1;
                  const pct = (data.earnings / maxEarning) * 100;
                  return (
                    <div key={platformId} className="flex items-center gap-2.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                        style={{ backgroundColor: data.color }}
                      >
                        {data.letter}
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-[#F0EBE4] rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="h-2 rounded-full"
                            style={{ backgroundColor: data.color }}
                          />
                        </div>
                      </div>
                      <span
                        className="text-[10px] text-[#1B2A4A] font-bold min-w-[48px] text-right tabular-nums"
                        style={{ fontFamily: 'var(--font-playfair), serif' }}
                      >
                        ₹{data.earnings}
                      </span>
                      <span
                        className="text-[9px] text-[#7A7168] min-w-[20px] text-right"
                        style={{ fontFamily: 'var(--font-lora), serif' }}
                      >
                        {data.count}t
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Search - Enhanced with focus animation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7168]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurant, customer, platform..."
            className="w-full pl-10 pr-10 py-3 bg-white border border-[#D5CBBF] rounded-xl text-sm text-[#2C2C2C] placeholder:text-[#7A7168]/50 focus:outline-none focus:border-[#1B2A4A] focus:ring-2 focus:ring-[#1B2A4A]/10 transition-all duration-200"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          />
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-[#D5CBBF]"
            >
              <X className="w-3 h-3 text-[#7A7168]" />
            </motion.button>
          )}
        </motion.div>

        {/* Filter Tabs - Enhanced with count badges */}
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-[#D5CBBF]">
          {[
            { id: 'all' as const, label: 'All', count: deliveryHistory.length },
            { id: 'completed' as const, label: 'Done', count: deliveryHistory.filter(d => d.status === 'completed').length },
            { id: 'in-progress' as const, label: 'Active', count: deliveryHistory.filter(d => d.status === 'in-progress').length },
            { id: 'cancelled' as const, label: 'Cancelled', count: deliveryHistory.filter(d => d.status === 'cancelled').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 py-2 rounded-md text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1 ${
                filter === tab.id
                  ? 'bg-[#1B2A4A] text-[#FAF7F2] shadow-sm'
                  : 'text-[#7A7168] hover:text-[#2C2C2C]'
              }`}
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[9px] font-bold px-1 py-0 rounded-full ${
                  filter === tab.id
                    ? 'bg-[#FAF7F2]/20 text-[#FAF7F2]'
                    : 'bg-[#D5CBBF]/60 text-[#7A7168]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Results count */}
        {searchQuery && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-[#7A7168] tracking-wider"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            {sortedDeliveries.length} result{sortedDeliveries.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
          </motion.p>
        )}

        {/* Grouped Delivery List */}
        <div className="space-y-4">
          {groupOrder.map(groupName => {
            const deliveries = groupedDeliveries[groupName];
            if (!deliveries || deliveries.length === 0) return null;

            const groupEarnings = deliveries.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.earnings + (d.tip || 0), 0);
            const groupTips = deliveries.filter(d => d.status === 'completed' && d.tip).reduce((sum, d) => sum + (d.tip || 0), 0);

            return (
              <div key={groupName}>
                {/* Date Group Header - Enhanced with earnings summary */}
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <h3
                      className="text-xs font-semibold text-[#1B2A4A] tracking-wide"
                      style={{ fontFamily: 'var(--font-playfair), serif' }}
                    >
                      {groupName}
                    </h3>
                  </div>
                  <span
                    className="text-[10px] text-[#7A7168] tracking-wider"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    {deliveries.length} trip{deliveries.length !== 1 ? 's' : ''}
                    {groupEarnings > 0 && (
                      <>
                        <span className="mx-1 text-[#D5CBBF]">·</span>
                        <span className="text-[#2C4A3E] font-semibold">₹{groupEarnings}</span>
                        {groupTips > 0 && <span className="text-[#8B5E3C]"> +₹{groupTips} tips</span>}
                      </>
                    )}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#D5CBBF] to-transparent" />
                </div>

                {/* Delivery Cards */}
                <div className="space-y-2.5">
                  {deliveries.map((delivery, index) => {
                    const config = PLATFORMS[delivery.platform];
                    const statusConfig = {
                      completed: { icon: CheckCircle2, color: 'text-[#2C4A3E]', bg: 'bg-[#2C4A3E]/10', label: 'Done', cardBorder: 'border-l-[#2C4A3E]' },
                      'in-progress': { icon: Clock, color: 'text-[#8B5E3C]', bg: 'bg-[#8B5E3C]/10', label: 'Active', cardBorder: 'border-l-[#8B5E3C]' },
                      cancelled: { icon: XCircle, color: 'text-[#722F37]', bg: 'bg-[#722F37]/10', label: 'Cancelled', cardBorder: 'border-l-[#722F37]' },
                    };
                    const status = statusConfig[delivery.status];
                    const StatusIcon = status.icon;
                    const isExpanded = expandedId === delivery.id;
                    const isHighlighted = delivery.tip && delivery.tip >= 20;
                    const isHighEarning = delivery.earnings >= 60;
                    const isBestDelivery = delivery.earnings >= 80 || (delivery.tip && delivery.tip >= 25);

                    return (
                      <motion.div
                        key={delivery.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        drag="x"
                        dragConstraints={{ left: -60, right: 60 }}
                        dragElastic={0.1}
                        onDragEnd={(_, info) => handleSwipe(delivery.id, info)}
                        className="relative"
                      >
                        {/* Swipe background */}
                        <div className="absolute inset-0 rounded-xl bg-[#1B2A4A] flex items-center justify-between px-4 overflow-hidden">
                          <span className="text-[10px] text-[#FAF7F2]/60 font-medium" style={{ fontFamily: 'var(--font-lora), serif' }}>
                            Repeat
                          </span>
                          <span className="text-[10px] text-[#FAF7F2]/60 font-medium" style={{ fontFamily: 'var(--font-lora), serif' }}>
                            Details
                          </span>
                        </div>

                        <div
                          className={`bg-white rounded-xl border border-[#D5CBBF] overflow-hidden card-elegant relative ${
                            isHighlighted ? 'ring-1 ring-[#C9A96E]/30' : ''
                          } ${isBestDelivery ? 'ring-1 ring-[#2C4A3E]/20' : ''} ${swipedId === delivery.id ? 'ring-1 ring-[#1B2A4A]/30' : ''}`}
                          style={{ borderLeftWidth: '3px', borderLeftColor: config?.color || '#7A7168' }}
                        >
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : delivery.id)}
                            className="w-full p-4 text-left"
                          >
                            {/* Highlight badges row */}
                            {(isHighlighted || isHighEarning || isBestDelivery) && (
                              <div className="flex items-center gap-1.5 mb-2">
                                {isBestDelivery && (
                                  <Badge className="bg-[#C9A96E]/15 text-[#8B5E3C] border-[#C9A96E]/25 text-[8px] px-1.5 py-0">
                                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                    BEST
                                  </Badge>
                                )}
                                {isHighEarning && (
                                  <Badge className="bg-[#2C4A3E]/8 text-[#2C4A3E] border-[#2C4A3E]/12 text-[8px] px-1.5 py-0">
                                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                                    HIGH EARN
                                  </Badge>
                                )}
                                {isHighlighted && (
                                  <Badge className="bg-[#C9A96E]/10 text-[#8B5E3C] border-[#C9A96E]/20 text-[8px] px-1.5 py-0">
                                    <Star className="w-2.5 h-2.5 mr-0.5 fill-[#C9A96E]" />
                                    BIG TIP
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white border border-[#C9A96E]/20"
                                  style={{ backgroundColor: config?.color || '#7A7168' }}
                                >
                                  {config?.letter || delivery.platform[0].toUpperCase()}
                                </div>
                                <div>
                                  <p
                                    className="text-sm font-bold text-[#2C2C2C]"
                                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                                  >
                                    {delivery.restaurant}
                                  </p>
                                  <p
                                    className="text-[10px] text-[#7A7168]"
                                    style={{ fontFamily: 'var(--font-lora), serif' }}
                                  >
                                    {delivery.time} · {config?.displayName || delivery.platform}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`${status.bg} ${status.color} border-0 text-[9px]`}>
                                  <StatusIcon className="w-2.5 h-2.5 mr-0.5" />
                                  {status.label}
                                </Badge>
                                <motion.div
                                  animate={{ rotate: isExpanded ? 90 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronRight className="w-4 h-4 text-[#7A7168]" />
                                </motion.div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-2.5">
                              <div className="flex items-center gap-1">
                                <Package className="w-3 h-3 text-[#2C4A3E]" />
                                <span className="text-[10px] text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                                  {delivery.restaurant}
                                </span>
                              </div>
                              <div className="w-4 h-px bg-[#D5CBBF]" />
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#C9A96E]" />
                                <span className="text-[10px] text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                                  {delivery.customer}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span
                                  className="text-lg font-bold text-[#1B2A4A]"
                                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                                >
                                  ₹{delivery.earnings}
                                </span>
                                <span className="text-[10px] text-[#7A7168] bg-[#F5F0EB] px-1.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-lora), serif' }}>
                                  {delivery.distance} km
                                </span>
                                <span className="text-[10px] text-[#7A7168] bg-[#F5F0EB] px-1.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-lora), serif' }}>
                                  {delivery.duration} min
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {delivery.tip && (
                                  <span
                                    className="text-[10px] text-[#8B5E3C] font-semibold bg-[#C9A96E]/10 px-1.5 py-0.5 rounded"
                                    style={{ fontFamily: 'var(--font-lora), serif' }}
                                  >
                                    +₹{delivery.tip} tip
                                  </span>
                                )}
                                {delivery.rating && (
                                  <div className="flex items-center gap-0.5">
                                    <Star className="w-3 h-3 text-[#C9A96E] fill-[#C9A96E]" />
                                    <span className="text-[10px] text-[#C9A96E]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                                      {delivery.rating}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>

                          {/* Expanded Details */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 border-t border-[#F0EBE4] pt-3 space-y-2.5">
                                  <div className="flex items-center gap-2 text-xs">
                                    <Package className="w-3.5 h-3.5 text-[#2C4A3E]" />
                                    <span className="text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>Pickup:</span>
                                    <span className="text-[#2C2C2C] font-medium" style={{ fontFamily: 'var(--font-lora), serif' }}>{delivery.restaurant}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <MapPin className="w-3.5 h-3.5 text-[#C9A96E]" />
                                    <span className="text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>Drop-off:</span>
                                    <span className="text-[#2C2C2C] font-medium" style={{ fontFamily: 'var(--font-lora), serif' }}>{delivery.customer}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <Clock className="w-3.5 h-3.5 text-[#7A7168]" />
                                    <span className="text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>Duration:</span>
                                    <span className="text-[#2C2C2C] font-medium" style={{ fontFamily: 'var(--font-lora), serif' }}>{delivery.duration} min</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <Bike className="w-3.5 h-3.5 text-[#1B2A4A]" />
                                    <span className="text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>Platform:</span>
                                    <span className="text-[#2C2C2C] font-medium" style={{ fontFamily: 'var(--font-lora), serif' }}>{config?.displayName || delivery.platform}</span>
                                  </div>
                                  {delivery.tip && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <Star className="w-3.5 h-3.5 text-[#C9A96E]" />
                                      <span className="text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>Tip:</span>
                                      <span className="text-[#8B5E3C] font-bold" style={{ fontFamily: 'var(--font-lora), serif' }}>₹{delivery.tip}</span>
                                    </div>
                                  )}

                                  {/* Earnings breakdown bar */}
                                  <div className="mt-2 pt-2 border-t border-[#F0EBE4]">
                                    <p className="text-[9px] text-[#7A7168] tracking-wider uppercase mb-2" style={{ fontFamily: 'var(--font-lora), serif' }}>
                                      Earnings Breakdown
                                    </p>
                                    <div className="flex items-center gap-1">
                                      <div
                                        className="h-2 rounded-full bg-[#1B2A4A]"
                                        style={{ width: `${(delivery.earnings / (delivery.earnings + (delivery.tip || 0))) * 100}%` }}
                                      />
                                      {delivery.tip && (
                                        <div
                                          className="h-2 rounded-full bg-[#C9A96E]"
                                          style={{ width: `${(delivery.tip / (delivery.earnings + delivery.tip)) * 100}%` }}
                                        />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="text-[9px] text-[#1B2A4A] flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-[#1B2A4A]" />
                                        Base ₹{delivery.earnings}
                                      </span>
                                      {delivery.tip && (
                                        <span className="text-[9px] text-[#8B5E3C] flex items-center gap-1">
                                          <span className="w-2 h-2 rounded-full bg-[#C9A96E]" />
                                          Tip ₹{delivery.tip}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {filteredDeliveries.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-[#F0EBE4] flex items-center justify-center mb-4 border border-[#D5CBBF]">
              <Package className="w-10 h-10 text-[#D5CBBF]" />
            </div>
            <p
              className="text-[#7A7168] text-sm font-medium"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              No deliveries found
            </p>
            <p
              className="text-[#7A7168]/60 text-xs mt-1"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              {deliveryHistory.length === 0 ? 'Complete deliveries to see activity here' : searchQuery ? 'Try a different search term' : 'Try a different filter'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Click-away for sort menu */}
      {showSortMenu && (
        <div className="fixed inset-0 z-30" onClick={() => setShowSortMenu(false)} />
      )}
    </div>
  );
}
