'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, CheckCircle2, Shield } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (phone: string) => void;
  onGoToSignup: () => void;
}

export default function LoginScreen({ onLogin, onGoToSignup }: LoginScreenProps) {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsDetail, setShowTermsDetail] = useState(false);

  // Format phone as XXXXX XXXXX
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  };

  const rawPhone = phone.replace(/\s/g, '');
  const isPhoneValid = rawPhone.length >= 10;
  const canProceed = isPhoneValid && agreedToTerms;

  const handleSendOTP = () => {
    if (canProceed) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLogin(rawPhone);
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col linen-texture relative">
      {/* Decorative gold corners */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-[#C9A96E]/30" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-[#C9A96E]/30" />

      {/* Subtle floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 0.08, 0],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 1.2,
              ease: 'easeInOut',
            }}
            className="absolute w-6 h-6 rounded-full border border-[#C9A96E]/15"
            style={{
              left: `${15 + i * 20}%`,
              top: `${30 + i * 12}%`,
            }}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 max-w-md mx-auto w-full relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-full border-2 border-[#C9A96E] bg-white/80 flex items-center justify-center mx-auto mb-5 shadow-lg"
            style={{ boxShadow: '0 0 24px rgba(201, 169, 110, 0.15)' }}
          >
            <span
              className="text-2xl text-[#1B2A4A]"
              style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 700 }}
            >
              GR
            </span>
          </motion.div>

          <h1
            className="text-3xl tracking-[0.12em] text-[#1B2A4A] mb-2"
            style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 700 }}
          >
            GIG<span className="text-[#C9A96E]">RIDER</span>
          </h1>

          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#C9A96E]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#C9A96E]" />
          </div>

          <p
            className="text-xs text-[#7A7168] tracking-[0.15em] uppercase"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            One App. Every Platform. More Earnings.
          </p>
        </motion.div>

        {/* Welcome Text - Step 1 indicator */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          {/* Step Progress */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#1B2A4A] flex items-center justify-center shadow-sm">
              <span className="text-[10px] font-bold text-[#FAF7F2]" style={{ fontFamily: 'var(--font-lora), serif' }}>1</span>
            </div>
            <div className="flex-1 h-1 bg-gradient-to-r from-[#1B2A4A] to-[#D5CBBF] rounded-full" />
            <div className="w-7 h-7 rounded-full bg-[#E8E0D4] flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>2</span>
            </div>
            <span className="text-[9px] text-[#7A7168] tracking-wider uppercase" style={{ fontFamily: 'var(--font-lora), serif' }}>
              Verify
            </span>
          </div>

          <h2
            className="text-xl font-bold text-[#1B2A4A] mb-1.5"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            Welcome Back
          </h2>
          <p
            className="text-sm text-[#7A7168]"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            Sign in to continue managing your deliveries across all platforms.
          </p>
        </motion.div>

        {/* Phone Input */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4"
        >
          <div>
            <label
              className="block text-xs text-[#7A7168] mb-2 tracking-[0.1em] uppercase"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Mobile Number
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#7A7168]" />
                <span
                  className="text-sm text-[#2C2C2C] font-medium"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  +91
                </span>
                <div className="w-px h-5 bg-[#D5CBBF]" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="Enter your mobile number"
                className={`w-full pl-24 pr-10 py-4 bg-white border rounded-xl text-[#2C2C2C] text-sm placeholder:text-[#7A7168]/50 focus:outline-none transition-all duration-200 ${
                  isPhoneValid
                    ? 'border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/10 shadow-[0_0_0_1px_rgba(44,74,62,0.1)]'
                    : 'border-[#D5CBBF] focus:border-[#1B2A4A] focus:ring-2 focus:ring-[#1B2A4A]/10'
                }`}
                style={{ fontFamily: 'var(--font-lora), serif' }}
              />
              {/* Valid checkmark - animated */}
              {isPhoneValid && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, rotate: -90 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#2C4A3E]" />
                </motion.div>
              )}
            </div>
            {/* Phone digit counter */}
            <div className="flex items-center justify-between mt-1.5 px-1">
              <span className="text-[9px] text-[#7A7168]/40" style={{ fontFamily: 'var(--font-lora), serif' }}>
                10-digit mobile number
              </span>
              <span className={`text-[9px] font-medium tabular-nums ${
                rawPhone.length >= 10 ? 'text-[#2C4A3E]' : 'text-[#7A7168]/40'
              }`} style={{ fontFamily: 'var(--font-lora), serif' }}>
                {rawPhone.length}/10
              </span>
            </div>
          </div>

          {/* Terms Checkbox */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-start gap-2.5"
          >
            <button
              onClick={() => setAgreedToTerms(!agreedToTerms)}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                agreedToTerms
                  ? 'bg-[#1B2A4A] border-[#1B2A4A]'
                  : 'bg-white border-[#D5CBBF]'
              }`}
            >
              {agreedToTerms && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              )}
            </button>
            <p
              className="text-[11px] text-[#7A7168] leading-relaxed"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              I agree to the{' '}
              <button className="text-[#1B2A4A] font-semibold underline underline-offset-2">Terms of Service</button>
              {' '}and{' '}
              <button className="text-[#1B2A4A] font-semibold underline underline-offset-2">Privacy Policy</button>
            </p>
          </motion.div>

          {/* Send OTP Button */}
          <motion.button
            onClick={handleSendOTP}
            disabled={!canProceed || isLoading}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              canProceed
                ? 'bg-[#1B2A4A] text-[#FAF7F2] shadow-md hover:bg-[#2A3F6A] hover:shadow-lg'
                : 'bg-[#E8E0D4] text-[#7A7168] cursor-not-allowed'
            }`}
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-[#FAF7F2]/30 border-t-[#FAF7F2] rounded-full"
              />
            ) : (
              <>
                Continue with OTP
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-4 my-6"
        >
          <div className="flex-1 h-px bg-[#D5CBBF]" />
          <span
            className="text-[10px] text-[#7A7168] tracking-[0.15em] uppercase"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            New to GigRider?
          </span>
          <div className="flex-1 h-px bg-[#D5CBBF]" />
        </motion.div>

        {/* Go to Signup */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={onGoToSignup}
            className="w-full py-4 rounded-xl text-sm font-semibold border-2 border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A]/5 transition-all duration-200"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            Create New Account
          </button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 space-y-2"
        >
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#2C4A3E]/40" />
              <span
                className="text-[9px] text-[#7A7168]/50 tracking-wider"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                256-bit Encrypted
              </span>
            </div>
            <div className="w-px h-3 bg-[#D5CBBF]/50" />
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-[#2C4A3E]/40" />
              <span
                className="text-[9px] text-[#7A7168]/50 tracking-wider"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                OTP Verified
              </span>
            </div>
          </div>
          <p
            className="text-[8px] text-[#7A7168]/30 text-center tracking-wider"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            Trusted by 50,000+ delivery partners across India
          </p>
        </motion.div>
      </div>

      {/* Bottom decorative */}
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-[#C9A96E]/30" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-[#C9A96E]/30" />
    </div>
  );
}
