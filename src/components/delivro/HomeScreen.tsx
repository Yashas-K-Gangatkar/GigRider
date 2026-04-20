'use client';

import { motion } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  Mic,
  Flame,
  Star,
  Clock,
  Tag,
  MapPin,
} from 'lucide-react';
import { useState } from 'react';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

const categories = [
  { id: 'food', icon: '🍔', label: 'Food', gradient: 'from-orange-600 to-orange-500', bg: 'bg-orange-600' },
  { id: 'groceries', icon: '🛒', label: 'Groceries', gradient: 'from-green-600 to-green-500', bg: 'bg-green-600' },
  { id: 'medicine', icon: '💊', label: 'Medicine', gradient: 'from-red-600 to-red-500', bg: 'bg-red-600' },
  { id: 'packages', icon: '📦', label: 'Packages', gradient: 'from-teal-600 to-teal-500', bg: 'bg-teal-600' },
  { id: 'flowers', icon: '🌸', label: 'Flowers', gradient: 'from-pink-600 to-pink-500', bg: 'bg-pink-600' },
  { id: 'electronics', icon: '📱', label: 'Electronics', gradient: 'from-purple-600 to-purple-500', bg: 'bg-purple-600' },
  { id: 'coffee', icon: '☕', label: 'Coffee', gradient: 'from-amber-600 to-amber-500', bg: 'bg-amber-600' },
  { id: 'gifts', icon: '🎁', label: 'Gifts', gradient: 'from-rose-600 to-rose-500', bg: 'bg-rose-600' },
];

const hotDeals = [
  {
    id: 1,
    name: 'Pizza Palace',
    rating: 4.5,
    deliveryTime: '25-30 min',
    discount: '30% OFF',
    gradient: 'from-orange-900/80 to-red-900/60',
    platforms: [
      { name: 'Swiggy', price: '₹249' },
      { name: 'Zomato', price: '₹219' },
      { name: 'Uber Eats', price: '₹259' },
    ],
    cheapest: 'Zomato',
  },
  {
    id: 2,
    name: 'Burger Barn',
    rating: 4.3,
    deliveryTime: '20-25 min',
    discount: '25% OFF',
    gradient: 'from-amber-900/80 to-orange-900/60',
    platforms: [
      { name: 'Swiggy', price: '₹189' },
      { name: 'Zomato', price: '₹199' },
      { name: 'DoorDash', price: '₹179' },
    ],
    cheapest: 'DoorDash',
  },
  {
    id: 3,
    name: 'Sushi Express',
    rating: 4.7,
    deliveryTime: '35-40 min',
    discount: '20% OFF',
    gradient: 'from-red-900/80 to-pink-900/60',
    platforms: [
      { name: 'Zomato', price: '₹549' },
      { name: 'Swiggy', price: '₹499' },
      { name: 'Uber Eats', price: '₹529' },
    ],
    cheapest: 'Swiggy',
  },
  {
    id: 4,
    name: 'Taco Town',
    rating: 4.1,
    deliveryTime: '15-20 min',
    discount: '40% OFF',
    gradient: 'from-yellow-900/80 to-amber-900/60',
    platforms: [
      { name: 'DoorDash', price: '₹159' },
      { name: 'Swiggy', price: '₹139' },
      { name: 'Zomato', price: '₹169' },
    ],
    cheapest: 'Swiggy',
  },
];

