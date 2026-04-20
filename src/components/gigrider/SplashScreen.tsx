'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 3.4;
      });
    }, 100);

    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/rider-splash-bg.png"
            alt="GigRider Splash"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-8">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.8,
              type: 'spring',
              stiffness: 200,
              damping: 12,
            }}
            className="relative"
          >
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Image
                src="/gigrider-logo.png"
                alt="GigRider Logo"
                width={100}
                height={100}
                priority
                className="drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]"
              />
            </motion.div>
          </motion.div>

          {/* App Name */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col items-center gap-2"
          >
            <h1 className="text-4xl font-black tracking-wider text-white">
              GIG<span className="text-green-400">RIDER</span>
            </h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="text-sm text-zinc-300 text-center tracking-wide"
            >
              One App. Every Platform. More Earnings.
            </motion.p>
          </motion.div>

          {/* Loading Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.2 }}
            className="w-48 mt-8"
          >
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 text-center mt-2">
              Loading your cockpit...
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
