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

// Deterministic particle offsets to avoid hydration mismatch (no Math.random)
const PARTICLE_OFFSETS = [
  { x: -120, y: 180, duration: 4.5 },
  { x: 85, y: -140, duration: 5.2 },
  { x: -60, y: 320, duration: 6.0 },
  { x: 190, y: -80, duration: 4.8 },
  { x: -150, y: -220, duration: 5.5 },
  { x: 40, y: 280, duration: 6.3 },
  { x: -100, y: -160, duration: 4.2 },
  { x: 160, y: 120, duration: 5.8 },
  { x: -80, y: -300, duration: 6.5 },
  { x: 120, y: 200, duration: 4.9 },
  { x: -190, y: -60, duration: 5.1 },
  { x: 60, y: 340, duration: 6.1 },
];

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [showRider, setShowRider] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 3.4;
      });
    }, 100);

    // Show rider silhouette after brief delay
    const riderTimer = setTimeout(() => setShowRider(true), 600);

    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(riderTimer);
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
        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.6 }}
      >
        {/* Cream Background with subtle pattern */}
        <div className="absolute inset-0 bg-[#FAF7F2] linen-texture" />

        {/* Radial gradient overlay for depth */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, rgba(201, 169, 110, 0.06) 0%, transparent 60%)',
          }}
        />

        {/* Animated particle field - floating gold dots (deterministic for SSR) */}
        <div className="absolute inset-0 pointer-events-none">
          {PARTICLE_OFFSETS.map((particle, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x: particle.x,
                y: particle.y,
              }}
              animate={{
                opacity: [0, 0.15, 0.15, 0],
                y: [0, -30, -60],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: particle.duration,
                delay: 0.5 + i * 0.3,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="absolute w-1 h-1 rounded-full bg-[#C9A96E]"
              style={{
                left: `${10 + (i * 7) % 80}%`,
                top: `${20 + (i * 11) % 60}%`,
              }}
            />
          ))}
        </div>

        {/* Decorative gold corners - refined with animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -10, y: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute top-8 left-8 w-20 h-20 border-t-2 border-l-2 border-[#C9A96E]/40"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 10, y: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute top-8 right-8 w-20 h-20 border-t-2 border-r-2 border-[#C9A96E]/40"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -10, y: 10 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute bottom-8 left-8 w-20 h-20 border-b-2 border-l-2 border-[#C9A96E]/40"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 10, y: 10 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute bottom-8 right-8 w-20 h-20 border-b-2 border-r-2 border-[#C9A96E]/40"
        />

        {/* Rider silhouette animation - background element */}
        <AnimatePresence>
          {showRider && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 0.04, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute right-0 bottom-0"
            >
              <svg width="200" height="280" viewBox="0 0 200 280" fill="none">
                <motion.path
                  d="M40 240 Q50 200 60 180 Q70 160 80 150 Q90 140 85 120 Q80 100 90 80 Q100 60 110 80 Q120 100 115 120 Q110 140 120 150 Q130 160 140 180 Q150 200 160 240 Z"
                  fill="#1B2A4A"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
                <motion.circle
                  cx="100"
                  cy="60"
                  r="20"
                  fill="#1B2A4A"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                />
                <motion.path
                  d="M30 240 Q50 260 100 260 Q150 260 170 240"
                  stroke="#1B2A4A"
                  strokeWidth="4"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.8 }}
                />
                <motion.circle cx="60" cy="260" r="18" fill="none" stroke="#1B2A4A" strokeWidth="3"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1 }}
                />
                <motion.circle cx="140" cy="260" r="18" fill="none" stroke="#1B2A4A" strokeWidth="3"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.1 }}
                />
                <motion.rect x="75" y="110" width="30" height="35" rx="4" fill="#1B2A4A"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4, delay: 1.3 }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-8">
          {/* Logo with enhanced parallax effect */}
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
              className="w-28 h-28 rounded-full border-2 border-[#C9A96E] bg-white/80 flex items-center justify-center shadow-lg"
              style={{ boxShadow: '0 0 30px rgba(201, 169, 110, 0.2), 0 0 60px rgba(201, 169, 110, 0.1)' }}
            >
              <Image
                src="/gigrider-logo.png"
                alt="GigRider Logo"
                width={68}
                height={68}
                priority
              />
            </motion.div>
            {/* Outer ring pulse */}
            <motion.div
              className="absolute -inset-3 rounded-full border border-[#C9A96E]/20"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Subtle parallax glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(201, 169, 110, 0.1)',
                  '0 0 40px rgba(201, 169, 110, 0.25)',
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
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#C9A96E]" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-2 h-2 border border-[#C9A96E] rotate-45"
              />
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#C9A96E]" />
            </div>

            {/* Cycling Taglines - Enhanced with typewriter feel */}
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
            className="w-56 mt-6"
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
            <div className="flex items-center justify-between mt-3">
              <p
                className="text-[9px] text-[#7A7168] tracking-[0.15em] uppercase"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Preparing your dashboard
              </p>
              <p
                className="text-[9px] text-[#C9A96E] font-semibold tabular-nums"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                {Math.min(Math.round(progress), 100)}%
              </p>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="flex items-center gap-4 mt-2"
          >
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2C4A3E]" />
              <span className="text-[8px] text-[#7A7168] tracking-wider uppercase" style={{ fontFamily: 'var(--font-lora), serif' }}>
                8+ Platforms
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
              <span className="text-[8px] text-[#7A7168] tracking-wider uppercase" style={{ fontFamily: 'var(--font-lora), serif' }}>
                Smart Stack
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1B2A4A]" />
              <span className="text-[8px] text-[#7A7168] tracking-wider uppercase" style={{ fontFamily: 'var(--font-lora), serif' }}>
                Auto-Accept
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
