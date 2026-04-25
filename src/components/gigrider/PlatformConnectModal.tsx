'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  type PlatformAuthProvider,
  initiatePlatformAuth,
  joinWaitlist,
  verifyPlatformConnection,
  type PlatformConnection,
} from '@/lib/platformAuth';
import {
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Shield,
  Link2,
  Zap,
  Mail,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface PlatformConnectModalProps {
  platform: PlatformAuthProvider;
  existingConnection?: PlatformConnection;
  onClose: () => void;
  onConnected: (connection: PlatformConnection) => void;
}

export default function PlatformConnectModal({
  platform,
  existingConnection,
  onClose,
  onConnected,
}: PlatformConnectModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectProgress, setConnectProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [waitlistJoined, setWaitlistJoined] = useState(false);
  const [connectionResult, setConnectionResult] = useState<PlatformConnection | null>(null);

  const isComingSoon = platform.status === 'coming_soon';
  const isBeta = platform.status === 'beta';
  const isConnected = existingConnection?.isConnected;

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    setConnectProgress(0);

    try {
      // Step 1: Initiate auth
      const authResult = await initiatePlatformAuth(platform.id);
      if (!authResult.success) {
        setError(authResult.message);
        setIsConnecting(false);
        return;
      }

      // Step 2: Simulate progress
      const progressInterval = setInterval(() => {
        setConnectProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Step 3: Simulate OAuth callback verification
      await new Promise((resolve) => setTimeout(resolve, 2000));
      clearInterval(progressInterval);
      setConnectProgress(95);

      const connection = await verifyPlatformConnection(
        platform.id,
        'simulated-auth-code'
      );

      setConnectProgress(100);

      await new Promise((resolve) => setTimeout(resolve, 300));

      setConnectionResult(connection);
      onConnected(connection);
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!waitlistEmail || !waitlistEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsJoiningWaitlist(true);
    setError(null);

    try {
      const result = await joinWaitlist(platform.id, waitlistEmail);
      if (result.success) {
        setWaitlistJoined(true);
      } else {
        setError(result.message);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsJoiningWaitlist(false);
    }
  };

  // Status badge
  const renderStatusBadge = () => {
    switch (platform.status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#2C4A3E] bg-[#2C4A3E]/10 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Available
          </span>
        );
      case 'beta':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#8B5E3C] bg-[#8B5E3C]/10 px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3" />
            Beta
          </span>
        );
      case 'coming_soon':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#7A7168] bg-[#7A7168]/10 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            Coming Soon
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-sm bg-[#FAF7F2] rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 20px 60px rgba(27, 42, 74, 0.2)',
        }}
      >
        {/* Header with platform color accent */}
        <div
          className="relative h-20 flex items-end p-4"
          style={{
            background: `linear-gradient(135deg, ${platform.color}20, ${platform.color}05)`,
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <X className="w-4 h-4 text-[#1B2A4A]" />
          </button>

          {/* Platform info */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white border-2 border-white"
              style={{
                backgroundColor: platform.color,
                boxShadow: `0 4px 12px ${platform.color}40`,
              }}
            >
              {platform.icon}
            </div>
            <div>
              <h3
                className="text-lg font-bold text-[#1B2A4A]"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                {platform.displayName}
              </h3>
              <div className="flex items-center gap-2">
                {renderStatusBadge()}
                {isConnected && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#2C4A3E] bg-[#2C4A3E]/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Description */}
          <p
            className="text-xs text-[#7A7168] leading-relaxed"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            {platform.description}
          </p>

          {/* Connection success state */}
          {connectionResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-[#2C4A3E]/5 rounded-xl border border-[#2C4A3E]/15 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#2C4A3E]/10 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6 text-[#2C4A3E]" />
              </div>
              <p
                className="text-sm font-bold text-[#2C4A3E]"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                Successfully Connected!
              </p>
              <p
                className="text-[10px] text-[#7A7168] mt-1"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                {platform.displayName} is now linked to your GigRider account.
              </p>
            </motion.div>
          )}

          {/* Features list */}
          {!isComingSoon && !connectionResult && (
            <div>
              <p
                className="text-[9px] text-[#7A7168] tracking-wider uppercase font-semibold mb-2"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Features Enabled
              </p>
              <div className="space-y-1.5">
                {platform.features.map((feature) => (
                  <div
                    key={feature.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg ${
                      feature.available
                        ? 'bg-white border border-[#D5CBBF]'
                        : 'bg-[#F5F0EB] border border-[#E8E0D4] opacity-50'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        feature.available
                          ? 'bg-[#2C4A3E]/10'
                          : 'bg-[#7A7168]/10'
                      }`}
                    >
                      {feature.available ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2C4A3E]" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-[#7A7168]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-xs font-medium text-[#2C2C2C]"
                        style={{ fontFamily: 'var(--font-lora), serif' }}
                      >
                        {feature.name}
                      </p>
                      <p
                        className="text-[9px] text-[#7A7168]"
                        style={{ fontFamily: 'var(--font-lora), serif' }}
                      >
                        {feature.description}
                      </p>
                    </div>
                    {!feature.available && (
                      <span
                        className="text-[7px] text-[#7A7168] bg-[#7A7168]/10 px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ fontFamily: 'var(--font-lora), serif' }}
                      >
                        Soon
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required permissions */}
          {!isComingSoon && !connectionResult && (
            <div>
              <p
                className="text-[9px] text-[#7A7168] tracking-wider uppercase font-semibold mb-2"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Required Permissions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {platform.scope.map((scope) => (
                  <span
                    key={scope}
                    className="inline-flex items-center gap-1 text-[9px] font-medium text-[#1B2A4A] bg-[#1B2A4A]/5 px-2 py-1 rounded-full"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    <Shield className="w-2.5 h-2.5" />
                    {scope}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Beta warning */}
          {isBeta && !connectionResult && (
            <div className="flex items-start gap-2 p-3 bg-[#8B5E3C]/5 rounded-lg border border-[#8B5E3C]/15">
              <AlertCircle className="w-4 h-4 text-[#8B5E3C] flex-shrink-0 mt-0.5" />
              <div>
                <p
                  className="text-[10px] font-semibold text-[#8B5E3C]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Beta Integration
                </p>
                <p
                  className="text-[10px] text-[#8B5E3C] mt-0.5"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  This integration is in beta. Some features may be limited or
                  experience occasional issues.
                </p>
              </div>
            </div>
          )}

          {/* Coming soon - Waitlist */}
          {isComingSoon && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-[#7A7168]/5 rounded-lg border border-[#7A7168]/15">
                <Clock className="w-4 h-4 text-[#7A7168] flex-shrink-0 mt-0.5" />
                <div>
                  <p
                    className="text-[10px] font-semibold text-[#7A7168]"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    Integration Under Development
                  </p>
                  <p
                    className="text-[10px] text-[#7A7168] mt-0.5"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    We&apos;re working with {platform.displayName} to enable
                    access. Join the waitlist to be notified when it&apos;s
                    ready!
                  </p>
                </div>
              </div>

              {/* Planned features */}
              <div>
                <p
                  className="text-[9px] text-[#7A7168] tracking-wider uppercase font-semibold mb-2"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Planned Features
                </p>
                <div className="space-y-1">
                  {platform.features.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-center gap-2 text-[10px] text-[#7A7168] opacity-60"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      <Clock className="w-3 h-3" />
                      {feature.name} — {feature.description}
                    </div>
                  ))}
                </div>
              </div>

              {/* Waitlist form */}
              {!waitlistJoined ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7168]" />
                    <input
                      type="email"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#D5CBBF] rounded-lg text-xs text-[#1B2A4A] focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E]/30"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    />
                  </div>
                  <motion.button
                    onClick={handleJoinWaitlist}
                    whileTap={{ scale: 0.95 }}
                    disabled={isJoiningWaitlist}
                    className="w-full py-2.5 bg-[#1B2A4A] rounded-lg text-[11px] font-semibold text-[#FAF7F2] flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    {isJoiningWaitlist ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        Join Waitlist
                      </>
                    )}
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-[#2C4A3E]/5 rounded-lg border border-[#2C4A3E]/15 text-center"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#2C4A3E] mx-auto mb-1" />
                  <p
                    className="text-xs font-semibold text-[#2C4A3E]"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    You&apos;re on the waitlist!
                  </p>
                  <p
                    className="text-[9px] text-[#7A7168] mt-0.5"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    We&apos;ll notify you at {waitlistEmail} when{' '}
                    {platform.displayName} integration is ready.
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* Connecting progress */}
          {isConnecting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 p-3 bg-[#1B2A4A]/5 rounded-lg">
                <Loader2 className="w-4 h-4 text-[#1B2A4A] animate-spin" />
                <p
                  className="text-xs text-[#1B2A4A] font-medium"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Connecting to {platform.displayName}...
                </p>
              </div>
              <div className="w-full bg-[#F0EBE4] rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full"
                  style={{ backgroundColor: platform.color }}
                  animate={{ width: `${connectProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex items-center gap-1.5 justify-center">
                <ExternalLink className="w-3 h-3 text-[#7A7168]" />
                <p
                  className="text-[9px] text-[#7A7168]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Redirecting to {platform.displayName} OAuth...
                </p>
              </div>
            </motion.div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-[#722F37]/5 rounded-lg border border-[#722F37]/15">
              <AlertCircle className="w-4 h-4 text-[#722F37] flex-shrink-0" />
              <p
                className="text-[10px] text-[#722F37]"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                {error}
              </p>
            </div>
          )}

          {/* Action buttons */}
          {!isComingSoon && !connectionResult && !isConnecting && (
            <div className="flex gap-3">
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-3 bg-[#F0EBE4] rounded-lg text-sm font-semibold text-[#7A7168] active:bg-[#E8E0D4] transition-colors"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleConnect}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 active:opacity-90 transition-all shadow-sm"
                style={{
                  backgroundColor: platform.color,
                  fontFamily: 'var(--font-lora), serif',
                }}
              >
                <Link2 className="w-4 h-4" />
                {isConnected ? 'Reconnect' : 'Connect'}
              </motion.button>
            </div>
          )}

          {/* Connected state - close button */}
          {connectionResult && (
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-[#1B2A4A] rounded-lg text-sm font-semibold text-[#FAF7F2] flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Done
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}

          {/* Coming soon - close button */}
          {isComingSoon && (
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-[#F0EBE4] rounded-lg text-sm font-semibold text-[#7A7168] active:bg-[#E8E0D4] transition-colors"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Close
            </motion.button>
          )}

          {/* Security note */}
          {!isComingSoon && !connectionResult && (
            <div className="flex items-center gap-1.5 justify-center">
              <Shield className="w-3 h-3 text-[#2C4A3E]" />
              <p
                className="text-[9px] text-[#7A7168]"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Your credentials are encrypted and securely stored
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