const nearYou = [
  { id: 1, name: 'Swiggy', color: '#FC8019', letter: 'S', time: '15-20 min', rating: 4.5 },
  { id: 2, name: 'Zomato', color: '#E23744', letter: 'Z', time: '20-30 min', rating: 4.3 },
  { id: 3, name: 'Uber Eats', color: '#06C167', letter: 'U', time: '25-35 min', rating: 4.1 },
  { id: 4, name: 'DoorDash', color: '#FF3008', letter: 'D', time: '20-25 min', rating: 4.4 },
  { id: 5, name: 'Grubhub', color: '#F06617', letter: 'G', time: '30-40 min', rating: 3.9 },
];

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0F0F0F]/90 backdrop-blur-xl">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">
              Good evening, Alex! <span className="inline-block animate-fire-pulse">👋</span>
            </h1>
            <button className="flex items-center gap-1 text-sm text-zinc-400 mt-0.5 hover:text-orange-400 transition-colors">
              <MapPin className="w-3.5 h-3.5" />
              Mumbai, India
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="relative p-2 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]"
            >
              <Bell className="w-5 h-5 text-zinc-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </motion.button>
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20"
            >
              <Flame className="w-4 h-4 text-orange-500 animate-fire-pulse" />
              <span className="text-sm font-bold text-orange-400">2,450 pts</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 mt-2 mb-4">
        <motion.div
          className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
            searchFocused ? 'shadow-lg shadow-orange-500/10' : ''
          }`}
        >
          <div className="absolute inset-0 rounded-2xl p-[1.5px] bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600" />
          <div className="relative flex items-center bg-[#1A1A1A] rounded-2xl px-4 py-3">
            <svg
              className={`w-5 h-5 transition-colors ${searchFocused ? 'text-orange-500' : 'text-zinc-500'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="What do you want delivered today?"
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 ml-3 outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onClick={() => onNavigate('search')}
              readOnly
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-xl bg-orange-500/10"
            >
              <Mic className="w-4 h-4 text-orange-500" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Category Grid */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat, index) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate('search')}
              className="flex flex-col items-center gap-2 py-3 px-1"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-lg`}>
                <span className="text-2xl">{cat.icon}</span>
              </div>
              <span className="text-xs text-zinc-400 font-medium">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Hot Deals Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Hot Deals
          </h2>
          <button className="text-sm text-orange-500 font-medium">See All</button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2">
          {hotDeals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileTap={{ scale: 0.97 }}
              className="min-w-[260px] rounded-2xl overflow-hidden border border-[#2A2A2A] bg-[#1A1A1A] flex-shrink-0"
            >
              {/* Deal Image Placeholder */}
              <div className={`h-32 bg-gradient-to-br ${deal.gradient} relative flex items-center justify-center`}>
                <span className="text-5xl opacity-50">🍽️</span>
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-red-500/90 text-white text-xs font-bold">
                  {deal.discount}
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs text-white font-medium">{deal.rating}</span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-white text-sm">{deal.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                  <Clock className="w-3 h-3" />
                  {deal.deliveryTime}
                </div>
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  {deal.platforms.map((p) => (
                    <span
                      key={p.name}
                      className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        p.name === deal.cheapest
                          ? 'bg-green-500/20 text-green-400 font-bold'
                          : 'bg-[#242424] text-zinc-400'
                      }`}
                    >
                      {p.name}: {p.price}
                    </span>
                  ))}
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-bold"
                >
                  <Tag className="w-3 h-3 inline mr-1" />
                  Compare & Save
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Compare & Save Banner */}
      <div className="px-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('search')}
          className="rounded-2xl overflow-hidden border border-orange-500/20"
        >
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 animate-gradient-shift p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Compare & Save</h3>
                <p className="text-sm text-white/80 mt-1">Save up to 40% by comparing prices across platforms</p>
              </div>
              <div className="text-right">
                <motion.div
                  className="text-3xl font-black text-white"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  40%
                </motion.div>
                <span className="text-xs text-white/60">MAX SAVINGS</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Near You Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-lg font-bold text-white">Near You</h2>
          <button className="text-sm text-orange-500 font-medium">See All</button>
        </div>
        <div className="px-4 space-y-2">
          {nearYou.map((platform, index) => (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A]"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
                style={{ backgroundColor: platform.color }}
              >
                {platform.letter}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm">{platform.name}</h3>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {platform.time}
                  </span>
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {platform.rating}
                  </span>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="px-4 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold"
              >
                Open
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
