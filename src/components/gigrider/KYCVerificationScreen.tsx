'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useGigRiderStore } from '@/lib/store';
import {
  Shield,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Camera,
  ScanFace,
  CreditCard,
  Landmark,
  Fingerprint,
  Loader2,
  ChevronRight,
  Eye,
  EyeOff,
  MoveLeft,
  MoveRight,
  Smile,
  FileText,
} from 'lucide-react';

interface KYCVerificationScreenProps {
  onBack?: () => void;
}

// ─── Step definitions ───
const STEPS = [
  { id: 'aadhaar', number: 1, title: 'Aadhaar Verification', subtitle: 'Verify your identity with Aadhaar', icon: Fingerprint },
  { id: 'selfie', number: 2, title: 'Selfie + Liveness Check', subtitle: 'Photo verification for security', icon: ScanFace },
  { id: 'pan', number: 3, title: 'PAN Card Verification', subtitle: 'Link your PAN for tax compliance', icon: FileText },
  { id: 'bank', number: 4, title: 'Bank Account Linking', subtitle: 'Link bank for payouts & referral bonuses', icon: Landmark },
] as const;

type StepId = (typeof STEPS)[number]['id'];

export default function KYCVerificationScreen({ onBack }: KYCVerificationScreenProps) {
  const kyc = useGigRiderStore(s => s.kyc);
  const updateKYC = useGigRiderStore(s => s.updateKYC);

  // ─── Local state ───
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [panInput, setPanInput] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');

  const [loadingStep, setLoadingStep] = useState<StepId | null>(null);
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [livenessStep, setLivenessStep] = useState(0); // 0=not started, 1=look left, 2=look right, 3=smile, 4=done
  const [selfieTaken, setSelfieTaken] = useState(false);

  // ─── Derived step statuses ───
  const getStepStatus = useCallback((stepId: StepId): 'completed' | 'active' | 'locked' => {
    switch (stepId) {
      case 'aadhaar':
        return kyc.aadhaarVerified ? 'completed' : 'active';
      case 'selfie':
        return kyc.selfieVerified && kyc.livenessPassed
          ? 'completed'
          : kyc.aadhaarVerified
          ? 'active'
          : 'locked';
      case 'pan':
        return kyc.panVerified
          ? 'completed'
          : kyc.selfieVerified && kyc.livenessPassed
          ? 'active'
          : 'locked';
      case 'bank':
        return kyc.bankVerified
          ? 'completed'
          : kyc.panVerified
          ? 'active'
          : 'locked';
      default:
        return 'locked';
    }
  }, [kyc]);

  const allComplete = kyc.aadhaarVerified && kyc.selfieVerified && kyc.livenessPassed && kyc.panVerified && kyc.bankVerified;

  // ─── Aadhaar formatting (XXXX XXXX XXXX) ───
  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // ─── PAN formatting (ABCDE1234F) ───
  const formatPAN = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
  };

  // ─── Simulate verification ───
  const simulateVerification = useCallback((stepId: StepId, callback: () => void) => {
    setLoadingStep(stepId);
    setTimeout(() => {
      callback();
      setLoadingStep(null);
    }, 2000);
  }, []);

  // ─── Handlers ───
  const handleAadhaarVerify = () => {
    const rawDigits = aadhaarInput.replace(/\s/g, '');
    if (rawDigits.length !== 12) return;
    simulateVerification('aadhaar', () => {
      updateKYC({ aadhaarVerified: true, overallStatus: 'basic_verified', level: 1 });
    });
  };

  const handleSelfie = () => {
    if (!selfieTaken) {
      setSelfieTaken(true);
      return;
    }
  };

  const handleLiveness = () => {
    if (livenessStep === 0) {
      setLivenessStep(1);
    }
  };

  const handleLivenessInstruction = (step: number) => {
    if (livenessStep !== step) return;
    simulateVerification('selfie', () => {
      if (step < 3) {
        setLivenessStep(step + 1);
        setLoadingStep(null); // reset because we chain
      } else {
        updateKYC({ selfieVerified: true, livenessPassed: true });
        setLivenessStep(4);
      }
    });
  };

  const handlePanVerify = () => {
    if (panInput.length !== 10) return;
    simulateVerification('pan', () => {
      updateKYC({ panVerified: true });
    });
  };

  const handleBankVerify = () => {
    if (!bankAccount || !ifscCode) return;
    const last4 = bankAccount.slice(-4);
    simulateVerification('bank', () => {
      updateKYC({
        bankVerified: true,
        bankAccountMasked: '****' + last4,
        bankName: 'HDFC Bank',
        upiId: upiId,
        overallStatus: 'fully_verified',
        level: 2,
      });
    });
  };

  // ─── KYC Level label ───
  const getLevelLabel = () => {
    if (kyc.level === 0) return 'Unverified';
    if (kyc.level === 1) return 'Basic Verified';
    return 'Fully Verified';
  };

  const getLevelColor = () => {
    if (kyc.level === 0) return 'bg-[#7A7168]/10 text-[#7A7168] border-[#7A7168]/20';
    if (kyc.level === 1) return 'bg-[#C9A96E]/15 text-[#8B5E3C] border-[#C9A96E]/25';
    return 'bg-[#2C4A3E]/10 text-[#2C4A3E] border-[#2C4A3E]/15';
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-12">
      {/* ─── Header ─── */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#D5CBBF]">
        <div className="px-4 py-3 flex items-center gap-3">
          {onBack && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-white border border-[#D5CBBF] flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 text-[#1B2A4A]" />
            </motion.button>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1B2A4A]" />
              <h1
                className="text-lg font-bold text-[#1B2A4A] tracking-wide"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                KYC Verification
              </h1>
            </div>
          </div>
          <Badge className={`${getLevelColor()} text-[9px] font-semibold`}>
            <Shield className="w-2.5 h-2.5 mr-0.5" />
            Level {kyc.level} · {getLevelLabel()}
          </Badge>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-0">
        {/* ─── Fully Verified Success Card ─── */}
        <AnimatePresence>
          {allComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-gradient-to-br from-[#2C4A3E] to-[#1B3A2E] rounded-xl p-6 mb-6 relative overflow-hidden"
            >
              {/* Decorative pattern */}
              <div className="absolute top-0 right-0 w-28 h-28 opacity-[0.06]">
                <Shield className="w-full h-full" />
              </div>
              <div className="absolute bottom-0 left-0 w-20 h-20 opacity-[0.04]">
                <Shield className="w-full h-full" />
              </div>

              <div className="flex flex-col items-center text-center relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                  className="w-16 h-16 rounded-full bg-[#C9A96E]/20 flex items-center justify-center mb-4 border-2 border-[#C9A96E]/40"
                >
                  <Shield className="w-8 h-8 text-[#C9A96E]" />
                </motion.div>
                <h2
                  className="text-xl font-bold text-[#FAF7F2] mb-1"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  Fully Verified
                </h2>
                <p
                  className="text-xs text-[#FAF7F2]/60 mb-3"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Your identity has been verified. You are now eligible for referral bonuses and premium features.
                </p>
                <Badge className="bg-[#C9A96E]/20 text-[#C9A96E] border-[#C9A96E]/30 text-[10px] font-semibold px-3 py-1">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Level 2 · Fully Verified
                </Badge>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Vertical Steps ─── */}
        <div className="relative">
          {STEPS.map((step, index) => {
            const status = getStepStatus(step.id);
            const isCompleted = status === 'completed';
            const isActive = status === 'active';
            const isLocked = status === 'locked';
            const isLoading = loadingStep === step.id;
            const StepIcon = step.icon;
            const isLastStep = index === STEPS.length - 1;

            return (
              <div key={step.id} className="relative">
                {/* Connecting line */}
                {!isLastStep && (
                  <div className="absolute left-[19px] top-[44px] bottom-0 w-[2px] z-0">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`w-full h-full ${
                        isCompleted
                          ? 'bg-[#2C4A3E]'
                          : isActive
                          ? 'bg-gradient-to-b from-[#2C4A3E] to-[#D5CBBF]'
                          : 'bg-[#D5CBBF]'
                      }`}
                    />
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="flex gap-4 pb-6 relative z-10"
                >
                  {/* Number circle / Checkmark / Lock */}
                  <div className="shrink-0 pt-1">
                    <motion.div
                      whileHover={isActive ? { scale: 1.05 } : {}}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-[#2C4A3E] border-[#2C4A3E]'
                          : isActive
                          ? 'bg-[#1B2A4A] border-[#1B2A4A]'
                          : 'bg-[#F0EBE4] border-[#D5CBBF]'
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : isLocked ? (
                        <Lock className="w-4 h-4 text-[#7A7168]" />
                      ) : (
                        <span
                          className="text-sm font-bold text-white"
                          style={{ fontFamily: 'var(--font-playfair), serif' }}
                        >
                          {step.number}
                        </span>
                      )}
                    </motion.div>
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    {/* Step header */}
                    <div className="flex items-center gap-2 mb-1">
                      <StepIcon
                        className={`w-4 h-4 ${
                          isCompleted
                            ? 'text-[#2C4A3E]'
                            : isActive
                            ? 'text-[#1B2A4A]'
                            : 'text-[#7A7168]/50'
                        }`}
                      />
                      <h3
                        className={`text-sm font-semibold ${
                          isCompleted
                            ? 'text-[#2C4A3E]'
                            : isActive
                            ? 'text-[#1B2A4A]'
                            : 'text-[#7A7168]/50'
                        }`}
                        style={{ fontFamily: 'var(--font-playfair), serif' }}
                      >
                        {step.title}
                      </h3>
                      {isCompleted && (
                        <Badge className="bg-[#2C4A3E]/10 text-[#2C4A3E] border-[#2C4A3E]/15 text-[8px] font-semibold px-1.5 py-0">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p
                      className={`text-[11px] mb-3 ${
                        isLocked ? 'text-[#7A7168]/40' : 'text-[#7A7168]'
                      }`}
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      {step.subtitle}
                    </p>

                    {/* ─── Step 1: Aadhaar ─── */}
                    {step.id === 'aadhaar' && !isCompleted && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: isActive ? 1 : 0, height: isActive ? 'auto' : 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-white rounded-xl p-4 border border-[#D5CBBF] space-y-3">
                          <div>
                            <label
                              className="text-[10px] text-[#7A7168] uppercase tracking-wider font-semibold mb-1.5 block"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                            >
                              Aadhaar Number
                            </label>
                            <div className="relative">
                              <input
                                type={showAadhaar ? 'text' : 'password'}
                                value={aadhaarInput}
                                onChange={(e) => setAadhaarInput(formatAadhaar(e.target.value))}
                                placeholder="XXXX XXXX XXXX"
                                maxLength={14}
                                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D5CBBF] rounded-lg text-sm text-[#1B2A4A] tracking-widest placeholder:text-[#7A7168]/40 focus:outline-none focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20 transition-all"
                                style={{ fontFamily: 'var(--font-lora), serif' }}
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowAadhaar(!showAadhaar)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7168] hover:text-[#1B2A4A] transition-colors"
                              >
                                {showAadhaar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <p
                              className="text-[9px] text-[#7A7168] mt-1"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                            >
                              {aadhaarInput.replace(/\s/g, '').length}/12 digits
                            </p>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            whileHover={{ scale: 1.01 }}
                            onClick={handleAadhaarVerify}
                            disabled={aadhaarInput.replace(/\s/g, '').length !== 12 || isLoading}
                            className="w-full py-3 bg-[#1B2A4A] rounded-lg text-sm font-bold text-[#FAF7F2] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            style={{ fontFamily: 'var(--font-lora), serif' }}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <Fingerprint className="w-4 h-4" />
                                Verify Aadhaar
                              </>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* ─── Step 2: Selfie + Liveness ─── */}
                    {step.id === 'selfie' && !isCompleted && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: isActive ? 1 : 0, height: isActive ? 'auto' : 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-white rounded-xl p-4 border border-[#D5CBBF] space-y-4">
                          {/* Camera view area */}
                          <div className="flex justify-center">
                            <motion.div
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              className="w-32 h-32 rounded-full border-2 border-dashed border-[#C9A96E]/40 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#1B2A4A]/5 via-[#C9A96E]/5 to-[#2C4A3E]/5"
                            >
                              {selfieTaken ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="flex flex-col items-center"
                                >
                                  <CheckCircle2 className="w-8 h-8 text-[#2C4A3E] mb-1" />
                                  <span
                                    className="text-[9px] text-[#2C4A3E] font-semibold"
                                    style={{ fontFamily: 'var(--font-lora), serif' }}
                                  >
                                    Selfie Captured
                                  </span>
                                </motion.div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <Camera className="w-8 h-8 text-[#7A7168]/40 mb-1" />
                                  <span
                                    className="text-[9px] text-[#7A7168]/60"
                                    style={{ fontFamily: 'var(--font-lora), serif' }}
                                  >
                                    Tap below
                                  </span>
                                </div>
                              )}
                              {/* Decorative ring */}
                              <div className="absolute inset-2 rounded-full border border-[#C9A96E]/20" />
                            </motion.div>
                          </div>

                          {/* Take Selfie button */}
                          {!selfieTaken ? (
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              whileHover={{ scale: 1.01 }}
                              onClick={handleSelfie}
                              disabled={isLoading}
                              className="w-full py-3 bg-[#1B2A4A] rounded-lg text-sm font-bold text-[#FAF7F2] flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                            >
                              <Camera className="w-4 h-4" />
                              Take Selfie
                            </motion.button>
                          ) : (
                            <>
                              {/* Liveness instructions */}
                              <div className="space-y-2">
                                <p
                                  className="text-[10px] text-[#7A7168] uppercase tracking-wider font-semibold"
                                  style={{ fontFamily: 'var(--font-lora), serif' }}
                                >
                                  Liveness Check
                                </p>
                                {[
                                  { step: 1, label: 'Look Left', icon: MoveLeft, desc: 'Slowly turn your head to the left' },
                                  { step: 2, label: 'Look Right', icon: MoveRight, desc: 'Slowly turn your head to the right' },
                                  { step: 3, label: 'Smile', icon: Smile, desc: 'Give a natural smile at the camera' },
                                ].map((instruction) => {
                                  const isCurrentStep = livenessStep === instruction.step;
                                  const isDone = livenessStep > instruction.step || (livenessStep === 4);
                                  const InstIcon = instruction.icon;

                                  return (
                                    <motion.div
                                      key={instruction.step}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: instruction.step * 0.1 }}
                                      className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-300 ${
                                        isDone
                                          ? 'bg-[#2C4A3E]/5 border-[#2C4A3E]/15'
                                          : isCurrentStep
                                          ? 'bg-[#1B2A4A]/5 border-[#1B2A4A]/20'
                                          : 'bg-[#FAF7F2] border-[#D5CBBF]/50 opacity-50'
                                      }`}
                                    >
                                      <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                          isDone
                                            ? 'bg-[#2C4A3E]/10'
                                            : isCurrentStep
                                            ? 'bg-[#1B2A4A]/10'
                                            : 'bg-[#D5CBBF]/50'
                                        }`}
                                      >
                                        {isDone ? (
                                          <CheckCircle2 className="w-4 h-4 text-[#2C4A3E]" />
                                        ) : (
                                          <InstIcon className={`w-4 h-4 ${isCurrentStep ? 'text-[#1B2A4A]' : 'text-[#7A7168]/50'}`} />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p
                                          className={`text-xs font-semibold ${isDone ? 'text-[#2C4A3E]' : isCurrentStep ? 'text-[#1B2A4A]' : 'text-[#7A7168]/50'}`}
                                          style={{ fontFamily: 'var(--font-lora), serif' }}
                                        >
                                          {instruction.label}
                                        </p>
                                        <p
                                          className="text-[9px] text-[#7A7168]"
                                          style={{ fontFamily: 'var(--font-lora), serif' }}
                                        >
                                          {instruction.desc}
                                        </p>
                                      </div>
                                      {isCurrentStep && !isLoading && (
                                        <motion.button
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() => handleLivenessInstruction(instruction.step)}
                                          className="px-3 py-1.5 bg-[#1B2A4A] rounded-md text-[10px] font-bold text-[#FAF7F2] shrink-0"
                                          style={{ fontFamily: 'var(--font-lora), serif' }}
                                        >
                                          Done
                                        </motion.button>
                                      )}
                                      {isLoading && isCurrentStep && (
                                        <Loader2 className="w-4 h-4 animate-spin text-[#1B2A4A] shrink-0" />
                                      )}
                                    </motion.div>
                                  );
                                })}
                              </div>

                              {/* Start Liveness Check button (if not started) */}
                              {livenessStep === 0 && (
                                <motion.button
                                  whileTap={{ scale: 0.97 }}
                                  whileHover={{ scale: 1.01 }}
                                  onClick={handleLiveness}
                                  disabled={isLoading}
                                  className="w-full py-3 bg-[#1B2A4A] rounded-lg text-sm font-bold text-[#FAF7F2] flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                                  style={{ fontFamily: 'var(--font-lora), serif' }}
                                >
                                  <ScanFace className="w-4 h-4" />
                                  Start Liveness Check
                                </motion.button>
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* ─── Step 3: PAN ─── */}
                    {step.id === 'pan' && !isCompleted && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: isActive ? 1 : 0, height: isActive ? 'auto' : 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-white rounded-xl p-4 border border-[#D5CBBF] space-y-3">
                          <div>
                            <label
                              className="text-[10px] text-[#7A7168] uppercase tracking-wider font-semibold mb-1.5 block"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                            >
                              PAN Number
                            </label>
                            <input
                              type="text"
                              value={panInput}
                              onChange={(e) => setPanInput(formatPAN(e.target.value))}
                              placeholder="ABCDE1234F"
                              maxLength={10}
                              className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D5CBBF] rounded-lg text-sm text-[#1B2A4A] tracking-widest placeholder:text-[#7A7168]/40 focus:outline-none focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20 transition-all uppercase"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                              disabled={isLoading}
                            />
                            <p
                              className="text-[9px] text-[#7A7168] mt-1"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                            >
                              {panInput.length}/10 characters · Format: ABCDE1234F
                            </p>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            whileHover={{ scale: 1.01 }}
                            onClick={handlePanVerify}
                            disabled={panInput.length !== 10 || isLoading}
                            className="w-full py-3 bg-[#1B2A4A] rounded-lg text-sm font-bold text-[#FAF7F2] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            style={{ fontFamily: 'var(--font-lora), serif' }}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <FileText className="w-4 h-4" />
                                Verify PAN
                              </>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* ─── Step 4: Bank Account ─── */}
                    {step.id === 'bank' && !isCompleted && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: isActive ? 1 : 0, height: isActive ? 'auto' : 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-white rounded-xl p-4 border border-[#D5CBBF] space-y-3">
                          <div>
                            <label
                              className="text-[10px] text-[#7A7168] uppercase tracking-wider font-semibold mb-1.5 block"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                            >
                              Account Number
                            </label>
                            <input
                              type="text"
                              value={bankAccount}
                              onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, '').slice(0, 18))}
                              placeholder="Enter account number"
                              className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D5CBBF] rounded-lg text-sm text-[#1B2A4A] tracking-wider placeholder:text-[#7A7168]/40 focus:outline-none focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20 transition-all"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                              disabled={isLoading}
                            />
                          </div>
                          <div>
                            <label
                              className="text-[10px] text-[#7A7168] uppercase tracking-wider font-semibold mb-1.5 block"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                            >
                              IFSC Code
                            </label>
                            <input
                              type="text"
                              value={ifscCode}
                              onChange={(e) => setIfscCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))}
                              placeholder="e.g. HDFC0001234"
                              maxLength={11}
                              className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D5CBBF] rounded-lg text-sm text-[#1B2A4A] tracking-wider placeholder:text-[#7A7168]/40 focus:outline-none focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20 transition-all uppercase"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                              disabled={isLoading}
                            />
                          </div>
                          <div>
                            <label
                              className="text-[10px] text-[#7A7168] uppercase tracking-wider font-semibold mb-1.5 block"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                            >
                              UPI ID <span className="normal-case tracking-normal font-normal">(optional)</span>
                            </label>
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="yourname@upi"
                              className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D5CBBF] rounded-lg text-sm text-[#1B2A4A] placeholder:text-[#7A7168]/40 focus:outline-none focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20 transition-all"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                              disabled={isLoading}
                            />
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            whileHover={{ scale: 1.01 }}
                            onClick={handleBankVerify}
                            disabled={!bankAccount || !ifscCode || isLoading}
                            className="w-full py-3 bg-[#1B2A4A] rounded-lg text-sm font-bold text-[#FAF7F2] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            style={{ fontFamily: 'var(--font-lora), serif' }}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <Landmark className="w-4 h-4" />
                                Verify Bank Account
                              </>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* Locked step message */}
                    {isLocked && (
                      <div className="bg-[#FAF7F2] rounded-xl p-3 border border-[#D5CBBF]/50 flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-[#7A7168]/40" />
                        <p
                          className="text-[10px] text-[#7A7168]/60"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          Complete previous steps to unlock
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* ─── Fraud Prevention Notice ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 mb-6 bg-[#1B2A4A]/[0.03] rounded-xl p-4 border border-[#D5CBBF]/50"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1B2A4A]/5 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-4 h-4 text-[#1B2A4A]/50" />
            </div>
            <div>
              <p
                className="text-[10px] font-semibold text-[#1B2A4A]/60 mb-0.5"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                Fraud Prevention
              </p>
              <p
                className="text-[10px] text-[#7A7168]/70 leading-relaxed"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Your data is encrypted and verified to prevent fraud. Aadhaar, PAN, and bank details are required for referral bonus eligibility.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
