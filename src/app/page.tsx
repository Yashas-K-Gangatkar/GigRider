'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from '@/components/gigrider/SplashScreen';
import LoginScreen from '@/components/gigrider/LoginScreen';
import SignupScreen from '@/components/gigrider/SignupScreen';
import OTPScreen from '@/components/gigrider/OTPScreen';
import HomeScreen from '@/components/gigrider/HomeScreen';
import EarningsScreen from '@/components/gigrider/EarningsScreen';
import PlatformsScreen from '@/components/gigrider/PlatformsScreen';
import ActivityScreen from '@/components/gigrider/ActivityScreen';
import ProfileScreen from '@/components/gigrider/ProfileScreen';
import BottomNav, { type ScreenType } from '@/components/gigrider/BottomNav';
import { useGigRiderStore, type RiderProfile } from '@/lib/store';
import { useOrderSimulation, useOnlineTimer } from '@/hooks/use-order-simulation';

type AuthState = 'splash' | 'login' | 'signup' | 'otp';

export default function Home() {
  const [authState, setAuthState] = useState<AuthState>('splash');
  const [activeScreen, setActiveScreen] = useState<ScreenType>('home');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpName, setOtpName] = useState('');
  const [otpVehicle, setOtpVehicle] = useState<RiderProfile['vehicleType']>('scooter');

  const isAuthenticated = useGigRiderStore(s => s.isAuthenticated);
  const login = useGigRiderStore(s => s.login);
  const logout = useGigRiderStore(s => s.logout);

  // Hooks for order simulation and online timer
  useOrderSimulation();
  useOnlineTimer();

  const handleSplashComplete = useCallback(() => {
    setAuthState('login');
  }, []);

  const handleLoginRequest = useCallback((phone: string) => {
    setOtpPhone(phone);
    setOtpName('');
    setOtpVehicle('scooter');
    setAuthState('otp');
  }, []);

  const handleSignupRequest = useCallback((data: { name: string; phone: string; vehicleType?: RiderProfile['vehicleType'] }) => {
    setOtpName(data.name);
    setOtpPhone(data.phone);
    setOtpVehicle(data.vehicleType || 'scooter');
    setAuthState('otp');
  }, []);

  const handleOTPVerified = useCallback(() => {
    const name = otpName || 'Rider';
    login(name, otpPhone, otpVehicle);
  }, [otpName, otpPhone, otpVehicle, login]);

  const handleLogout = useCallback(() => {
    logout();
    setAuthState('login');
    setOtpPhone('');
    setOtpName('');
  }, [logout]);

  const handleScreenChange = useCallback((screen: ScreenType) => {
    setActiveScreen(screen);
  }, []);

  const renderAuthScreen = () => {
    switch (authState) {
      case 'login':
        return (
          <LoginScreen
            onLogin={handleLoginRequest}
            onGoToSignup={() => setAuthState('signup')}
          />
        );
      case 'signup':
        return (
          <SignupScreen
            onSignup={handleSignupRequest}
            onGoToLogin={() => setAuthState('login')}
          />
        );
      case 'otp':
        return (
          <OTPScreen
            phone={otpPhone}
            onVerified={handleOTPVerified}
            onBack={() => setAuthState('login')}
          />
        );
      default:
        return null;
    }
  };

  const renderAppScreen = () => {
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
        return <ProfileScreen onLogout={handleLogout} />;
      default:
        return <HomeScreen />;
    }
  };

  // Splash screen
  if (authState === 'splash') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] relative max-w-lg mx-auto">
        <AnimatePresence>
          <SplashScreen onComplete={handleSplashComplete} />
        </AnimatePresence>
      </div>
    );
  }

  // Auth screens (login / signup / OTP)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] relative max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={authState}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {renderAuthScreen()}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Main app (authenticated)
  return (
    <div className="min-h-screen bg-[#FAF7F2] relative max-w-lg mx-auto">
      {/* Screen Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeScreen}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {renderAppScreen()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation */}
      <BottomNav activeScreen={activeScreen} onScreenChange={handleScreenChange} />
    </div>
  );
}
