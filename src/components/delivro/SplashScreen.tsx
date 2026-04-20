'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3000;
    const interval = 30;
    const steps = duration / interval;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      const p = Math.min((current / steps) * 100, 100);
      setProgress(p);
      if (current >= steps) {
        clearInterval(timer);
        onComplete();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/splash-bg.png"
          alt="Splash background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* Logo & Text */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="w-24 h-24 md:w-32 md:h-32 relative">
            <Image
              src="/delivro-logo.png"
              alt="Delivro Logo"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute -inset-4 rounded-full bg-orange-500/20 blur-xl"
          />
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
          className="text-4xl md:text-5xl font-black tracking-wider text-white"
        >
          DELIVRO
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6, ease: 'easeOut' }}
          className="text-sm md:text-base text-orange-300 font-medium tracking-widest uppercase"
        >
          Every Delivery. One App.
        </motion.p>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-12 left-8 right-8 z-10">
        <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-center text-xs text-white/40 mt-3"
        >
          Loading your delivery universe...
        </motion.p>
      </div>
    </div>
  );
}
