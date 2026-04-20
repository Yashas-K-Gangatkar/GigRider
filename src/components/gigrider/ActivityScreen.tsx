'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  swiggy: { name: 'SWIGGY', color: '#FC8019', letter: 'S' },
  zomato: { name: 'ZOMATO', color: '#E23744', letter: 'Z' },
  ubereats: { name: 'UBER EATS', color: '#06C167', letter: 'U' },
  doordash: { name: 'DOORDASH', color: '#FF3008', letter: 'D' },
};

const DELIVERIES: DeliveryRecord[] = [
  { id: 'd1', platform: 'zomato', restaurant: 'Truffles', customer: 'St. Mark\'s Road', earnings: 55, distance: 3.2, duration: 22, status: 'in-progress', time: '2 min ago' },
  { id: 'd2', platform: 'swiggy', restaurant: 'Pizza Hut', customer: 'Koramangala', earnings: 45, distance: 2.3, duration: 18, status: 'completed', time: '35 min ago', rating: 5, tip: 10 },
  { id: 'd3', platform: 'ubereats', restaurant: 'McDonald\'s', customer: 'ITPL Area', earnings: 38, distance: 1.8, duration: 15, status: 'completed', time: '1 hr ago', rating: 4 },
  { id: 'd4', platform: 'swiggy', restaurant: 'Biryani Blues', customer: 'HSR Layout', earnings: 48, distance: 2.0, duration: 16, status: 'completed', time: '1.5 hrs ago', rating: 5, tip: 20 },
  { id: 'd5', platform: 'doordash', restaurant: 'Chennai Express', customer: 'BTM Layout', earnings: 65, distance: 4.5, duration: 28, status: 'cancelled', time: '2 hrs ago' },
  { id: 'd6', platform: 'zomato', restaurant: 'Domino\'s', customer: 'HSR Sector 2', earnings: 52, distance: 3.1, duration: 20, status: 'completed', time: '2.5 hrs ago', rating: 5, tip: 15 },
  { id: 'd7', platform: 'swiggy', restaurant: 'KFC', customer: 'Marathahalli', earnings: 42, distance: 2.8, duration: 19, status: 'completed', time: '3 hrs ago', rating: 4 },
  { id: 'd8', platform: 'ubereats', restaurant: 'Subway', customer: 'Whitefield', earnings: 35, distance: 1.5, duration: 12, status: 'completed', time: '3.5 hrs ago', rating: 5 },
  { id: 'd9', platform: 'zomato', restaurant: 'Barbeque Nation', customer: 'Indiranagar', earnings: 72, distance: 5.1, duration: 32, status: 'completed', time: '4 hrs ago', rating: 5, tip: 50 },
  { id: 'd10', platform: 'doordash', restaurant: 'Meghana Foods', customer: 'Jayanagar', earnings: 58, distance: 3.8, duration: 25, status: 'completed', time: '5 hrs ago', rating: 4 },
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
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#222222] px-4 py-3">
        <h1 className="text-lg font-bold text-white">Activity</h1>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Today Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-[#141414] rounded-xl p-3 border border-[#222222] text-center">
            <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{completedToday}</p>
            <p className="text-[9px] text-zinc-500">Completed</p>
          </div>
          <div className="bg-[#141414] rounded-xl p-3 border border-[#222222] text-center">
            <TrendingUp className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-400">₹{totalEarnings}</p>
            <p className="text-[9px] text-zinc-500">Earned</p>
          </div>
          <div className="bg-[#141414] rounded-xl p-3 border border-[#222222] text-center">
            <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-amber-400">₹{totalTips}</p>
            <p className="text-[9px] text-zinc-500">Tips</p>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#141414] rounded-lg p-1">
          {[
            { id: 'all' as const, label: 'All' },
            { id: 'completed' as const, label: 'Done' },
            { id: 'in-progress' as const, label: 'Active' },
            { id: 'cancelled' as const, label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-zinc-500 hover:text-zinc-400'
              }`}
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
              completed: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Done' },
              'in-progress': { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Active' },
              cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Cancelled' },
            };
            const status = statusConfig[delivery.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={delivery.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#141414] rounded-xl p-4 border border-[#222222]"
                style={{ borderLeftWidth: '3px', borderLeftColor: config.color }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: config.color }}
                    >
                      {config.letter}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{delivery.restaurant}</p>
                      <p className="text-[10px] text-zinc-500">{delivery.time}</p>
                    </div>
                  </div>
                  <Badge className={`${status.bg} ${status.color} border-0 text-[9px]`}>
                    <StatusIcon className="w-2.5 h-2.5 mr-0.5" />
                    {status.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3 text-green-400" />
                    <span className="text-[10px] text-zinc-400">{delivery.restaurant}</span>
                  </div>
                  <div className="w-4 h-px bg-zinc-700" />
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] text-zinc-400">{delivery.customer}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-green-400">₹{delivery.earnings}</span>
                    <span className="text-[10px] text-zinc-500">{delivery.distance} km</span>
                    <span className="text-[10px] text-zinc-500">{delivery.duration} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {delivery.tip && (
                      <span className="text-[10px] text-amber-400 font-semibold">+₹{delivery.tip} tip</span>
                    )}
                    {delivery.rating && (
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] text-amber-400">{delivery.rating}</span>
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
            <ArrowUpDown className="w-8 h-8 text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm">No deliveries found</p>
            <p className="text-zinc-600 text-xs mt-1">Try a different filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
