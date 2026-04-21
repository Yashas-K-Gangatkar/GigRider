'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';

function formatTimestamp(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const oneDay = 86400000;
  if (diff < oneDay) return 'Today';
  if (diff < 2 * oneDay) return 'Yesterday';
  return 'Earlier';
}

export default function ActivityScreen() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const deliveryHistory = useGigRiderStore(s => s.deliveryHistory);
  const todayEarnings = useGigRiderStore(s => s.todayEarnings);
  const todayOrders = useGigRiderStore(s => s.todayOrders);

  const filteredDeliveries = deliveryHistory.filter((d) => {
    if (filter !== 'all' && d.status !== filter) return false;
    if (searchQuery && !d.restaurant.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group by date
  const groupedDeliveries = useMemo(() => {
    const groups: Record<string, typeof filteredDeliveries> = {};
    filteredDeliveries.forEach(d => {
      const group = formatTimestamp(d.timestamp);
      if (!groups[group]) groups[group] = [];
      groups[group].push(d);
    });
    return groups;
  }, [filteredDeliveries]);

  const completedToday = deliveryHistory.filter((d) => d.status === 'completed').length;
  const totalEarnings = deliveryHistory.filter((d) => d.status === 'completed').reduce((sum, d) => sum + d.earnings, 0);
  const totalTips = deliveryHistory.filter((d) => d.status === 'completed' && d.tip).reduce((sum, d) => sum + (d.tip || 0), 0);
  const avgDeliveryTime = deliveryHistory.filter(d => d.status === 'completed' && d.duration > 0).length > 0
    ? Math.round(deliveryHistory.filter(d => d.status === 'completed' && d.duration > 0).reduce((sum, d) => sum + d.duration, 0) / deliveryHistory.filter(d => d.status === 'completed' && d.duration > 0).length)
    : 0;

  const groupOrder = ['Today', 'Yesterday', 'Earlier'];

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#D5CBBF] px-4 py-3">
        <div className="flex items-center justify-between">
          <h1
            className="text-lg font-bold text-[#1B2A4A] tracking-wide"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            Activity
          </h1>
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

      <div className="px-4 pt-4 space-y-5">
        {/* Today's Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3
            className="text-xs font-semibold text-[#7A7168] tracking-wider uppercase mb-3"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            Today&apos;s Highlights
          </h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white rounded-xl p-3 border border-[#D5CBBF] text-center card-elegant">
              <CheckCircle2 className="w-4 h-4 text-[#2C4A3E] mx-auto mb-1" />
              <p
                className="text-lg font-bold text-[#1B2A4A]"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                {completedToday}
              </p>
              <p
                className="text-[8px] text-[#7A7168] tracking-wider uppercase"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Trips
              </p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-[#D5CBBF] text-center card-elegant">
              <TrendingUp className="w-4 h-4 text-[#8B5E3C] mx-auto mb-1" />
              <p
                className="text-lg font-bold text-[#2C4A3E]"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                ₹{totalEarnings}
              </p>
              <p
                className="text-[8px] text-[#7A7168] tracking-wider uppercase"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Earned
              </p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-[#D5CBBF] text-center card-elegant">
              <Star className="w-4 h-4 text-[#C9A96E] mx-auto mb-1" />
              <p
                className="text-lg font-bold text-[#8B5E3C]"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                ₹{totalTips}
              </p>
              <p
                className="text-[8px] text-[#7A7168] tracking-wider uppercase"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Tips
              </p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-[#D5CBBF] text-center card-elegant">
              <Timer className="w-4 h-4 text-[#1B2A4A] mx-auto mb-1" />
              <p
                className="text-lg font-bold text-[#1B2A4A]"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                {avgDeliveryTime}m
              </p>
              <p
                className="text-[8px] text-[#7A7168] tracking-wider uppercase"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Avg Time
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
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
            placeholder="Search by restaurant name..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#D5CBBF] rounded-xl text-sm text-[#2C2C2C] placeholder:text-[#7A7168]/50 focus:outline-none focus:border-[#1B2A4A] focus:ring-2 focus:ring-[#1B2A4A]/10 transition-all duration-200"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          />
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-[#D5CBBF]">
          {[
            { id: 'all' as const, label: 'All' },
            { id: 'completed' as const, label: 'Done' },
            { id: 'in-progress' as const, label: 'Active' },
            { id: 'cancelled' as const, label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 py-2 rounded-md text-xs font-medium transition-all duration-300 ${
                filter === tab.id
                  ? 'bg-[#1B2A4A] text-[#FAF7F2] shadow-sm'
                  : 'text-[#7A7168] hover:text-[#2C2C2C]'
              }`}
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grouped Delivery List */}
        <div className="space-y-4">
          {groupOrder.map(groupName => {
            const deliveries = groupedDeliveries[groupName];
            if (!deliveries || deliveries.length === 0) return null;

            return (
              <div key={groupName}>
                {/* Date Group Header */}
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-[#7A7168]" />
                  <h3
                    className="text-xs font-semibold text-[#7A7168] tracking-wider uppercase"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    {groupName}
                  </h3>
                  <div className="flex-1 h-px bg-[#D5CBBF]" />
                </div>

                {/* Delivery Cards */}
                <div className="space-y-2">
                  {deliveries.map((delivery, index) => {
                    const config = PLATFORMS[delivery.platform];
                    const statusConfig = {
                      completed: { icon: CheckCircle2, color: 'text-[#2C4A3E]', bg: 'bg-[#2C4A3E]/10', label: 'Done' },
                      'in-progress': { icon: Clock, color: 'text-[#8B5E3C]', bg: 'bg-[#8B5E3C]/10', label: 'Active' },
                      cancelled: { icon: XCircle, color: 'text-[#722F37]', bg: 'bg-[#722F37]/10', label: 'Cancelled' },
                    };
                    const status = statusConfig[delivery.status];
                    const StatusIcon = status.icon;
                    const isExpanded = expandedId === delivery.id;

                    return (
                      <motion.div
                        key={delivery.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl border border-[#D5CBBF] overflow-hidden card-elegant"
                        style={{ borderLeftWidth: '3px', borderLeftColor: config?.color || '#7A7168' }}
                      >
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : delivery.id)}
                          className="w-full p-4 text-left"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-[#C9A96E]/20"
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
                                  {delivery.time}
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

                          <div className="flex items-center gap-2 mb-2">
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
                              <span className="text-[10px] text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                                {delivery.distance} km
                              </span>
                              <span className="text-[10px] text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                                {delivery.duration} min
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {delivery.tip && (
                                <span
                                  className="text-[10px] text-[#8B5E3C] font-semibold"
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
                              <div className="px-4 pb-4 pt-0 border-t border-[#F0EBE4] mt-0 pt-3 space-y-2">
                                <div className="flex items-center gap-2 text-xs">
                                  <Package className="w-3.5 h-3.5 text-[#2C4A3E]" />
                                  <span className="text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>Pickup:</span>
                                  <span className="text-[#2C2C2C] font-medium" style={{ fontFamily: 'var(--font-lora)', serif }}>{delivery.restaurant}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <MapPin className="w-3.5 h-3.5 text-[#C9A96E]" />
                                  <span className="text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>Drop-off:</span>
                                  <span className="text-[#2C2C2C] font-medium" style={{ fontFamily: 'var(--font-lora)', serif }}>{delivery.customer}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <Clock className="w-3.5 h-3.5 text-[#7A7168]" />
                                  <span className="text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>Duration:</span>
                                  <span className="text-[#2C2C2C] font-medium" style={{ fontFamily: 'var(--font-lora)', serif }}>{delivery.duration} min</span>
                                </div>
                                {delivery.tip && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <Star className="w-3.5 h-3.5 text-[#C9A96E]" />
                                    <span className="text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>Tip:</span>
                                    <span className="text-[#8B5E3C] font-bold" style={{ fontFamily: 'var(--font-lora)', serif }}>₹{delivery.tip}</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {filteredDeliveries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-8 h-8 text-[#D5CBBF] mb-3" />
            <p className="text-[#7A7168] text-sm" style={{ fontFamily: 'var(--font-lora), serif' }}>
              No deliveries found
            </p>
            <p className="text-[#7A7168]/60 text-xs mt-1" style={{ fontFamily: 'var(--font-lora), serif' }}>
              {deliveryHistory.length === 0 ? 'Complete deliveries to see activity' : searchQuery ? 'Try a different search' : 'Try a different filter'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
