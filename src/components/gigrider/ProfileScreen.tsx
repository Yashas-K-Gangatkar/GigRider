'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  Trophy,
  Zap,
  Crown,
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
  LogOut,
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
  { id: 'century', title: 'Century Club', description: '100 deliveries in a week', icon: '🏆', unlocked: true, color: '#C9A96E' },
  { id: 'speed', title: 'Speed Demon', description: 'Fastest delivery 3 times', icon: '⚡', unlocked: true, color: '#1B2A4A' },
  { id: 'night', title: 'Night Rider', description: '50 night deliveries', icon: '🌙', unlocked: true, color: '#2A3F6A' },
  { id: 'fivestar', title: '5-Star Monarch', description: 'Maintained 4.8+ for 30 days', icon: '👑', unlocked: true, color: '#C9A96E' },
  { id: 'multi', title: 'Multi-Platform Master', description: 'Active on 4+ platforms', icon: '🔥', unlocked: true, color: '#A84020' },
  { id: 'marathon', title: 'Marathon Runner', description: '5,000 total deliveries', icon: '🏃', unlocked: false, color: '#2C4A3E' },
  { id: 'diamond', title: 'Diamond Rider', description: 'Earn 10L+ lifetime', icon: '💎', unlocked: false, color: '#1B2A4A' },
  { id: 'legend', title: 'Legendary Status', description: 'Maintain 5.0 for 90 days', icon: '🌟', unlocked: false, color: '#C9A96E' },
];

const SETTINGS_ITEMS = [
  { id: 'vehicle', icon: Bike, label: 'Vehicle Type', value: 'Scooter' },
  { id: 'zones', icon: MapPin, label: 'Preferred Zones', value: '3 zones' },
  { id: 'notifications', icon: Bell, label: 'Notification Settings', value: '' },
  { id: 'bank', icon: CreditCard, label: 'Bank Account Details', value: 'HDFC ****4523' },
  { id: 'help', icon: HelpCircle, label: 'Help & Support', value: '' },
  { id: 'about', icon: Info, label: 'About GigRider', value: 'v2.1.0' },
];

