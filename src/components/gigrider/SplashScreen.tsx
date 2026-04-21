'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const TAGLINES = [
  'One App. Every Platform.',
  'More Earnings.',
  'Less Switching.',
  'Smarter Deliveries.',
  'Better Tips.',
];

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [taglineIndex, setTaglineIndex] = useState(0);

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

  // Cycle taglines
  useEffect(() => {
    const taglineInterval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 1200);
    return () => clearInterval(taglineInterval);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.6 }}
      >
        {/* Cream Background with subtle pattern */}
        <div className="absolute inset-0 bg-[#FAF7F2] linen-texture" />

        {/* Decorative gold corners */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-[#C9A96E]/40" />
        <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-[#C9A96E]/40" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-[#C9A96E]/40" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-[#C9A96E]/40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-8">
          {/* Logo with parallax effect */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 1,
              type: 'spring',
              stiffness: 100,
              damping: 15,
            }}
            className="relative"
          >
            <motion.div
              animate={{
                y: [0, -6, 0],
                scale: [1, 1.04, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-24 h-24 rounded-full border-2 border-[#C9A96E] bg-white/80 flex items-center justify-center shadow-lg"
              style={{ boxShadow: '0 0 30px rgba(201, 169, 110, 0.2)' }}
            >
              <Image
                src="/gigrider-logo.png"
                alt="GigRider Logo"
                width={64}
                height={64}
                priority
              />
            </motion.div>
            {/* Subtle parallax glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(201, 169, 110, 0.1)',
                  '0 0 40px rgba(201, 169, 110, 0.2)',
                  '0 0 20px rgba(201, 169, 110, 0.1)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* App Name */}
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col items-center gap-3"
          >
            <h1
              className="text-4xl tracking-[0.15em] text-[#1B2A4A]"
              style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 700 }}
            >
              GIG<span className="text-[#C9A96E]">RIDER</span>
            </h1>

            {/* Ornamental divider */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#C9A96E]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#C9A96E]" />
            </div>

            {/* Cycling Taglines */}
            <div className="h-5 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={taglineIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="text-xs text-[#7A7168] text-center tracking-[0.2em] uppercase"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {TAGLINES[taglineIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Loading Bar - elegant gold gradient */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="w-52 mt-6"
          >
            <div className="h-1 bg-[#E8E0D4] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #A88B52, #C9A96E, #D4BC8E, #C9A96E, #A88B52)',
                  backgroundSize: '200% 100%',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p
              className="text-[9px] text-[#7A7168] text-center mt-3 tracking-[0.15em] uppercase"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Preparing your dashboard
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
