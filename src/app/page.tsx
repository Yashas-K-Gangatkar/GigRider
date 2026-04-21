'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from '@/components/gigrider/SplashScreen';
import HomeScreen from '@/components/gigrider/HomeScreen';
import EarningsScreen from '@/components/gigrider/EarningsScreen';
import PlatformsScreen from '@/components/gigrider/PlatformsScreen';
import ActivityScreen from '@/components/gigrider/ActivityScreen';
import ProfileScreen from '@/components/gigrider/ProfileScreen';
import BottomNav, { type ScreenType } from '@/components/gigrider/BottomNav';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeScreen, setActiveScreen] = useState<ScreenType>('home');

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleScreenChange = useCallback((screen: ScreenType) => {
    setActiveScreen(screen);
  }, []);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen />;
      case 'earnings':
        return <EarningsScreen />;
      case 'platforms':
        return <PlatformsScreen />;
      case 'activity':
        return <ActivityScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] relative max-w-lg mx-auto">
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      {/* Main App */}
      {!showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Screen Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
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
