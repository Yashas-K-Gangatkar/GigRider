'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGigRiderStore, PLATFORMS } from '@/lib/store';
import {
  Star,
  Trophy,
  Zap,
  Crown,
  Lock,
  Bike,
  MapPin,
  Bell,
  CreditCard,
  HelpCircle,
  Info,
  ChevronRight,
  Award,
  TrendingUp,
  Package,
  Settings,
  LogOut,
  Pencil,
  Shield,
  FileText,
  Users,
  Gauge,
  Share2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  color: string;
  progress?: number;
  progressLabel?: string;
  targetValue?: number;
}

const SETTINGS_ITEMS = [
  { id: 'vehicle', icon: Bike, label: 'Vehicle Type', value: 'Scooter' },
  { id: 'zones', icon: MapPin, label: 'Preferred Zones', value: '3 zones' },
  { id: 'notifications', icon: Bell, label: 'Notification Settings', value: '' },
  { id: 'bank', icon: CreditCard, label: 'Bank Account Details', value: 'HDFC ****4523' },
  { id: 'help', icon: HelpCircle, label: 'Help & Support', value: '' },
  { id: 'about', icon: Info, label: 'About GigRider', value: 'v2.1.0' },
];

const VEHICLE_LABELS: Record<string, string> = {
  bicycle: 'Bicycle',
  scooter: 'Scooter',
  motorcycle: 'Motorcycle',
  car: 'Car',
};

const DOCUMENTS = [
  { id: 'dl', label: 'Driving License', status: 'verified' as const, icon: FileText },
  { id: 'rc', label: 'Vehicle RC', status: 'verified' as const, icon: Bike },
  { id: 'insurance', label: 'Insurance', status: 'pending' as const, icon: Shield },
];

interface ProfileScreenProps {
  onLogout?: () => void;
  onOpenSettings?: () => void;
  onOpenKYC?: () => void;
}

