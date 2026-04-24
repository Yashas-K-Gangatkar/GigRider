'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, ArrowRight, RotateCcw, Phone } from 'lucide-react';
import { runFraudCheck } from '@/lib/fraudPrevention';

interface OTPScreenProps {
  phone: string;
  name?: string;
  vehicleType?: string;
  onVerified: (token: string, rider: { id: string; phone: string; name: string; vehicleType: string; rating: number; tier: string }) => void;
  onBack: () => void;
}

// Deterministic confetti particle directions (avoid Math.random for SSR)
const CONFETTI_PARTICLES = [
  { x: -40, y: -50, delay: 0 },
  { x: 35, y: -55, delay: 0.05 },
  { x: -55, y: -20, delay: 0.1 },
  { x: 50, y: -25, delay: 0.08 },
  { x: -20, y: -60, delay: 0.12 },
  { x: 25, y: -65, delay: 0.03 },
];

export default function OTPScreen({ phone, name, vehicleType, onVerified, onBack }: OTPScreenProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [verifyToken, setVerifyToken] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on mount + send OTP
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500);
    // Send OTP on mount
    sendOtp();
  }, []);

  const sendOtp = async () => {
    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setVerifyToken(data.verifyToken);
        if (data.devOtp) setDevOtp(data.devOtp);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch {
      // Fallback: allow demo mode if API fails
      console.warn('OTP API unavailable, using demo mode');
      setVerifyToken('demo');
    }
    setIsSendingOtp(false);
  };

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => {
      if (c <= 1) {
        setCanResend(true);
        return 0;
      }
      return c - 1;
    }), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Ref to hold countdown timers for cleanup
  const countdownTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Cleanup countdown timers on unmount
  useEffect(() => {
    return () => {
      countdownTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleVerify = useCallback((otpValue: string) => {
    if (isVerifying || isVerified) return;
    setIsVerifying(true);
    setError('');

    const verifyWithApi = async () => {
      try {
        if (verifyToken && verifyToken !== 'demo') {
          // Real API verification
          const res = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, otp: otpValue, verifyToken, name, vehicleType }),
          });
          const data = await res.json();
          if (data.success) {
            setIsVerified(true);
            setShowConfetti(true);
            setCountdownNumber(3);
            const t1 = setTimeout(() => setCountdownNumber(2), 1000);
            const t2 = setTimeout(() => setCountdownNumber(1), 2000);
            const t3 = setTimeout(() => {
              setCountdownNumber(null);
              onVerified(data.token, data.rider);
              // Run fraud check silently in background after signup
              runFraudCheck({ riderId: data.rider.id, phone }).catch(() => {
                // Silently fail - fraud check is non-blocking
              });
            }, 3000);
            countdownTimersRef.current = [t1, t2, t3];
            return;
          } else {
            setError(data.error || 'Invalid OTP');
            setShakeError(true);
            setTimeout(() => setShakeError(false), 500);
            setIsVerifying(false);
            return;
          }
        }
      } catch {
        console.warn('OTP verification API unavailable, using demo fallback');
      }

      // Demo fallback: accept any 6-digit OTP
      setTimeout(() => {
        setIsVerified(true);
        setShowConfetti(true);
        setCountdownNumber(3);
        const t1 = setTimeout(() => setCountdownNumber(2), 1000);
        const t2 = setTimeout(() => setCountdownNumber(1), 2000);
        const t3 = setTimeout(() => {
          setCountdownNumber(null);
          onVerified('demo-token', { id: 'demo-rider', phone, name: name || `Rider ${phone.slice(-4)}`, vehicleType: vehicleType || 'bicycle', rating: 4.5, tier: 'bronze' });
          // Run fraud check silently in background after signup
          runFraudCheck({ riderId: 'demo-rider', phone }).catch(() => {});
        }, 3000);
        countdownTimersRef.current = [t1, t2, t3];
      }, 1500);
    };

    verifyWithApi();
  }, [isVerifying, isVerified, onVerified, phone, name, vehicleType, verifyToken]);

  const tryAutoVerify = useCallback((newOtp: string[]) => {
    const otpValue = newOtp.join('');
    if (otpValue.length === 6) {
      handleVerify(otpValue);
    }
  }, [handleVerify]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasteValues = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      pasteValues.forEach((val, i) => {
        if (index + i < 6) {
          newOtp[index + i] = val;
        }
      });
      setOtp(newOtp);
      // Focus last filled or next empty
      const nextIndex = Math.min(index + pasteValues.length, 5);
      inputRefs.current[nextIndex]?.focus();
      tryAutoVerify(newOtp);
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    tryAutoVerify(newOtp);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    setOtp(['', '', '', '', '', '']);
    setCountdown(30);
    setCanResend(false);
    setError('');
    inputRefs.current[0]?.focus();
    await sendOtp();
  };

  const maskedPhone = phone
    ? `+91 ${phone.slice(0, 2)}****${phone.slice(-2)}`
    : '+91 ******00';

  const filledCount = otp.filter(d => d !== '').length;

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col linen-texture relative">
      {/* Gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(201, 169, 110, 0.06) 0%, transparent 55%)',
        }}
      />

      {/* Decorative corners */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-[#C9A96E]/30" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-[#C9A96E]/30" />

      <div className="flex-1 flex flex-col justify-center px-8 max-w-md mx-auto w-full relative z-10">
        {/* Shield Icon - Animated */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
          className="text-center mb-10"
        >
          <motion.div
            animate={isVerified ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
            className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center border-2 transition-all duration-500 relative ${
              isVerified
                ? 'bg-[#2C4A3E]/10 border-[#2C4A3E]/30'
                : 'bg-[#1B2A4A]/5 border-[#1B2A4A]/20'
            }`}
          >
            {isVerified ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="relative"
              >
                <CheckCircle2 className="w-10 h-10 text-[#2C4A3E]" />

                {/* Success confetti - gold dots animate outward */}
                {showConfetti && CONFETTI_PARTICLES.map((particle, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                    animate={{
                      x: particle.x,
                      y: particle.y,
                      scale: [1, 0.3],
                      opacity: [1, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: particle.delay,
                      ease: 'easeOut',
                    }}
                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-[#C9A96E]"
                  />
                ))}
              </motion.div>
            ) : (
              <Shield className="w-10 h-10 text-[#1B2A4A]" />
            )}
          </motion.div>

          <h1
            className="text-2xl tracking-[0.05em] text-[#1B2A4A] mb-2"
            style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 700 }}
          >
            {isVerified ? 'Verified' : 'Verify OTP'}
          </h1>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-[#2C4A3E]/20 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-[#2C4A3E]" />
              </div>
              <span className="text-[9px] text-[#2C4A3E] font-semibold tracking-wider uppercase" style={{ fontFamily: 'var(--font-lora), serif' }}>
                Phone
              </span>
            </div>
            <div className="w-6 h-px bg-[#2C4A3E]/30" />
            <div className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                isVerified ? 'bg-[#2C4A3E]/20' : 'bg-[#1B2A4A]'
              }`}>
                {isVerified ? (
                  <CheckCircle2 className="w-3 h-3 text-[#2C4A3E]" />
                ) : (
                  <span className="text-[8px] font-bold text-[#FAF7F2]" style={{ fontFamily: 'var(--font-lora), serif' }}>2</span>
                )}
              </div>
              <span className={`text-[9px] font-semibold tracking-wider uppercase ${isVerified ? 'text-[#2C4A3E]' : 'text-[#1B2A4A]'}`} style={{ fontFamily: 'var(--font-lora), serif' }}>
                Verify
              </span>
            </div>
          </div>

          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#C9A96E]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#C9A96E]" />
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <Phone className="w-3 h-3 text-[#7A7168]" />
            <p
              className="text-xs text-[#7A7168]"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              {isVerified
                ? 'Identity confirmed. Welcome aboard.'
                : `Code sent to ${maskedPhone}`
              }
            </p>
          </div>
        </motion.div>

        {/* OTP Input */}
        {!isVerified && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <label
              className="block text-xs text-[#7A7168] mb-4 tracking-[0.1em] uppercase text-center"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Enter 6-Digit Code
            </label>

            <motion.div
              animate={shakeError ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex gap-2.5 justify-center mb-4"
            >
              {otp.map((digit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <input
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isVerifying}
                    className={`w-11 h-14 text-center text-lg font-bold rounded-xl border-2 transition-all duration-200 outline-none ${
                      digit
                        ? 'border-[#1B2A4A] bg-white text-[#1B2A4A] shadow-sm'
                        : 'border-[#D5CBBF] bg-white text-[#2C2C2C]'
                    } ${isVerifying ? 'opacity-50' : ''} focus:border-[#1B2A4A] focus:ring-2 focus:ring-[#1B2A4A]/10`}
                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-1 mb-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < filledCount ? 'bg-[#1B2A4A]' : 'bg-[#E8E0D4]'
                  }`}
                />
              ))}
            </div>

            {/* Verifying indicator */}
            {isVerifying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 mb-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-[#1B2A4A]/20 border-t-[#1B2A4A] rounded-full"
                />
                <span
                  className="text-xs text-[#7A7168]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Verifying...
                </span>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-[#722F37] text-center mb-4"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                {error}
              </motion.p>
            )}

            {/* Demo hint - Enhanced */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-[#C9A96E]/8 border border-[#C9A96E]/15 rounded-xl p-3 mb-6"
            >
              {devOtp ? (
                <p
                  className="text-[10px] text-[#8B5E3C] text-center"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  <span className="font-semibold">Dev Mode:</span> Your OTP is <span className="font-bold text-[#1B2A4A]">{devOtp}</span>
                </p>
              ) : (
                <p
                  className="text-[10px] text-[#8B5E3C] text-center"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  <span className="font-semibold">Demo Mode:</span> Enter any 6 digits to continue
                </p>
              )}
            </motion.div>

            {/* Resend */}
            <div className="text-center">
              {canResend ? (
                <motion.button
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleResend}
                  className="flex items-center gap-1.5 mx-auto text-xs text-[#1B2A4A] font-semibold hover:underline"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Resend Code
                </motion.button>
              ) : (
                <p
                  className="text-xs text-[#7A7168]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Resend code in{' '}
                  <span className="text-[#1B2A4A] font-semibold tabular-nums">
                    {countdown}s
                  </span>
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Verified success animation */}
        {isVerified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="bg-[#2C4A3E]/10 border border-[#2C4A3E]/20 rounded-xl p-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
                className="w-12 h-12 rounded-full bg-[#2C4A3E]/20 flex items-center justify-center mx-auto mb-3"
              >
                <CheckCircle2 className="w-6 h-6 text-[#2C4A3E]" />
              </motion.div>
              <p
                className="text-sm text-[#2C4A3E] font-semibold mb-1"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                Welcome to GigRider
              </p>

              {/* Countdown display */}
              <div className="h-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {countdownNumber !== null && (
                    <motion.span
                      key={countdownNumber}
                      initial={{ scale: 0.5, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 1.5, opacity: 0, y: -10 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="text-2xl font-bold text-[#C9A96E]"
                      style={{ fontFamily: 'var(--font-playfair), serif' }}
                    >
                      {countdownNumber}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <p
                className="text-xs text-[#7A7168]"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Redirecting to your dashboard...
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Back button */}
      {!isVerified && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-12 left-6 z-10"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[#7A7168] hover:text-[#1B2A4A] transition-colors duration-200"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span
              className="text-xs tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Back
            </span>
          </button>
        </motion.div>
      )}

      {/* Bottom decorative corners */}
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-[#C9A96E]/30" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-[#C9A96E]/30" />
    </div>
  );
}
