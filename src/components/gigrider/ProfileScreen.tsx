'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  Trophy,
  Zap,
  Moon,
  Crown,
  Flame,
  Lock,
  Bike,
  MapPin,
  Bell,
  CreditCard,
  HelpCircle,
  Info,
  ChevronRight,
  Award,
  TrendingUp,
  Package,
  Settings,
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  color: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'century', title: 'Century Club', description: '100 deliveries in a week', icon: '🏆', unlocked: true, color: '#F59E0B' },
  { id: 'speed', title: 'Speed Demon', description: 'Fastest delivery 3 times', icon: '⚡', unlocked: true, color: '#3B82F6' },
  { id: 'night', title: 'Night Rider', description: '50 night deliveries', icon: '🌙', unlocked: true, color: '#8B5CF6' },
  { id: 'fivestar', title: '5-Star King', description: 'Maintained 4.8+ for 30 days', icon: '👑', unlocked: true, color: '#F59E0B' },
  { id: 'multi', title: 'Multi-Platform Master', description: 'Active on 4+ platforms', icon: '🔥', unlocked: true, color: '#EF4444' },
  { id: 'marathon', title: 'Marathon Runner', description: '5,000 total deliveries', icon: '🏃', unlocked: false, color: '#22C55E' },
  { id: 'diamond', title: 'Diamond Rider', description: 'Earn ₹10L+ lifetime', icon: '💎', unlocked: false, color: '#06B6D4' },
  { id: 'legend', title: 'Legendary Status', description: 'Maintain 5.0 for 90 days', icon: '🌟', unlocked: false, color: '#F59E0B' },
];

const SETTINGS_ITEMS = [
  { id: 'vehicle', icon: Bike, label: 'Vehicle Type', value: 'Scooter' },
  { id: 'zones', icon: MapPin, label: 'Preferred Zones', value: '3 zones' },
  { id: 'notifications', icon: Bell, label: 'Notification Settings', value: '' },
  { id: 'bank', icon: CreditCard, label: 'Bank Account Details', value: 'HDFC ****4523' },
  { id: 'help', icon: HelpCircle, label: 'Help & Support', value: '' },
  { id: 'about', icon: Info, label: 'About GigRider', value: 'v2.1.0' },
];

export default function ProfileScreen() {
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const visibleAchievements = showAllAchievements
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#222222] px-4 py-3">
        <h1 className="text-lg font-bold text-white">Profile</h1>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Rider Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#141414] to-[#1E1E1E] rounded-xl p-5 border border-[#222222]"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-3xl border-2 border-green-500/40">
              🪖
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Rajesh K.</h2>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[9px]">
                  <Award className="w-2.5 h-2.5 mr-0.5" />
                  Pro Rider
                </Badge>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold text-amber-400">4.8</span>
                <span className="text-xs text-zinc-500">Rating</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">Member since Mar 2023</p>
            </div>
          </div>
        </motion.div>

        {/* Performance Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { icon: Package, label: 'Total Deliveries', value: '3,247', color: 'text-green-400' },
            { icon: TrendingUp, label: 'Total Earnings', value: '₹4,85,000', color: 'text-amber-400' },
            { icon: Star, label: 'Average Rating', value: '4.8', color: 'text-amber-400' },
            { icon: Zap, label: 'Completion Rate', value: '97%', color: 'text-green-400' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.08 }}
              className="bg-[#141414] rounded-xl p-4 border border-[#222222]"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-zinc-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Platform-wise Ratings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#141414] rounded-xl p-4 border border-[#222222]"
        >
          <h3 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Platform Ratings
          </h3>

          <div className="space-y-3">
            {[
              { name: 'Swiggy', rating: 4.9, color: '#FC8019' },
              { name: 'Zomato', rating: 4.7, color: '#E23744' },
              { name: 'Uber Eats', rating: 4.8, color: '#06C167' },
            ].map((platform) => (
              <div key={platform.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ backgroundColor: platform.color }}
                  >
                    {platform.name[0]}
                  </div>
                  <span className="text-sm text-white font-medium">{platform.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(platform.rating)
                          ? 'text-amber-400 fill-amber-400'
                          : i < platform.rating
                          ? 'text-amber-400 fill-amber-400/50'
                          : 'text-zinc-700'
                      }`}
                    />
                  ))}
                  <span className="text-sm font-bold text-amber-400 ml-1">{platform.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#141414] rounded-xl p-4 border border-[#222222]"
        >
          <h3 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Achievements
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px]">
              {ACHIEVEMENTS.filter((a) => a.unlocked).length}/{ACHIEVEMENTS.length}
            </Badge>
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {visibleAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.06, type: 'spring', stiffness: 200 }}
                className={`p-3 rounded-lg border ${
                  achievement.unlocked
                    ? 'bg-[#1E1E1E] border-[#222222]'
                    : 'bg-[#0A0A0A] border-[#1E1E1E] opacity-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{achievement.icon}</span>
                  {achievement.unlocked ? null : <Lock className="w-3 h-3 text-zinc-600 ml-auto" />}
                </div>
                <p className={`text-xs font-bold ${achievement.unlocked ? 'text-white' : 'text-zinc-600'}`}>
                  {achievement.title}
                </p>
                <p className="text-[9px] text-zinc-500 mt-0.5">{achievement.description}</p>
              </motion.div>
            ))}
          </div>

          {!showAllAchievements && ACHIEVEMENTS.length > 5 && (
            <button
              onClick={() => setShowAllAchievements(true)}
              className="w-full mt-3 py-2 text-xs text-green-400 font-semibold hover:text-green-300 transition-colors"
            >
              View All Achievements
            </button>
          )}
          {showAllAchievements && (
            <button
              onClick={() => setShowAllAchievements(false)}
              className="w-full mt-3 py-2 text-xs text-zinc-400 font-semibold hover:text-zinc-300 transition-colors"
            >
              Show Less
            </button>
          )}
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#141414] rounded-xl border border-[#222222] overflow-hidden"
        >
          <div className="p-4 pb-2">
            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
              <Settings className="w-4 h-4 text-green-400" />
              Settings
            </h3>
          </div>

          {SETTINGS_ITEMS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
            >
              <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#1E1E1E] transition-colors">
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm text-white font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span className="text-xs text-zinc-500">{item.value}</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </div>
              </button>
              {index < SETTINGS_ITEMS.length - 1 && <Separator className="bg-[#1E1E1E]" />}
            </motion.div>
          ))}
        </motion.div>

        {/* App Version */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-4"
        >
          <p className="text-[10px] text-zinc-600">GigRider v2.1.0</p>
          <p className="text-[9px] text-zinc-700 mt-0.5">One App. Every Platform. More Earnings.</p>
        </motion.div>
      </div>
    </div>
  );
}