export default function ProfileScreen({ onLogout, onOpenSettings, onOpenKYC }: ProfileScreenProps) {
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const rider = useGigRiderStore(s => s.rider);
  const connectedPlatforms = useGigRiderStore(s => s.connectedPlatforms);
  const logout = useGigRiderStore(s => s.logout);
  const kyc = useGigRiderStore(s => s.kyc);
  const referrals = useGigRiderStore(s => s.referrals);
  const referralStats = useGigRiderStore(s => s.referralStats);
  const referralCode = useGigRiderStore(s => s.referralCode);

  // Derive profile data from store
  const profileName = rider?.name || 'Rider';
  const profileRating = rider?.rating || 4.8;
  const profileTotalDeliveries = rider?.totalDeliveries || 0;
  const profileTotalEarnings = rider?.totalEarnings || 0;
  const profileTier = rider?.tier || 'free';
  const profileVehicle = rider?.vehicleType || 'scooter';
  const profileMemberSince = rider?.memberSince || 'Recently';

  const tierLabels: Record<string, string> = {
    free: 'Rider',
    pro: 'Pro Rider',
    elite: 'Elite Rider',
    fleet: 'Fleet Manager',
  };

  // MPGCS Score - derived from platform data
  const avgRating = connectedPlatforms.length > 0
    ? connectedPlatforms.reduce((s, p) => s + p.rating, 0) / connectedPlatforms.length
    : profileRating;
  const avgAcceptance = connectedPlatforms.length > 0
    ? connectedPlatforms.reduce((s, p) => s + (p.acceptanceRate || 85), 0) / connectedPlatforms.length
    : 85;
  const avgCompletion = connectedPlatforms.length > 0
    ? connectedPlatforms.reduce((s, p) => s + (p.completionRate || 95), 0) / connectedPlatforms.length
    : 95;
  const mpgcsScore = Math.round((avgRating / 5 * 300) + (avgAcceptance / 100 * 300) + (avgCompletion / 100 * 300));
  const mpgcsMax = 900;
  const mpgcsPercent = mpgcsScore / mpgcsMax;

  // Build achievements with dynamic progress from store data
  const ACHIEVEMENTS: Achievement[] = useMemo(() => {
    const marathonProgress = Math.min(100, Math.round((profileTotalDeliveries / 5000) * 100));
    const diamondProgress = Math.min(100, Math.round((profileTotalEarnings / 1000000) * 100));
    return [
      { id: 'century', title: 'Century Club', description: '100 deliveries in a week', icon: '\uD83C\uDFC6', unlocked: true, color: '#C9A96E', progress: 100 },
      { id: 'speed', title: 'Speed Demon', description: 'Fastest delivery 3 times', icon: '\u26A1', unlocked: true, color: '#1B2A4A', progress: 100 },
      { id: 'night', title: 'Night Rider', description: '50 night deliveries', icon: '\uD83C\uDF19', unlocked: true, color: '#2A3F6A', progress: 100 },
      { id: 'fivestar', title: '5-Star Monarch', description: 'Maintained 4.8+ for 30 days', icon: '\uD83D\uDC51', unlocked: true, color: '#C9A96E', progress: 100 },
      { id: 'multi', title: 'Multi-Platform Master', description: 'Active on 4+ platforms', icon: '\uD83D\uDD25', unlocked: true, color: '#A84020', progress: 100 },
      {
        id: 'marathon',
        title: 'Marathon Runner',
        description: '5,000 total deliveries',
        icon: '\uD83C\uDFC3',
        unlocked: profileTotalDeliveries >= 5000,
        color: '#2C4A3E',
        progress: marathonProgress,
        progressLabel: `${profileTotalDeliveries.toLocaleString()}/5,000`,
        targetValue: 5000,
      },
      {
        id: 'diamond',
        title: 'Diamond Rider',
        description: 'Earn ₹10L+ lifetime',
        icon: '\uD83D\uDC8E',
        unlocked: profileTotalEarnings >= 1000000,
        color: '#1B2A4A',
        progress: diamondProgress,
        progressLabel: `₹${(profileTotalEarnings / 100000).toFixed(1)}L/₹10L`,
        targetValue: 1000000,
      },
      { id: 'legend', title: 'Legendary Status', description: 'Maintain 5.0 for 90 days', icon: '\uD83C\uDF1F', unlocked: false, color: '#C9A96E', progress: 22, progressLabel: '22/90 days' },
    ];
  }, [profileTotalDeliveries, profileTotalEarnings]);

  const visibleAchievements = showAllAchievements
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.slice(0, 5);

  // Platform ratings from connected platforms
  const platformRatings = connectedPlatforms
    .filter(p => p.rating > 0)
    .map(p => {
      const config = PLATFORMS[p.id];
      return {
        name: config?.displayName || p.id,
        rating: p.rating,
        color: config?.color || '#7A7168',
      };
    });

  // Update settings items with dynamic vehicle type
  const settingsWithDynamic = SETTINGS_ITEMS.map(item => {
    if (item.id === 'vehicle') {
      return { ...item, value: VEHICLE_LABELS[profileVehicle] || profileVehicle };
    }
    return item;
  });

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  // Circular gauge SVG parameters
  const gaugeRadius = 62;
  const gaugeStroke = 10;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCircumference * (1 - mpgcsPercent);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#D5CBBF] px-4 py-3">
        <h1
          className="text-lg font-bold text-[#1B2A4A] tracking-wide"
          style={{ fontFamily: 'var(--font-playfair), serif' }}
        >
          Profile
        </h1>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* ─── Rider Profile Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-[#F5F0EB] rounded-xl p-5 border border-[#D5CBBF] card-elegant relative"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center text-2xl border-2 border-[#C9A96E]/40"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              {rider?.avatar || profileName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  className="text-xl font-bold text-[#2C2C2C] truncate"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  {profileName}
                </h2>
                {/* Edit Profile Pencil Icon Button - next to the name */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-[#1B2A4A]/8 hover:bg-[#1B2A4A]/15 transition-colors shrink-0"
                  aria-label="Edit profile"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#1B2A4A]/70" />
                </motion.button>
                <Badge className="bg-[#C9A96E]/15 text-[#8B5E3C] border-[#C9A96E]/25 text-[9px] shrink-0">
                  <Award className="w-2.5 h-2.5 mr-0.5" />
                  {tierLabels[profileTier] || 'Rider'}
                </Badge>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-[#C9A96E] fill-[#C9A96E]" />
                <span
                  className="text-sm font-bold text-[#C9A96E]"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  {profileRating}
                </span>
                <span
                  className="text-xs text-[#7A7168]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Rating
                </span>
              </div>
              <p
                className="text-[10px] text-[#7A7168] mt-0.5"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Member since {profileMemberSince}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─── Tier Upgrade CTA Card ─── */}
        {profileTier !== 'elite' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-[#1B2A4A] to-[#2A3F6A] rounded-xl p-5 text-[#FAF7F2] relative overflow-hidden"
          >
            {/* Decorative pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.06]">
              <Crown className="w-full h-full" />
            </div>

            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-[#C9A96E]/20 flex items-center justify-center">
                <Crown className="w-4.5 h-4.5 text-[#C9A96E]" />
              </div>
              <div>
                <h3
                  className="text-sm font-bold"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  Upgrade to Elite Rider
                </h3>
                <p
                  className="text-[10px] text-[#FAF7F2]/50"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Unlock premium benefits
                </p>
              </div>
            </div>

            {/* Benefits list */}
            <div className="space-y-2 mb-4 relative z-10">
              {[
                { label: 'Priority Support', desc: 'Get dedicated 24/7 assistance' },
                { label: 'Higher Earnings', desc: 'Up to 2x earnings boosts on peak orders' },
                { label: 'Exclusive Badges', desc: 'Stand out with Elite Rider badge & perks' },
              ].map((benefit) => (
                <div key={benefit.label} className="flex items-start gap-2">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-[#C9A96E]/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-[#C9A96E]" />
                  </div>
                  <div>
                    <p
                      className="text-xs font-semibold text-[#FAF7F2]"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      {benefit.label}
                    </p>
                    <p
                      className="text-[10px] text-[#FAF7F2]/50"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              className="w-full py-3 bg-[#C9A96E] rounded-lg text-sm font-bold text-[#1B2A4A] flex items-center justify-center gap-2 relative z-10"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Upgrade
              <ArrowUpRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {/* ─── MPGCS (Multi-Platform Gig Credit Score) Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-xl p-5 border border-[#D5CBBF] card-elegant"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1B2A4A]/8 flex items-center justify-center">
                <Gauge className="w-4 h-4 text-[#1B2A4A]" />
              </div>
              <div>
                <h3
                  className="text-sm font-semibold text-[#2C2C2C]"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  MPGCS Score
                </h3>
                <p
                  className="text-[9px] text-[#7A7168]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Multi-Platform Gig Credit Score
                </p>
              </div>
            </div>
            <Badge className="bg-[#2C4A3E]/10 text-[#2C4A3E] border-[#2C4A3E]/15 text-[10px] font-semibold">
              Excellent
            </Badge>
          </div>

          {/* Circular Gauge Visualization */}
          <div className="relative flex items-center justify-center py-4">
            <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={gaugeRadius}
                fill="none"
                stroke="#F0EBE4"
                strokeWidth={gaugeStroke}
              />
              {/* Score arc - animated */}
              <motion.circle
                cx="80"
                cy="80"
                r={gaugeRadius}
                fill="none"
                stroke="url(#mpgcsGradient)"
                strokeWidth={gaugeStroke}
                strokeLinecap="round"
                strokeDasharray={gaugeCircumference}
                initial={{ strokeDashoffset: gaugeCircumference }}
                animate={{ strokeDashoffset: gaugeOffset }}
                transition={{ duration: 1.8, ease: 'easeOut' }}
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="mpgcsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C9A96E" />
                  <stop offset="100%" stopColor="#D4B87A" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p
                className="text-4xl font-bold text-[#1B2A4A]"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                {mpgcsScore}
              </p>
              <p
                className="text-[10px] text-[#7A7168] tracking-wider"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                out of {mpgcsMax}
              </p>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="flex items-center justify-between text-[10px] text-[#7A7168] px-1" style={{ fontFamily: 'var(--font-lora), serif' }}>
            <span>Based on rating, acceptance rate & completion</span>
          </div>

          {/* Mini score factors */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: 'Rating', value: Math.round(avgRating / 5 * 100), pct: Math.round(avgRating / 5 * 100) },
              { label: 'Acceptance', value: Math.round(avgAcceptance), pct: Math.round(avgAcceptance) },
              { label: 'Completion', value: Math.round(avgCompletion), pct: Math.round(avgCompletion) },
            ].map((factor) => (
              <div key={factor.label} className="text-center">
                <p
                  className="text-xs font-bold text-[#1B2A4A]"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  {factor.value}%
                </p>
                <div className="w-full bg-[#F0EBE4] rounded-full h-1 mt-1">
                  <motion.div
                    className="h-1 rounded-full bg-[#C9A96E]"
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.pct}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                </div>
                <p
                  className="text-[8px] text-[#7A7168] mt-0.5 uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {factor.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Performance Stats Grid ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { icon: Package, label: 'Total Deliveries', value: profileTotalDeliveries.toLocaleString(), color: 'text-[#1B2A4A]' },
            { icon: TrendingUp, label: 'Total Earnings', value: `₹${profileTotalEarnings.toLocaleString()}`, color: 'text-[#8B5E3C]' },
            { icon: Star, label: 'Average Rating', value: profileRating.toString(), color: 'text-[#C9A96E]' },
            { icon: Zap, label: 'Completion Rate', value: `${Math.round(avgCompletion)}%`, color: 'text-[#2C4A3E]' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.08 }}
              className="bg-white rounded-xl p-4 border border-[#D5CBBF] card-elegant"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p
                className="text-lg font-bold text-[#1B2A4A]"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                {stat.value}
              </p>
              <p
                className="text-[10px] text-[#7A7168] tracking-wider uppercase"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── KYC Verification Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.11 }}
          className="bg-white rounded-xl p-5 border border-[#D5CBBF] card-elegant"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1B2A4A]/8 flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#1B2A4A]" />
              </div>
              <div>
                <h3
                  className="text-sm font-semibold text-[#2C2C2C]"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  Identity Verification
                </h3>
                <p
                  className="text-[9px] text-[#7A7168]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Required for referral bonuses & withdrawals
                </p>
              </div>
            </div>
            <Badge className={`text-[8px] font-semibold ${
              kyc.overallStatus === 'fully_verified'
                ? 'bg-[#2C4A3E]/10 text-[#2C4A3E] border-[#2C4A3E]/15'
                : kyc.overallStatus === 'basic_verified'
                ? 'bg-[#C9A96E]/15 text-[#8B5E3C] border-[#C9A96E]/25'
                : 'bg-[#7A7168]/10 text-[#7A7168] border-[#7A7168]/20'
            }`}>
              {kyc.overallStatus === 'fully_verified' ? 'Verified' : kyc.overallStatus === 'basic_verified' ? 'Basic' : 'Unverified'}
            </Badge>
          </div>

          {/* KYC Steps Progress */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Aadhaar', done: kyc.aadhaarVerified },
              { label: 'Selfie', done: kyc.selfieVerified && kyc.livenessPassed },
              { label: 'PAN', done: kyc.panVerified },
              { label: 'Bank', done: kyc.bankVerified },
            ].map((step) => (
              <div key={step.label} className="text-center">
                <div className={`w-7 h-7 rounded-full mx-auto mb-1 flex items-center justify-center ${
                  step.done ? 'bg-[#2C4A3E]/10' : 'bg-[#D5CBBF]/50'
                }`}>
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4 text-[#2C4A3E]" />
                  ) : (
                    <Lock className="w-3 h-3 text-[#7A7168]/50" />
                  )}
                </div>
                <p
                  className={`text-[8px] font-semibold ${step.done ? 'text-[#2C4A3E]' : 'text-[#7A7168]/50'}`}
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {step.label}
                </p>
              </div>
            ))}
          </div>

          {kyc.overallStatus !== 'fully_verified' && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              onClick={onOpenKYC}
              className="w-full mt-3 py-2.5 bg-[#1B2A4A] rounded-lg text-xs font-bold text-[#FAF7F2] flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              <Shield className="w-3.5 h-3.5" />
              {kyc.level === 0 ? 'Start Verification' : 'Continue Verification'}
            </motion.button>
          )}
        </motion.div>

        {/* ─── Invite Friends Referral Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-gradient-to-r from-[#C9A96E]/10 to-[#C9A96E]/5 rounded-xl p-5 border border-[#C9A96E]/25"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/20 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5 text-[#C9A96E]" />
            </div>
            <div className="flex-1">
              <h3
                className="text-sm font-bold text-[#8B5E3C]"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                Invite Friends
              </h3>
              <p
                className="text-xs text-[#7A7168] mt-0.5"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Earn <span className="font-bold text-[#C9A96E]">₹200</span> per referral — your friends get ₹100 too!
              </p>
              <p
                className="text-[9px] text-[#7A7168]/70 mt-1"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Friend must complete 10 deliveries + KYC. Bonus on 7-day hold before payout.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <div
              className="flex-1 px-3 py-2.5 bg-white rounded-lg border border-[#D5CBBF] text-sm font-bold text-[#1B2A4A] tracking-wider text-center"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              {referralCode || 'GIGRIDE200'}
            </div>
          <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                const code = referralCode || 'GIGRIDE200';
                if (navigator.share) {
                  navigator.share({ title: 'Join GigRider', text: `Use my referral code ${code} to get ₹100 bonus!`, url: 'https://gigrider.app' });
                } else {
                  navigator.clipboard.writeText(code);
                }
              }}
              className="px-5 py-2.5 bg-[#C9A96E] rounded-lg text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5 shrink-0"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Invite
            </motion.button>
          </div>

          {/* Referral Stats Mini Bar */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[
              { label: 'Invited', value: referralStats.totalReferred, color: 'text-[#1B2A4A]' },
              { label: 'Qualified', value: referralStats.qualified, color: 'text-[#2C4A3E]' },
              { label: 'Earned', value: `₹${referralStats.earned}`, color: 'text-[#C9A96E]' },
              { label: 'On Hold', value: `₹${referralStats.onHold}`, color: 'text-[#7A7168]' },
            ].map((stat) => (
              <div key={stat.label} className="text-center bg-white/50 rounded-lg py-1.5">
                <p className={`text-xs font-bold ${stat.color}`} style={{ fontFamily: 'var(--font-playfair), serif' }}>
                  {stat.value}
                </p>
                <p className="text-[7px] text-[#7A7168] uppercase tracking-wider" style={{ fontFamily: 'var(--font-lora), serif' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Referral Tracker ─── */}
        {referrals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            className="bg-white rounded-xl p-5 border border-[#D5CBBF] card-elegant"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1B2A4A]" />
                <h3
                  className="text-sm font-semibold text-[#2C2C2C]"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  Referral Tracker
                </h3>
              </div>
              <Badge className="bg-[#C9A96E]/15 text-[#8B5E3C] border-[#C9A96E]/25 text-[8px]">
                {referrals.length} friends
              </Badge>
            </div>

            <div className="space-y-2">
              {referrals.slice(0, 5).map((ref) => {
                const progress = Math.min(100, Math.round((ref.refereeDeliveriesCompleted / ref.deliveriesRequired) * 100));
                const statusColors: Record<string, { bg: string; text: string; label: string }> = {
                  paid: { bg: 'bg-[#2C4A3E]/10', text: 'text-[#2C4A3E]', label: 'Paid' },
                  on_hold: { bg: 'bg-[#1B2A4A]/10', text: 'text-[#1B2A4A]', label: `${ref.holdDaysRemaining}d hold` },
                  qualified: { bg: 'bg-[#C9A96E]/10', text: 'text-[#8B5E3C]', label: 'Qualified' },
                  pending: { bg: 'bg-[#7A7168]/10', text: 'text-[#7A7168]', label: 'In Progress' },
                  fraud_detected: { bg: 'bg-[#722F37]/10', text: 'text-[#722F37]', label: 'Flagged' },
                  rejected: { bg: 'bg-[#722F37]/10', text: 'text-[#722F37]', label: 'Rejected' },
                };
                const statusInfo = statusColors[ref.status] || statusColors.pending;

                return (
                  <div key={ref.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#FAF7F2] border border-[#F0EBE4]">
                    <div className="w-8 h-8 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center text-xs font-bold text-[#1B2A4A] shrink-0" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                      {ref.refereeName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-[#2C2C2C] truncate" style={{ fontFamily: 'var(--font-lora), serif' }}>
                          {ref.refereeName}
                        </p>
                        <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.text} shrink-0`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      {/* Progress bar for pending referrals */}
                      {ref.status === 'pending' && (
                        <div>
                          <div className="w-full bg-[#E8E0D4] rounded-full h-1.5">
                            <motion.div
                              className="h-1.5 rounded-full bg-[#C9A96E]"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                          <p className="text-[7px] text-[#7A7168] mt-0.5" style={{ fontFamily: 'var(--font-lora), serif' }}>
                            {ref.refereeDeliveriesCompleted}/{ref.deliveriesRequired} deliveries
                          </p>
                        </div>
                      )}
                      {ref.status === 'on_hold' && (
                        <p className="text-[7px] text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                          ₹{ref.referrerBonusAmount} bonus in {ref.holdDaysRemaining}-day fraud hold
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ─── Documents Section ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl p-5 border border-[#D5CBBF] card-elegant"
        >
          <h3
            className="text-sm font-semibold text-[#2C2C2C] mb-3 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            <FileText className="w-4 h-4 text-[#1B2A4A]" />
            Documents
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {DOCUMENTS.map((doc) => {
              const isVerified = doc.status === 'verified';
              return (
                <motion.div
                  key={doc.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-xl border text-center transition-colors ${
                    isVerified
                      ? 'bg-[#2C4A3E]/5 border-[#2C4A3E]/15'
                      : 'bg-[#8B5E3C]/5 border-[#8B5E3C]/15'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      isVerified ? 'bg-[#2C4A3E]/10' : 'bg-[#8B5E3C]/10'
                    }`}
                  >
                    <doc.icon
                      className={`w-4 h-4 ${isVerified ? 'text-[#2C4A3E]' : 'text-[#8B5E3C]'}`}
                    />
                  </div>
                  <p
                    className="text-[10px] font-semibold text-[#2C2C2C] leading-tight mb-1.5"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    {doc.label}
                  </p>
                  <div
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
                      isVerified
                        ? 'bg-[#2C4A3E]/10 text-[#2C4A3E]'
                        : 'bg-[#8B5E3C]/10 text-[#8B5E3C]'
                    }`}
                  >
                    {isVerified ? (
                      <>
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Clock className="w-2.5 h-2.5" />
                        Pending
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Platform-wise Ratings ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-5 border border-[#D5CBBF] card-elegant"
        >
          <h3
            className="text-sm font-semibold text-[#2C2C2C] mb-3 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            <Star className="w-4 h-4 text-[#C9A96E]" />
            Platform Ratings
          </h3>

          <div className="space-y-3">
            {platformRatings.length > 0 ? platformRatings.map((platform) => (
              <div key={platform.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border border-[#C9A96E]/20"
                    style={{ backgroundColor: platform.color }}
                  >
                    {platform.name.split(' ').pop()}
                  </div>
                  <span
                    className="text-sm text-[#2C2C2C] font-medium"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    {platform.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(platform.rating)
                          ? 'text-[#C9A96E] fill-[#C9A96E]'
                          : i < platform.rating
                          ? 'text-[#C9A96E] fill-[#C9A96E]/50'
                          : 'text-[#D5CBBF]'
                      }`}
                    />
                  ))}
                  <span
                    className="text-sm font-bold text-[#C9A96E] ml-1"
                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                  >
                    {platform.rating}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                Connect platforms to see ratings
              </p>
            )}
          </div>
        </motion.div>

        {/* ─── Achievements ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-5 border border-[#D5CBBF] card-elegant"
        >
          <h3
            className="text-sm font-semibold text-[#2C2C2C] mb-3 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            <Trophy className="w-4 h-4 text-[#C9A96E]" />
            Achievements
            <Badge className="bg-[#C9A96E]/15 text-[#8B5E3C] border-[#C9A96E]/25 text-[9px]">
              {ACHIEVEMENTS.filter((a) => a.unlocked).length}/{ACHIEVEMENTS.length}
            </Badge>
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {visibleAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.06, type: 'spring', stiffness: 200 }}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  achievement.unlocked
                    ? 'bg-[#F5F0EB] border-[#D5CBBF]'
                    : 'bg-[#FAF7F2] border-[#E8E0D4] opacity-70'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{achievement.icon}</span>
                  {achievement.unlocked ? null : <Lock className="w-3 h-3 text-[#7A7168] ml-auto" />}
                </div>
                <p
                  className={`text-xs font-bold ${achievement.unlocked ? 'text-[#2C2C2C]' : 'text-[#7A7168]'}`}
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  {achievement.title}
                </p>
                <p
                  className="text-[9px] text-[#7A7168] mt-0.5"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {achievement.description}
                </p>
                {/* Progress bar for locked achievements */}
                {!achievement.unlocked && achievement.progress !== undefined && (
                  <div className="mt-2">
                    <div className="w-full bg-[#E8E0D4] rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-1.5 rounded-full"
                        style={{ backgroundColor: achievement.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${achievement.progress}%` }}
                        transition={{ duration: 1.2, delay: 0.5 }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p
                        className="text-[8px] text-[#7A7168]"
                        style={{ fontFamily: 'var(--font-lora), serif' }}
                      >
                        {achievement.progressLabel || `${achievement.progress}%`}
                      </p>
                      <p
                        className="text-[8px] font-bold"
                        style={{ fontFamily: 'var(--font-lora), serif', color: achievement.color }}
                      >
                        {achievement.progress}%
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {!showAllAchievements && ACHIEVEMENTS.length > 5 && (
            <button
              onClick={() => setShowAllAchievements(true)}
              className="w-full mt-3 py-2 text-xs text-[#1B2A4A] font-semibold hover:underline transition-colors duration-200"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              View All Achievements
            </button>
          )}
          {showAllAchievements && (
            <button
              onClick={() => setShowAllAchievements(false)}
              className="w-full mt-3 py-2 text-xs text-[#7A7168] font-semibold hover:text-[#2C2C2C] transition-colors duration-200"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Show Less
            </button>
          )}
        </motion.div>

        {/* ─── Settings ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-[#D5CBBF] overflow-hidden card-elegant"
        >
          <button
            onClick={onOpenSettings}
            className="w-full p-4 flex items-center justify-between hover:bg-[#F5F0EB] transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#1B2A4A]" />
              <h3
                className="text-sm font-semibold text-[#2C2C2C]"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                Settings
              </h3>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7A7168]" />
          </button>

          <Separator className="bg-[#F0EBE4]" />

          {settingsWithDynamic.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
            >
              <button
                onClick={onOpenSettings}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#F5F0EB] transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-[#7A7168]" />
                  <span
                    className="text-sm text-[#2C2C2C] font-medium"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span
                      className="text-xs text-[#7A7168]"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      {item.value}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-[#7A7168]" />
                </div>
              </button>
              {index < settingsWithDynamic.length - 1 && <Separator className="bg-[#F0EBE4]" />}
            </motion.div>
          ))}
        </motion.div>

        {/* Logout Button */}
        {onLogout && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={handleLogout}
              className="w-full py-4 rounded-xl border-2 border-[#722F37]/30 text-[#722F37] font-semibold flex items-center justify-center gap-2 hover:bg-[#722F37]/5 transition-all duration-200"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.div>
        )}

        {/* App Version */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center py-4"
        >
          <p
            className="text-[10px] text-[#7A7168]/60"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            GigRider v2.1.0
          </p>
          <p
            className="text-[9px] text-[#7A7168]/40 mt-0.5 tracking-[0.1em] uppercase"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            One App. Every Platform. More Earnings.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
