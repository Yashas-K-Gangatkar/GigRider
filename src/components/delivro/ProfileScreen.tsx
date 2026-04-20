'use client';

import { motion } from 'framer-motion';
import {
  Camera,
  Bell,
  CreditCard,
  MapPin,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Flame,
  ShoppingBag,
  PiggyBank,
  Star,
  Smartphone,
} from 'lucide-react';
import { useState } from 'react';

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

const stats = [
  { label: 'Total Orders', value: '156', icon: ShoppingBag, color: 'text-orange-500' },
  { label: 'Total Saved', value: '₹12,450', icon: PiggyBank, color: 'text-green-500' },
  { label: 'Points Earned', value: '24,500', icon: Star, color: 'text-amber-500' },
  { label: 'Platforms Used', value: '8', icon: Smartphone, color: 'text-purple-500' },
];

const platforms = [
  { name: 'Swiggy', color: '#FC8019', connected: true },
  { name: 'Zomato', color: '#E23744', connected: true },
  { name: 'Uber Eats', color: '#06C167', connected: true },
  { name: 'DoorDash', color: '#FF3008', connected: false },
  { name: 'Grubhub', color: '#F06617', connected: true },
  { name: 'Instacart', color: '#43B02A', connected: false },
  { name: 'Postmates', color: '#FFD614', connected: true },
  { name: 'Deliveroo', color: '#00CCBC', connected: true },
];

const settingsItems = [
  { label: 'Notification Preferences', icon: Bell, color: 'text-orange-500' },
  { label: 'Payment Methods', icon: CreditCard, color: 'text-green-500' },
  { label: 'Delivery Addresses', icon: MapPin, color: 'text-amber-500' },
  { label: 'Privacy & Security', icon: Shield, color: 'text-teal-500' },
  { label: 'Help & Support', icon: HelpCircle, color: 'text-purple-500' },
  { label: 'About Delivro', icon: Info, color: 'text-zinc-400' },
];

export default function ProfileScreen({ onNavigate: _onNavigate }: ProfileScreenProps) {
  const [platformStates, setPlatformStates] = useState<Record<string, boolean>>(
    Object.fromEntries(platforms.map((p) => [p.name, p.connected]))
  );

  const togglePlatform = (name: string) => {
    setPlatformStates((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0F0F0F]/90 backdrop-blur-xl px-4 pt-4 pb-3">
        <h1 className="text-lg font-bold text-white">Profile</h1>
      </div>

      {/* Avatar & Info */}
      <div className="px-4 mt-2 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-4xl shadow-lg shadow-orange-500/20">
            👤
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-[#242424] border border-[#2A2A2A] flex items-center justify-center">
            <Camera className="w-4 h-4 text-zinc-400" />
          </button>
        </motion.div>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-center"
        >
          <h2 className="text-xl font-bold text-white">Alex Johnson</h2>
          <p className="text-sm text-zinc-400">@alexj</p>
          <p className="text-xs text-zinc-500 mt-0.5">Member since Jan 2024</p>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 mt-5">
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] p-3.5"
              >
                <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Connected Platforms */}
      <div className="px-4 mt-5">
        <h3 className="text-sm font-bold text-white mb-3">Connected Platforms</h3>
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden">
          {platforms.map((platform, index) => (
            <div
              key={platform.name}
              className={`flex items-center gap-3 p-3 ${
                index < platforms.length - 1 ? 'border-b border-[#2A2A2A]' : ''
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: platform.color }}
              >
                {platform.name[0]}
              </div>
              <span className="flex-1 text-sm text-white font-medium">{platform.name}</span>
              <button
                onClick={() => togglePlatform(platform.name)}
                className={`w-10 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 ${
                  platformStates[platform.name] ? 'bg-orange-500' : 'bg-[#2A2A2A]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    platformStates[platform.name] ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Points Card */}
      <div className="px-4 mt-5">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="rounded-2xl bg-gradient-to-r from-orange-600/20 via-amber-600/10 to-orange-600/20 border border-orange-500/20 p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white">Your Points</h4>
            <p className="text-xs text-zinc-400">2,450 points available</p>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500" />
        </motion.div>
      </div>

      {/* Settings List */}
      <div className="px-4 mt-5">
        <h3 className="text-sm font-bold text-white mb-3">Settings</h3>
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden">
          {settingsItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.99 }}
                className={`w-full flex items-center gap-3 p-3.5 text-left ${
                  index < settingsItems.length - 1 ? 'border-b border-[#2A2A2A]' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
                <span className="flex-1 text-sm text-white font-medium">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Sign Out */}
      <div className="px-4 mt-5 mb-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </motion.button>
      </div>
    </div>
  );
}
