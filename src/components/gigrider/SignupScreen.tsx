'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, ArrowRight, ChevronLeft, CheckCircle2, Shield, Star } from 'lucide-react';

interface SignupScreenProps {
  onSignup: (data: { name: string; phone: string; vehicleType: 'bicycle' | 'scooter' | 'motorcycle' | 'car' }) => void;
  onGoToLogin: () => void;
}

const VEHICLE_OPTIONS = [
  { id: 'bicycle' as const, label: 'Bicycle', icon: '🚲', desc: 'Eco-friendly', perk: 'Low cost' },
  { id: 'scooter' as const, label: 'Scooter', icon: '🛵', desc: 'Popular', perk: 'Most orders' },
  { id: 'motorcycle' as const, label: 'Motorcycle', icon: '🏍️', desc: 'Fast', perk: 'Long range' },
  { id: 'car' as const, label: 'Car', icon: '🚗', desc: 'Premium', perk: 'High pay' },
];

export default function SignupScreen({ onSignup, onGoToLogin }: SignupScreenProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<'bicycle' | 'scooter' | 'motorcycle' | 'car'>('scooter');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Format phone as XXXXX XXXXX
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  };

  const rawPhone = phone.replace(/\s/g, '');
  const isPhoneValid = rawPhone.length >= 10;
  const isNameValid = name.length >= 2;
  const isFormValid = isNameValid && isPhoneValid && agreedToTerms;

  // Calculate form progress
  const formProgress = [
    isNameValid,
    isPhoneValid,
    vehicleType !== null,
    agreedToTerms,
  ].filter(Boolean).length;

  const handleSignup = () => {
    if (isFormValid) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onSignup({ name, phone: rawPhone, vehicleType });
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col linen-texture relative">
      {/* Decorative corners */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-[#C9A96E]/30" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-[#C9A96E]/30" />

      {/* Subtle floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -15, 0],
              opacity: [0, 0.06, 0],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 1.5,
              ease: 'easeInOut',
            }}
            className="absolute w-5 h-5 rounded-full border border-[#C9A96E]/12"
            style={{
              left: `${20 + i * 25}%`,
              top: `${35 + i * 10}%`,
            }}
          />
        ))}
      </div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-10"
        style={{ marginTop: '40px' }}
      >
        <button
          onClick={onGoToLogin}
          className="flex items-center gap-1.5 text-[#7A7168] hover:text-[#1B2A4A] transition-colors duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
          <span
            className="text-xs tracking-wider uppercase"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            Back
          </span>
        </button>
      </motion.div>

      <div className="flex-1 flex flex-col justify-center px-8 max-w-md mx-auto w-full pt-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1
            className="text-2xl tracking-[0.1em] text-[#1B2A4A] mb-2"
            style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 700 }}
          >
            Create Account
          </h1>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-[#E8E0D4] flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-[#7A7168]" />
              </div>
              <span className="text-[9px] text-[#7A7168] tracking-wider uppercase" style={{ fontFamily: 'var(--font-lora), serif' }}>
                Phone
              </span>
            </div>
            <div className="w-8 h-px bg-[#C9A96E]/40" />
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-[#1B2A4A] flex items-center justify-center">
                <span className="text-[9px] font-bold text-[#FAF7F2]" style={{ fontFamily: 'var(--font-lora), serif' }}>2</span>
              </div>
              <span className="text-[9px] text-[#1B2A4A] font-semibold tracking-wider uppercase" style={{ fontFamily: 'var(--font-lora), serif' }}>
                Profile
              </span>
            </div>
            <div className="w-8 h-px bg-[#D5CBBF]" />
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-[#E8E0D4] flex items-center justify-center">
                <span className="text-[9px] font-bold text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>3</span>
              </div>
              <span className="text-[9px] text-[#7A7168] tracking-wider uppercase" style={{ fontFamily: 'var(--font-lora), serif' }}>
                Verify
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-48 mx-auto h-1 bg-[#E8E0D4] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(formProgress / 4) * 100}%` }}
              className="h-full rounded-full bg-gradient-to-r from-[#1B2A4A] to-[#C9A96E]"
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mb-2 mt-3">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#C9A96E]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#C9A96E]" />
          </div>

          <p
            className="text-xs text-[#7A7168] tracking-[0.05em]"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            Join the community of multi-platform delivery partners
          </p>
        </motion.div>

        {/* Form Fields */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {/* Full Name */}
          <div>
            <label
              className="block text-xs text-[#7A7168] mb-1.5 tracking-[0.1em] uppercase"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="w-4 h-4 text-[#7A7168]" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className={`w-full pl-11 pr-10 py-3.5 bg-white border rounded-xl text-[#2C2C2C] text-sm placeholder:text-[#7A7168]/50 focus:outline-none transition-all duration-200 ${
                  isNameValid
                    ? 'border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/10'
                    : 'border-[#D5CBBF] focus:border-[#1B2A4A] focus:ring-2 focus:ring-[#1B2A4A]/10'
                }`}
                style={{ fontFamily: 'var(--font-lora), serif' }}
              />
              {isNameValid && (
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
          </div>

          {/* Phone Number */}
          <div>
            <label
              className="block text-xs text-[#7A7168] mb-1.5 tracking-[0.1em] uppercase"
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
                className={`w-full pl-24 pr-10 py-3.5 bg-white border rounded-xl text-[#2C2C2C] text-sm placeholder:text-[#7A7168]/50 focus:outline-none transition-all duration-200 ${
                  isPhoneValid
                    ? 'border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/10'
                    : 'border-[#D5CBBF] focus:border-[#1B2A4A] focus:ring-2 focus:ring-[#1B2A4A]/10'
                }`}
                style={{ fontFamily: 'var(--font-lora), serif' }}
              />
              {isPhoneValid && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#2C4A3E]" />
                </motion.div>
              )}
            </div>
            <div className="flex items-center justify-between mt-1 px-1">
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

          {/* Vehicle Type - Enhanced with perks */}
          <div>
            <label
              className="block text-xs text-[#7A7168] mb-1.5 tracking-[0.1em] uppercase"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Vehicle Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {VEHICLE_OPTIONS.map((vehicle) => (
                <motion.button
                  key={vehicle.id}
                  onClick={() => setVehicleType(vehicle.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all duration-200 ${
                    vehicleType === vehicle.id
                      ? 'bg-[#1B2A4A] border-[#1B2A4A] text-[#FAF7F2] shadow-sm'
                      : 'bg-white border-[#D5CBBF] text-[#2C2C2C] hover:border-[#1B2A4A]/30'
                  }`}
                >
                  <span className="text-lg">{vehicle.icon}</span>
                  <span
                    className="text-[9px] font-medium tracking-wider uppercase"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    {vehicle.label}
                  </span>
                  {vehicleType === vehicle.id && (
                    <motion.span
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[7px] text-[#C9A96E] tracking-wider uppercase flex items-center gap-0.5"
                    >
                      <Star className="w-2 h-2" />
                      {vehicle.perk}
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Terms Checkbox */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-2.5 pt-1"
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
        </motion.div>

        {/* Signup Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6"
        >
          <motion.button
            onClick={handleSignup}
            disabled={!isFormValid || isLoading}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              isFormValid
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
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Already have account */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 text-center"
        >
          <p
            className="text-xs text-[#7A7168]"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            Already have an account?{' '}
            <button
              onClick={onGoToLogin}
              className="text-[#1B2A4A] font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-5 space-y-2"
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
        </motion.div>
      </div>

      {/* Bottom decorative corners */}
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-[#C9A96E]/30" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-[#C9A96E]/30" />
    </div>
  );
}
