'use client';

import { motion } from 'framer-motion';
import {
  Home,
  DollarSign,
  Layers,
  Activity,
  User,
  Bell,
} from 'lucide-react';
import { useGigRiderStore } from '@/lib/store';

export type ScreenType = 'home' | 'earnings' | 'platforms' | 'activity' | 'profile' | 'notifications';

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
  const unreadNotificationCount = useGigRiderStore(s => s.unreadNotificationCount);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto">
      <div className="bg-[#FAF7F2]/95 backdrop-blur-xl border-t border-[#D5CBBF] px-2 pb-[env(safe-area-inset-bottom)]">
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
                    animate={isActive ? { y: [0, -4, 0] } : {}}
                    transition={isActive ? { duration: 0.4, ease: 'easeInOut' } : {}}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-[#1B2A4A] shadow-[#1B2A4A]/20'
                        : 'bg-[#2A3F6A] shadow-[#2A3F6A]/15'
                    }`}
                    style={{
                      boxShadow: isActive
                        ? '0 4px 20px rgba(27, 42, 74, 0.3), 0 0 0 3px rgba(201, 169, 110, 0.3)'
                        : '0 4px 12px rgba(27, 42, 74, 0.2)',
                    }}
                  >
                    <Icon className="w-6 h-6 text-[#FAF7F2]" />
                    {isActive && (
                      <motion.div
                        layoutId="nav-glow"
                        className="absolute inset-0 rounded-full animate-gold-glow"
                      />
                    )}
                  </motion.div>
                  <span
                    className={`block text-center text-[9px] mt-1 tracking-wider uppercase ${
                      isActive ? 'text-[#1B2A4A] font-semibold' : 'text-[#7A7168]'
                    }`}
                    style={{ fontFamily: 'var(--font-lora), serif' }}
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
                className="flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[48px] min-h-[48px] relative"
              >
                <motion.div
                  whileTap={{ scale: 0.75 }}
                  animate={isActive ? { y: [0, -2, 0] } : {}}
                  transition={isActive ? { duration: 0.3, ease: 'easeInOut' } : {}}
                  className="relative"
                >
                  <Icon
                    className={`w-5 h-5 transition-colors duration-300 ${
                      isActive ? 'text-[#1B2A4A]' : 'text-[#7A7168]'
                    }`}
                  />
                  {/* Notification badge on Profile icon */}
                  {item.id === 'profile' && unreadNotificationCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#722F37] text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </span>
                  )}
                </motion.div>
                <span
                  className={`text-[9px] transition-colors duration-300 tracking-wider uppercase ${
                    isActive ? 'text-[#1B2A4A] font-semibold' : 'text-[#7A7168]'
                  }`}
                  style={{ fontFamily: 'var(--font-lora), serif' }}
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
