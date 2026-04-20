'use client';

import { motion } from 'framer-motion';
import {
  Search,
  Mic,
  SlidersHorizontal,
  Star,
  Clock,
  ArrowRight,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useState } from 'react';

interface SearchScreenProps {
  onNavigate: (screen: string) => void;
}

const filterChips = ['Fastest', 'Cheapest', 'Highest Rated', 'Free Delivery'];

const searchResults = [
  {
    id: 1,
    name: 'Margherita Pizza',
    emoji: '🍕',
    platforms: [
      { name: 'Swiggy', price: 249, time: '25 min', color: '#FC8019' },
      { name: 'Zomato', price: 219, time: '30 min', color: '#E23744' },
      { name: 'Uber Eats', price: 259, time: '35 min', color: '#06C167' },
    ],
    cheapestIndex: 1,
    rating: 4.5,
    gradient: 'from-orange-900/50 to-red-900/30',
  },
  {
    id: 2,
    name: 'Chicken Biryani',
    emoji: '🍛',
    platforms: [
      { name: 'Zomato', price: 299, time: '35 min', color: '#E23744' },
      { name: 'Swiggy', price: 279, time: '30 min', color: '#FC8019' },
      { name: 'DoorDash', price: 289, time: '40 min', color: '#FF3008' },
    ],
    cheapestIndex: 1,
    rating: 4.7,
    gradient: 'from-amber-900/50 to-orange-900/30',
  },
  {
    id: 3,
    name: 'Veg Burger Meal',
    emoji: '🍔',
    platforms: [
      { name: 'Swiggy', price: 189, time: '20 min', color: '#FC8019' },
      { name: 'Zomato', price: 199, time: '25 min', color: '#E23744' },
      { name: 'Uber Eats', price: 179, time: '22 min', color: '#06C167' },
    ],
    cheapestIndex: 2,
    rating: 4.2,
    gradient: 'from-yellow-900/50 to-amber-900/30',
  },
  {
    id: 4,
    name: 'Sushi Platter',
    emoji: '🍣',
    platforms: [
      { name: 'Zomato', price: 549, time: '40 min', color: '#E23744' },
      { name: 'Swiggy', price: 499, time: '35 min', color: '#FC8019' },
      { name: 'DoorDash', price: 529, time: '45 min', color: '#FF3008' },
    ],
    cheapestIndex: 1,
    rating: 4.8,
    gradient: 'from-red-900/50 to-pink-900/30',
  },
  {
    id: 5,
    name: 'Chocolate Shake',
    emoji: '🥤',
    platforms: [
      { name: 'Swiggy', price: 149, time: '15 min', color: '#FC8019' },
      { name: 'Zomato', price: 159, time: '20 min', color: '#E23744' },
      { name: 'Uber Eats', price: 139, time: '18 min', color: '#06C167' },
    ],
    cheapestIndex: 2,
    rating: 4.4,
    gradient: 'from-amber-900/50 to-yellow-900/30',
  },
  {
    id: 6,
    name: 'Paneer Tikka',
    emoji: '🧀',
    platforms: [
      { name: 'Zomato', price: 229, time: '25 min', color: '#E23744' },
      { name: 'Swiggy', price: 219, time: '28 min', color: '#FC8019' },
      { name: 'DoorDash', price: 239, time: '30 min', color: '#FF3008' },
    ],
    cheapestIndex: 1,
    rating: 4.6,
    gradient: 'from-orange-900/50 to-amber-900/30',
  },
];

export default function SearchScreen({ onNavigate: _onNavigate }: SearchScreenProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>('Cheapest');
  const [searchQuery, setSearchQuery] = useState('Pizza');

  return (
    <div className="min-h-screen pb-24">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-[#0F0F0F]/90 backdrop-blur-xl px-4 pt-4 pb-3">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 rounded-2xl p-[1.5px] bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600" />
          <div className="relative flex items-center bg-[#1A1A1A] rounded-2xl px-4 py-3">
            <Search className="w-5 h-5 text-orange-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for food, groceries..."
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 ml-3 outline-none"
            />
            <button className="p-1.5 rounded-xl bg-orange-500/10">
              <Mic className="w-4 h-4 text-orange-500" />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {filterChips.map((chip) => (
            <motion.button
              key={chip}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(activeFilter === chip ? null : chip)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-colors ${
                activeFilter === chip
                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                  : 'bg-[#1A1A1A] border-[#2A2A2A] text-zinc-400'
              }`}
            >
              {chip}
            </motion.button>
          ))}
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#1A1A1A] border border-[#2A2A2A] text-zinc-400">
            <SlidersHorizontal className="w-3 h-3" />
            Sort
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="px-4 py-2">
        <p className="text-xs text-zinc-500">
          Showing <span className="text-orange-400 font-medium">6 results</span> for &quot;{searchQuery}&quot;
        </p>
      </div>

      {/* Result Cards */}
      <div className="px-4 space-y-3">
        {searchResults.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden"
          >
            {/* Item Header */}
            <div className={`bg-gradient-to-r ${item.gradient} px-4 py-3 flex items-center gap-3`}>
              <span className="text-3xl">{item.emoji}</span>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm">{item.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs text-zinc-300">{item.rating}</span>
                </div>
              </div>
            </div>

            {/* Platform Comparison */}
            <div className="px-4 py-3 space-y-2">
              {item.platforms.map((platform, pIndex) => (
                <div
                  key={platform.name}
                  className={`flex items-center gap-3 p-2 rounded-xl ${
                    pIndex === item.cheapestIndex
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-[#242424]/50'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: platform.color }}
                  >
                    {platform.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-zinc-400">{platform.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="w-3 h-3" />
                    {platform.time}
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      pIndex === item.cheapestIndex ? 'text-green-400' : 'text-zinc-300'
                    }`}
                  >
                    ₹{platform.price}
                  </span>
                  {pIndex === item.cheapestIndex && (
                    <div className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-green-400" />
                      <span className="text-[10px] text-green-400 font-bold">BEST</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="px-4 pb-3 flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1"
              >
                Order via {item.platforms[item.cheapestIndex].name}
                <ArrowRight className="w-3 h-3" />
              </motion.button>
              <button className="px-4 py-2.5 rounded-xl bg-[#242424] border border-[#2A2A2A] text-xs text-zinc-400 font-medium">
                Compare all
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
