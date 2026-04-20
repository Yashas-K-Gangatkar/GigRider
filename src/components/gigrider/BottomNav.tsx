'use client';

import { motion } from 'framer-motion';
import {
  Home,
  DollarSign,
  Layers,
  Activity,
  User,
} from 'lucide-react';

export type ScreenType = 'home' | 'earnings' | 'platforms' | 'activity' | 'profile';

interface NavItem {
  id: ScreenType;
  label: string;
  icon: typeof Home;
  isCenter?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'earnings', label: 'Earnings', icon: DollarSign },
  { id: 'platforms', label: 'Platforms', icon: Layers, isCenter: true },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'profile', label: 'Profile', icon: User },
];

interface BottomNavProps {
  activeScreen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
}

export default function BottomNav({ activeScreen, onScreenChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-[#222222] px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-end justify-around h-16">
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <button
                  key={item.id}
                  onClick={() => onScreenChange(item.id)}
                  className="relative -mt-5"
                >
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 ${
                      isActive
                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                        : 'bg-gradient-to-br from-green-600 to-green-700'
                    }`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                    {isActive && (
                      <motion.div
                        layoutId="nav-glow"
                        className="absolute inset-0 rounded-full bg-green-500/20 animate-glow-pulse"
                      />
                    )}
                  </motion.div>
                  <span
                    className={`block text-center text-[9px] font-semibold mt-1 ${
                      isActive ? 'text-green-400' : 'text-zinc-600'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onScreenChange(item.id)}
                className="flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[48px] min-h-[48px]"
              >
                <motion.div whileTap={{ scale: 0.8 }}>
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-green-400' : 'text-zinc-600'
                    }`}
                  />
                </motion.div>
                <span
                  className={`text-[9px] font-semibold transition-colors ${
                    isActive ? 'text-green-400' : 'text-zinc-600'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
