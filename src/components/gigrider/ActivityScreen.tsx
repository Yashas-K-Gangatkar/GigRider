'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  ArrowUpDown,
  Package,
  Star,
  TrendingUp,
} from 'lucide-react';

interface DeliveryRecord {
  id: string;
  platform: 'swiggy' | 'zomato' | 'ubereats' | 'doordash';
  restaurant: string;
  customer: string;
  earnings: number;
  distance: number;
  duration: number;
  status: 'completed' | 'in-progress' | 'cancelled';
  time: string;
  rating?: number;
  tip?: number;
}

const PLATFORM_CONFIG = {
  swiggy: { name: 'FOOD DELIVERY S', color: '#B87333', letter: 'S' },
  zomato: { name: 'FOOD DELIVERY Z', color: '#943540', letter: 'Z' },
  ubereats: { name: 'MEAL DELIVERY U', color: '#2C7A5F', letter: 'U' },
  doordash: { name: 'DELIVERY D', color: '#A84020', letter: 'D' },
};

const DELIVERIES: DeliveryRecord[] = [
  { id: 'd1', platform: 'zomato', restaurant: 'The Truffle Club', customer: 'St. Mark\'s Road', earnings: 55, distance: 3.2, duration: 22, status: 'in-progress', time: '2 min ago' },
  { id: 'd2', platform: 'swiggy', restaurant: 'The Grand Kitchens', customer: 'Koramangala', earnings: 45, distance: 2.3, duration: 18, status: 'completed', time: '35 min ago', rating: 5, tip: 10 },
  { id: 'd3', platform: 'ubereats', restaurant: 'McKinley\'s Grill', customer: 'ITPL Area', earnings: 38, distance: 1.8, duration: 15, status: 'completed', time: '1 hr ago', rating: 4 },
  { id: 'd4', platform: 'swiggy', restaurant: 'Royal Biryani House', customer: 'HSR Layout', earnings: 48, distance: 2.0, duration: 16, status: 'completed', time: '1.5 hrs ago', rating: 5, tip: 20 },
  { id: 'd5', platform: 'doordash', restaurant: 'The Spice Heritage', customer: 'BTM Layout', earnings: 65, distance: 4.5, duration: 28, status: 'cancelled', time: '2 hrs ago' },
  { id: 'd6', platform: 'zomato', restaurant: 'Dominique\'s Pizzeria', customer: 'HSR Sector 2', earnings: 52, distance: 3.1, duration: 20, status: 'completed', time: '2.5 hrs ago', rating: 5, tip: 15 },
  { id: 'd7', platform: 'swiggy', restaurant: 'Colonel\'s Kitchen', customer: 'Marathahalli', earnings: 42, distance: 2.8, duration: 19, status: 'completed', time: '3 hrs ago', rating: 4 },
  { id: 'd8', platform: 'ubereats', restaurant: 'The Garden Table', customer: 'Whitefield', earnings: 35, distance: 1.5, duration: 12, status: 'completed', time: '3.5 hrs ago', rating: 5 },
  { id: 'd9', platform: 'zomato', restaurant: 'Barbeque Heritage', customer: 'Indiranagar', earnings: 72, distance: 5.1, duration: 32, status: 'completed', time: '4 hrs ago', rating: 5, tip: 50 },
  { id: 'd10', platform: 'doordash', restaurant: 'Meghana Estates', customer: 'Jayanagar', earnings: 58, distance: 3.8, duration: 25, status: 'completed', time: '5 hrs ago', rating: 4 },
];

export default function ActivityScreen() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress' | 'cancelled'>('all');

  const filteredDeliveries = DELIVERIES.filter((d) => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  const completedToday = DELIVERIES.filter((d) => d.status === 'completed').length;
  const totalEarnings = DELIVERIES.filter((d) => d.status === 'completed').reduce((sum, d) => sum + d.earnings, 0);
  const totalTips = DELIVERIES.filter((d) => d.status === 'completed' && d.tip).reduce((sum, d) => sum + (d.tip || 0), 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#D5CBBF] px-4 py-3">
        <h1
          className="text-lg font-bold text-[#1B2A4A] tracking-wide"
          style={{ fontFamily: 'var(--font-playfair), serif' }}
        >
          Activity
        </h1>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Today Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-white rounded-xl p-3 border border-[#D5CBBF] text-center card-elegant">
            <CheckCircle2 className="w-4 h-4 text-[#2C4A3E] mx-auto mb-1" />
            <p
              className="text-lg font-bold text-[#1B2A4A]"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              {completedToday}
            </p>
            <p
              className="text-[9px] text-[#7A7168] tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Completed
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
              className="text-[9px] text-[#7A7168] tracking-wider uppercase"
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
              className="text-[9px] text-[#7A7168] tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Tips
            </p>
          </div>
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

        {/* Delivery List */}
        <div className="space-y-2">
          {filteredDeliveries.map((delivery, index) => {
            const config = PLATFORM_CONFIG[delivery.platform];
            const statusConfig = {
              completed: { icon: CheckCircle2, color: 'text-[#2C4A3E]', bg: 'bg-[#2C4A3E]/10', label: 'Done' },
              'in-progress': { icon: Clock, color: 'text-[#8B5E3C]', bg: 'bg-[#8B5E3C]/10', label: 'Active' },
              cancelled: { icon: XCircle, color: 'text-[#722F37]', bg: 'bg-[#722F37]/10', label: 'Cancelled' },
            };
            const status = statusConfig[delivery.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={delivery.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 border border-[#D5CBBF] card-elegant"
                style={{ borderLeftWidth: '3px', borderLeftColor: config.color }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-[#C9A96E]/20"
                      style={{ backgroundColor: config.color }}
                    >
                      {config.letter}
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
                  <Badge className={`${status.bg} ${status.color} border-0 text-[9px]`}>
                    <StatusIcon className="w-2.5 h-2.5 mr-0.5" />
                    {status.label}
                  </Badge>
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
              </motion.div>
            );
          })}
        </div>

        {filteredDeliveries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ArrowUpDown className="w-8 h-8 text-[#D5CBBF] mb-3" />
            <p className="text-[#7A7168] text-sm" style={{ fontFamily: 'var(--font-lora), serif' }}>
              No deliveries found
            </p>
            <p className="text-[#7A7168]/60 text-xs mt-1" style={{ fontFamily: 'var(--font-lora), serif' }}>
              Try a different filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
