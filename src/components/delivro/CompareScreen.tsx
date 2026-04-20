'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Star,
  Clock,
  TrendingDown,
  Check,
  Zap,
  Filter,
} from 'lucide-react';
import { useState } from 'react';

interface CompareScreenProps {
  onNavigate: (screen: string) => void;
}

const compareItems = [
  {
    id: 1,
    name: 'Butter Chicken + Naan',
    emoji: '🍛',
    category: 'Food',
    platforms: [
      { name: 'Swiggy', price: 329, time: '30 min', rating: 4.5, color: '#FC8019', freeDelivery: true },
      { name: 'Zomato', price: 299, time: '35 min', rating: 4.6, color: '#E23744', freeDelivery: false },
      { name: 'Uber Eats', price: 349, time: '40 min', rating: 4.3, color: '#06C167', freeDelivery: true },
      { name: 'DoorDash', price: 309, time: '32 min', rating: 4.4, color: '#FF3008', freeDelivery: false },
    ],
  },
  {
    id: 2,
    name: 'Weekly Groceries Bundle',
    emoji: '🛒',
    category: 'Groceries',
    platforms: [
      { name: 'Swiggy Instamart', price: 1249, time: '15 min', rating: 4.2, color: '#FC8019', freeDelivery: true },
      { name: 'Zepto', price: 1199, time: '10 min', rating: 4.5, color: '#8B5CF6', freeDelivery: true },
      { name: 'BigBasket', price: 1149, time: '120 min', rating: 4.1, color: '#84CC16', freeDelivery: false },
      { name: 'Dunzo', price: 1279, time: '20 min', rating: 3.9, color: '#06B6D4', freeDelivery: false },
    ],
  },
  {
    id: 3,
    name: 'Paracetamol 500mg (10 pack)',
    emoji: '💊',
    category: 'Medicine',
    platforms: [
      { name: 'PharmEasy', price: 35, time: '30 min', rating: 4.3, color: '#F59E0B', freeDelivery: false },
      { name: '1mg', price: 30, time: '25 min', rating: 4.5, color: '#EF4444', freeDelivery: true },
      { name: 'Netmeds', price: 32, time: '45 min', rating: 4.0, color: '#22C55E', freeDelivery: false },
    ],
  },
  {
    id: 4,
    name: 'Mixed Flower Bouquet',
    emoji: '🌸',
    category: 'Flowers',
    platforms: [
      { name: 'Ferns N Petals', price: 799, time: '120 min', rating: 4.1, color: '#EC4899', freeDelivery: true },
      { name: 'Swiggy', price: 699, time: '60 min', rating: 3.8, color: '#FC8019', freeDelivery: false },
      { name: 'Uber Eats', price: 749, time: '90 min', rating: 3.9, color: '#06C167', freeDelivery: true },
    ],
  },
];

export default function CompareScreen({ onNavigate: _onNavigate }: CompareScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', 'Food', 'Groceries', 'Medicine', 'Flowers'];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0F0F0F]/90 backdrop-blur-xl px-4 pt-4 pb-3">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-orange-500" />
          Compare & Save
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">Find the best deals across all platforms</p>
      </div>

      {/* Total Savings Banner */}
      <div className="px-4 mt-2 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-green-600/20 via-emerald-600/10 to-green-600/20 border border-green-500/20 p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-green-400/70 uppercase tracking-wider font-medium">Total Saved This Month</p>
            <p className="text-2xl font-black text-green-400">₹12,450</p>
          </div>
        </motion.div>
      </div>

      {/* Category Filter */}
      <div className="px-4 mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap border transition-colors ${
              selectedCategory === cat
                ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                : 'bg-[#1A1A1A] border-[#2A2A2A] text-zinc-400'
            }`}
          >
            {cat}
          </motion.button>
        ))}
        <button className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-[#1A1A1A] border border-[#2A2A2A] text-zinc-400">
          <Filter className="w-3 h-3" />
          More
        </button>
      </div>

      {/* Comparison Cards */}
      <div className="px-4 space-y-3">
        {compareItems
          .filter((item) => selectedCategory === 'All' || item.category === selectedCategory)
          .map((item, index) => {
            const cheapest = item.platforms.reduce((min, p) => (p.price < min.price ? p : min), item.platforms[0]);
            const mostExpensive = item.platforms.reduce((max, p) => (p.price > max.price ? p : max), item.platforms[0]);
            const savings = mostExpensive.price - cheapest.price;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden"
              >
                {/* Item Header */}
                <div className="px-4 py-3 flex items-center gap-3 border-b border-[#2A2A2A]">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm">{item.name}</h3>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
                    <Zap className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400 font-bold">Save ₹{savings}</span>
                  </div>
                </div>

                {/* Platform Comparison Table */}
                <div className="px-4 py-3 space-y-2">
                  {item.platforms.map((platform) => (
                    <div
                      key={platform.name}
                      className={`flex items-center gap-3 p-2.5 rounded-xl ${
                        platform.name === cheapest.name
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-[#242424]/50'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: platform.color }}
                      >
                        {platform.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-zinc-300 block truncate">{platform.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {platform.time}
                          </span>
                          <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                            {platform.rating}
                          </span>
                          {platform.freeDelivery && (
                            <span className="text-[10px] text-green-400 font-medium">Free Delivery</span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-base font-bold ${
                          platform.name === cheapest.name ? 'text-green-400' : 'text-zinc-300'
                        }`}
                      >
                        ₹{platform.price}
                      </span>
                      {platform.name === cheapest.name && (
                        <div className="flex items-center gap-0.5">
                          <Check className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-[10px] text-green-400 font-bold">CHEAPEST</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action */}
                <div className="px-4 pb-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white text-sm font-bold flex items-center justify-center gap-1.5"
                  >
                    Order via {cheapest.name} — ₹{cheapest.price}
                    <TrendingDown className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