interface ProfileScreenProps {
  onLogout?: () => void;
}

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const visibleAchievements = showAllAchievements
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#D5CBBF] px-4 py-3">
        <h1
          className="text-lg font-bold text-[#1B2A4A] tracking-wide"
          style={{ fontFamily: 'var(--font-playfair), serif' }}
        >
          Profile
        </h1>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Rider Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-[#F5F0EB] rounded-xl p-5 border border-[#D5CBBF] card-elegant"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center text-2xl border-2 border-[#C9A96E]/40"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              🪖
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2
                  className="text-xl font-bold text-[#2C2C2C]"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  Rajesh K.
                </h2>
                <Badge className="bg-[#C9A96E]/15 text-[#8B5E3C] border-[#C9A96E]/25 text-[9px]">
                  <Award className="w-2.5 h-2.5 mr-0.5" />
                  Pro Rider
                </Badge>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-[#C9A96E] fill-[#C9A96E]" />
                <span
                  className="text-sm font-bold text-[#C9A96E]"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  4.8
                </span>
                <span
                  className="text-xs text-[#7A7168]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Rating
                </span>
              </div>
              <p
                className="text-[10px] text-[#7A7168] mt-0.5"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Member since March 2023
              </p>
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
            { icon: Package, label: 'Total Deliveries', value: '3,247', color: 'text-[#1B2A4A]' },
            { icon: TrendingUp, label: 'Total Earnings', value: '₹4,85,000', color: 'text-[#8B5E3C]' },
            { icon: Star, label: 'Average Rating', value: '4.8', color: 'text-[#C9A96E]' },
            { icon: Zap, label: 'Completion Rate', value: '97%', color: 'text-[#2C4A3E]' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.08 }}
              className="bg-white rounded-xl p-4 border border-[#D5CBBF] card-elegant"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p
                className="text-lg font-bold text-[#1B2A4A]"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                {stat.value}
              </p>
              <p
                className="text-[10px] text-[#7A7168] tracking-wider uppercase"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Platform-wise Ratings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 border border-[#D5CBBF] card-elegant"
        >
          <h3
            className="text-sm font-semibold text-[#2C2C2C] mb-3 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            <Star className="w-4 h-4 text-[#C9A96E]" />
            Platform Ratings
          </h3>

          <div className="space-y-3">
            {[
              { name: 'Food Delivery S', rating: 4.9, color: '#B87333' },
              { name: 'Food Delivery Z', rating: 4.7, color: '#943540' },
              { name: 'Meal Delivery U', rating: 4.8, color: '#2C7A5F' },
            ].map((platform) => (
              <div key={platform.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border border-[#C9A96E]/20"
                    style={{ backgroundColor: platform.color }}
                  >
                    {platform.name.split(' ').pop()}
                  </div>
                  <span
                    className="text-sm text-[#2C2C2C] font-medium"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    {platform.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(platform.rating)
                          ? 'text-[#C9A96E] fill-[#C9A96E]'
                          : i < platform.rating
                          ? 'text-[#C9A96E] fill-[#C9A96E]/50'
                          : 'text-[#D5CBBF]'
                      }`}
                    />
                  ))}
                  <span
                    className="text-sm font-bold text-[#C9A96E] ml-1"
                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                  >
                    {platform.rating}
                  </span>
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
          className="bg-white rounded-xl p-4 border border-[#D5CBBF] card-elegant"
        >
          <h3
            className="text-sm font-semibold text-[#2C2C2C] mb-3 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            <Trophy className="w-4 h-4 text-[#C9A96E]" />
            Achievements
            <Badge className="bg-[#C9A96E]/15 text-[#8B5E3C] border-[#C9A96E]/25 text-[9px]">
              {ACHIEVEMENTS.filter((a) => a.unlocked).length}/{ACHIEVEMENTS.length}
            </Badge>
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {visibleAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.06, type: 'spring', stiffness: 200 }}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  achievement.unlocked
                    ? 'bg-[#F5F0EB] border-[#D5CBBF]'
                    : 'bg-[#FAF7F2] border-[#E8E0D4] opacity-40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{achievement.icon}</span>
                  {achievement.unlocked ? null : <Lock className="w-3 h-3 text-[#7A7168] ml-auto" />}
                </div>
                <p
                  className={`text-xs font-bold ${achievement.unlocked ? 'text-[#2C2C2C]' : 'text-[#7A7168]'}`}
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  {achievement.title}
                </p>
                <p
                  className="text-[9px] text-[#7A7168] mt-0.5"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {achievement.description}
                </p>
              </motion.div>
            ))}
          </div>

          {!showAllAchievements && ACHIEVEMENTS.length > 5 && (
            <button
              onClick={() => setShowAllAchievements(true)}
              className="w-full mt-3 py-2 text-xs text-[#1B2A4A] font-semibold hover:underline transition-colors duration-200"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              View All Achievements
            </button>
          )}
          {showAllAchievements && (
            <button
              onClick={() => setShowAllAchievements(false)}
              className="w-full mt-3 py-2 text-xs text-[#7A7168] font-semibold hover:text-[#2C2C2C] transition-colors duration-200"
              style={{ fontFamily: 'var(--font-lora), serif' }}
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
          className="bg-white rounded-xl border border-[#D5CBBF] overflow-hidden card-elegant"
        >
          <div className="p-4 pb-2">
            <h3
              className="text-sm font-semibold text-[#2C2C2C] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              <Settings className="w-4 h-4 text-[#1B2A4A]" />
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
              <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#F5F0EB] transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-[#7A7168]" />
                  <span
                    className="text-sm text-[#2C2C2C] font-medium"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span
                      className="text-xs text-[#7A7168]"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      {item.value}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-[#7A7168]" />
                </div>
              </button>
              {index < SETTINGS_ITEMS.length - 1 && <Separator className="bg-[#F0EBE4]" />}
            </motion.div>
          ))}
        </motion.div>

        {/* Logout Button */}
        {onLogout && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={onLogout}
              className="w-full py-4 rounded-xl border-2 border-[#722F37]/30 text-[#722F37] font-semibold flex items-center justify-center gap-2 hover:bg-[#722F37]/5 transition-all duration-200"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.div>
        )}

        {/* App Version */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center py-4"
        >
          <p
            className="text-[10px] text-[#7A7168]/60"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            GigRider v2.1.0
          </p>
          <p
            className="text-[9px] text-[#7A7168]/40 mt-0.5 tracking-[0.1em] uppercase"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            One App. Every Platform. More Earnings.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
