'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, ChevronLeft } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (phone: string) => void;
  onGoToSignup: () => void;
}

export default function LoginScreen({ onLogin, onGoToSignup }: LoginScreenProps) {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = () => {
    if (phone.length >= 10) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLogin(phone);
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col linen-texture">
      {/* Decorative gold corners */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-[#C9A96E]/30" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-[#C9A96E]/30" />

      <div className="flex-1 flex flex-col justify-center px-8 max-w-md mx-auto w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-full border-2 border-[#C9A96E] bg-white/80 flex items-center justify-center mx-auto mb-6 shadow-lg"
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
            className="text-3xl tracking-[0.12em] text-[#1B2A4A] mb-3"
            style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 700 }}
          >
            GIG<span className="text-[#C9A96E]">RIDER</span>
          </h1>

          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mb-3">
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

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <h2
            className="text-xl font-bold text-[#1B2A4A] mb-2"
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
          className="space-y-5"
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
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter your mobile number"
                className="w-full pl-24 pr-4 py-4 bg-white border border-[#D5CBBF] rounded-xl text-[#2C2C2C] text-sm placeholder:text-[#7A7168]/50 focus:outline-none focus:border-[#1B2A4A] focus:ring-2 focus:ring-[#1B2A4A]/10 transition-all duration-200"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              />
            </div>
          </div>

          {/* Send OTP Button */}
          <motion.button
            onClick={handleSendOTP}
            disabled={phone.length < 10 || isLoading}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              phone.length >= 10
                ? 'bg-[#1B2A4A] text-[#FAF7F2] shadow-md hover:bg-[#2A3F6A]'
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
          className="flex items-center gap-4 my-8"
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

        {/* Terms */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-[10px] text-[#7A7168]/60 text-center mt-8 leading-relaxed"
          style={{ fontFamily: 'var(--font-lora), serif' }}
        >
          By continuing, you agree to our Terms of Service
          <br />
          and Privacy Policy
        </motion.p>
      </div>

      {/* Bottom decorative */}
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-[#C9A96E]/30" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-[#C9A96E]/30" />
    </div>
  );
}
