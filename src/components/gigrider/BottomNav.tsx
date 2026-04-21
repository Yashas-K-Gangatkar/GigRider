'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const isOnline = useGigRiderStore(s => s.isOnline);
  const deliveryHistory = useGigRiderStore(s => s.deliveryHistory);
  const [rippleId, setRippleId] = useState<string | null>(null);

  const handleNavClick = useCallback((id: ScreenType) => {
    setRippleId(id);
    onScreenChange(id);
    setTimeout(() => setRippleId(null), 400);
  }, [onScreenChange]);

  // Check if there are recent deliveries for activity badge
  const recentDeliveries = deliveryHistory.filter(
    d => d.status === 'completed' && Date.now() - d.timestamp < 3600000
  ).length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto">
      {/* Subtle top border glow */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A96E]/20 to-transparent" />

      <div className="bg-[#FAF7F2]/95 backdrop-blur-xl border-t border-[#D5CBBF]/60 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-end justify-around h-16">
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            const Icon = item.icon;
            const isRippling = rippleId === item.id;

            if (item.isCenter) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="relative -mt-5"
                >
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 relative ${
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
                    {/* Online indicator dot on center button */}
                    {isOnline && !isActive && (
                      <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#4ADE80] rounded-full border border-[#1B2A4A]" />
                    )}
                    {/* Ripple effect */}
                    {isRippling && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 rounded-full bg-[#C9A96E]/30"
                      />
                    )}
                  </motion.div>
                  <span
                    className={`block text-center text-[9px] mt-1 tracking-wider uppercase transition-colors duration-300 ${
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
                onClick={() => handleNavClick(item.id)}
                className="flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[48px] min-h-[48px] relative"
              >
                <div className="relative">
                  {/* Active background pill */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="absolute -inset-x-2.5 -inset-y-1.5 rounded-full bg-[#1B2A4A]/5"
                      />
                    )}
                  </AnimatePresence>

                  <Icon
                    className={`w-5 h-5 transition-colors duration-300 relative z-10 ${
                      isActive ? 'text-[#1B2A4A]' : 'text-[#7A7168]'
                    }`}
                  />

                  {/* Notification badge on Home icon */}
                  {item.id === 'home' && unreadNotificationCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      className="absolute -top-1.5 -right-1.5 bg-[#722F37] text-white text-[8px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 z-20"
                    >
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </motion.span>
                  )}

                  {/* Activity badge - shows recent deliveries */}
                  {item.id === 'activity' && recentDeliveries > 0 && !isActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      className="absolute -top-1 -right-1 bg-[#2C4A3E] text-white text-[7px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center z-20"
                    >
                      {recentDeliveries > 9 ? '9' : recentDeliveries}
                    </motion.span>
                  )}

                  {/* Active indicator dot - enhanced with spring animation */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-dot"
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C9A96E]"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Ripple effect */}
                  {isRippling && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0.4 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="absolute inset-0 rounded-full bg-[#1B2A4A]/10"
                    />
                  )}
                </div>
                <span
                  className={`text-[9px] transition-all duration-300 tracking-wider uppercase relative z-10 ${
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
