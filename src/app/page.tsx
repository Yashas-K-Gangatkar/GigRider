'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from '@/components/delivro/SplashScreen';
import HomeScreen from '@/components/delivro/HomeScreen';
import SearchScreen from '@/components/delivro/SearchScreen';
import RewardsScreen from '@/components/delivro/RewardsScreen';
import ProfileScreen from '@/components/delivro/ProfileScreen';
import CompareScreen from '@/components/delivro/CompareScreen';
import BottomNav, { type ScreenType } from '@/components/delivro/BottomNav';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeScreen, setActiveScreen] = useState<ScreenType>('home');

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleNavigate = useCallback((screen: string) => {
    setActiveScreen(screen as ScreenType);
  }, []);

  const handleScreenChange = useCallback((screen: ScreenType) => {
    setActiveScreen(screen);
  }, []);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
      case 'search':
        return <SearchScreen onNavigate={handleNavigate} />;
      case 'rewards':
        return <RewardsScreen onNavigate={handleNavigate} />;
      case 'compare':
        return <CompareScreen onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfileScreen onNavigate={handleNavigate} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] relative max-w-lg mx-auto">
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      {/* Main App */}
      {!showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Screen Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>

          {/* Bottom Navigation */}
          <BottomNav activeScreen={activeScreen} onScreenChange={handleScreenChange} />
        </motion.div>
      )}
    </div>
  );
}
