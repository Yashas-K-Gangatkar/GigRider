'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Bike, ArrowRight, ChevronLeft } from 'lucide-react';

interface SignupScreenProps {
  onSignup: (data: { name: string; phone: string }) => void;
  onGoToLogin: () => void;
}

export default function SignupScreen({ onSignup, onGoToLogin }: SignupScreenProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<'bicycle' | 'scooter' | 'motorcycle' | 'car'>('scooter');
  const [isLoading, setIsLoading] = useState(false);

  const VEHICLE_OPTIONS = [
    { id: 'bicycle' as const, label: 'Bicycle', icon: '🚲' },
    { id: 'scooter' as const, label: 'Scooter', icon: '🛵' },
    { id: 'motorcycle' as const, label: 'Motorcycle', icon: '🏍️' },
    { id: 'car' as const, label: 'Car', icon: '🚗' },
  ];

  const handleSignup = () => {
    if (name.length >= 2 && phone.length >= 10) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onSignup({ name, phone });
      }, 1200);
    }
  };

  const isFormValid = name.length >= 2 && phone.length >= 10;

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col linen-texture">
      {/* Decorative corners */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-[#C9A96E]/30" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-[#C9A96E]/30" />

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

      <div className="flex-1 flex flex-col justify-center px-8 max-w-md mx-auto w-full pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1
            className="text-2xl tracking-[0.1em] text-[#1B2A4A] mb-2"
            style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 700 }}
          >
            Create Account
          </h1>

          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#C9A96E]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#C9A96E]" />
          </div>

          <p
            className="text-xs text-[#7A7168] tracking-[0.1em]"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            Join the distinguished community of delivery partners
          </p>
        </motion.div>

        {/* Form Fields */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-5"
        >
          {/* Full Name */}
          <div>
            <label
              className="block text-xs text-[#7A7168] mb-2 tracking-[0.1em] uppercase"
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
                className="w-full pl-11 pr-4 py-4 bg-white border border-[#D5CBBF] rounded-xl text-[#2C2C2C] text-sm placeholder:text-[#7A7168]/50 focus:outline-none focus:border-[#1B2A4A] focus:ring-2 focus:ring-[#1B2A4A]/10 transition-all duration-200"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              />
            </div>
          </div>

          {/* Phone Number */}
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

          {/* Vehicle Type */}
          <div>
            <label
              className="block text-xs text-[#7A7168] mb-2 tracking-[0.1em] uppercase"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Vehicle Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {VEHICLE_OPTIONS.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => setVehicleType(vehicle.id)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all duration-200 ${
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
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Signup Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <motion.button
            onClick={handleSignup}
            disabled={!isFormValid || isLoading}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              isFormValid
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
          className="mt-6 text-center"
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

        {/* Terms */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-[10px] text-[#7A7168]/60 text-center mt-6 leading-relaxed"
          style={{ fontFamily: 'var(--font-lora), serif' }}
        >
          By creating an account, you agree to our Terms of Service
          <br />
          and Privacy Policy
        </motion.p>
      </div>

      {/* Bottom decorative corners */}
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-[#C9A96E]/30" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-[#C9A96E]/30" />
    </div>
  );
}
