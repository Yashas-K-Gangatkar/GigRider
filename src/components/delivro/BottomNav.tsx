'use client';

import { motion } from 'framer-motion';
import {
  Home,
  Search,
  Trophy,
  ArrowLeftRight,
  User,
} from 'lucide-react';

export type ScreenType = 'home' | 'search' | 'rewards' | 'compare' | 'profile';

interface BottomNavProps {
  activeScreen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
}

const navItems: { id: ScreenType; icon: typeof Home; label: string; isCenter?: boolean }[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'rewards', icon: Trophy, label: 'Rewards', isCenter: true },
  { id: 'compare', icon: ArrowLeftRight, label: 'Compare' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export default function BottomNav({ activeScreen, onScreenChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Top gradient fade */}
      <div className="h-6 bg-gradient-to-t from-[#0F0F0F] to-transparent pointer-events-none" />

      <div className="bg-[#0F0F0F]/95 backdrop-blur-xl border-t border-[#2A2A2A]">
        <nav className="flex items-end justify-around max-w-lg mx-auto px-2 pb-[env(safe-area-inset-bottom,8px)] pt-2">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                onClick={() => onScreenChange(item.id)}
                whileTap={{ scale: 0.85 }}
                className={`flex flex-col items-center gap-0.5 relative px-3 py-1 ${
                  item.isCenter ? '-mt-5' : ''
                }`}
              >
                {item.isCenter ? (
                  /* Center Rewards Button */
                  <motion.div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                      isActive
                        ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/30'
                        : 'bg-gradient-to-br from-orange-600/80 to-amber-600/80'
                    }`}
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    {isActive && (
                      <motion.div
                        layoutId="activeGlow"
                        className="absolute inset-0 rounded-2xl bg-orange-500/20 blur-md"
                      />
                    )}
                  </motion.div>
                ) : (
                  /* Regular Nav Items */
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-orange-500/10 rounded-xl"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <Icon
                      className={`w-5 h-5 transition-colors duration-200 ${
                        isActive ? 'text-orange-500' : 'text-zinc-500'
                      }`}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      fill={isActive ? 'currentColor' : 'none'}
                    />
                  </div>
                )}
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    item.isCenter ? 'mt-0.5' : ''
                  } ${isActive ? 'text-orange-500' : 'text-zinc-500'}`}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
