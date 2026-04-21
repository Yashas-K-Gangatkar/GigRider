'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';

interface OTPScreenProps {
  phone: string;
  onVerified: () => void;
  onBack: () => void;
}

export default function OTPScreen({ phone, onVerified, onBack }: OTPScreenProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-verify when all 6 digits entered (DEMO: any 6 digits work)
  useEffect(() => {
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      handleVerify(otpValue);
    }
  }, [otp]);

  const handleVerify = (otpValue: string) => {
    setIsVerifying(true);
    setError('');

    // DEMO: Accept any 6-digit OTP
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);

      // Auto-navigate after success animation
      setTimeout(() => {
        onVerified();
      }, 1500);
    }, 1500);
  };

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
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    setCountdown(30);
    setCanResend(false);
    setError('');
    inputRefs.current[0]?.focus();
  };

  const maskedPhone = phone
    ? `+91 ${phone.slice(0, 2)}****${phone.slice(-2)}`
    : '+91 ******00';

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col linen-texture">
      {/* Decorative corners */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-[#C9A96E]/30" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-[#C9A96E]/30" />

      <div className="flex-1 flex flex-col justify-center px-8 max-w-md mx-auto w-full">
        {/* Shield Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
          className="text-center mb-10"
        >
          <div
            className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center border-2 transition-all duration-500 ${
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
              >
                <CheckCircle2 className="w-10 h-10 text-[#2C4A3E]" />
              </motion.div>
            ) : (
              <Shield className="w-10 h-10 text-[#1B2A4A]" />
            )}
          </div>

          <h1
            className="text-2xl tracking-[0.05em] text-[#1B2A4A] mb-2"
            style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 700 }}
          >
            {isVerified ? 'Verified' : 'Verify OTP'}
          </h1>

          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#C9A96E]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#C9A96E]" />
          </div>

          <p
            className="text-xs text-[#7A7168]"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            {isVerified
              ? 'Identity confirmed. Welcome aboard.'
              : `We've sent a verification code to ${maskedPhone}`
            }
          </p>
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

            <div className="flex gap-2.5 justify-center mb-6">
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
                        ? 'border-[#1B2A4A] bg-white text-[#1B2A4A]'
                        : 'border-[#D5CBBF] bg-white text-[#2C2C2C]'
                    } ${isVerifying ? 'opacity-50' : ''} focus:border-[#1B2A4A] focus:ring-2 focus:ring-[#1B2A4A]/10`}
                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                  />
                </motion.div>
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

            {/* Demo hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-[#C9A96E]/8 border border-[#C9A96E]/15 rounded-xl p-3 mb-6"
            >
              <p
                className="text-[10px] text-[#8B5E3C] text-center"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                <span className="font-semibold">Demo Mode:</span> Enter any 6 digits to continue
              </p>
            </motion.div>

            {/* Resend */}
            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="flex items-center gap-1.5 mx-auto text-xs text-[#1B2A4A] font-semibold hover:underline"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Resend Code
                </button>
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
              <p
                className="text-sm text-[#2C4A3E] font-semibold mb-1"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                Welcome to GigRider
              </p>
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

      {/* Bottom decorative corners */}
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-[#C9A96E]/30" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-[#C9A96E]/30" />
    </div>
  );
}
