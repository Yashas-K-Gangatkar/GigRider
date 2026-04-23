'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useGigRiderStore, PLATFORMS, type PlatformId } from '@/lib/store';
import { PLATFORM_PROVIDERS, getProvidersByStatus, type PlatformAuthProvider, type PlatformConnection, syncPlatformData, savePlatformConnection } from '@/lib/platformAuth';
import PlatformConnectModal from '@/components/gigrider/PlatformConnectModal';
import {
  Link2,
  Plus,
  Zap,
  Clock,
  MapPin,
  Shield,
  Route,
  Globe,
  ChevronRight,
  ChevronDown,
  Star,
  Loader2,
  Sparkles,
  X,
  TrendingUp,
  Package,
  Wifi,
  WifiOff,
  BarChart3,
  ArrowUpRight,
  CircleDot,
  CheckCircle2,
  Activity,
  AlertCircle,
  Eye,
  Timer,
  Award,
  Flame,
  Copy,
  Lightbulb,
  Trophy,
} from 'lucide-react';

export default function PlatformsScreen() {
  const connectedPlatforms = useGigRiderStore(s => s.connectedPlatforms);
  const autoAcceptRules = useGigRiderStore(s => s.autoAcceptRules);
  const shifts = useGigRiderStore(s => s.shifts);

  const togglePlatformOnline = useGigRiderStore(s => s.togglePlatformOnline);
  const setAllPlatformsOnline = useGigRiderStore(s => s.setAllPlatformsOnline);
  const setAllPlatformsOffline = useGigRiderStore(s => s.setAllPlatformsOffline);
  const addPlatform = useGigRiderStore(s => s.addPlatform);
  const removePlatform = useGigRiderStore(s => s.removePlatform);
  const updateAutoAcceptRules = useGigRiderStore(s => s.updateAutoAcceptRules);
  const updateShift = useGigRiderStore(s => s.updateShift);

  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<string | null>(null);
  const [connectingProgress, setConnectingProgress] = useState(0);
  const [confirmDisconnect, setConfirmDisconnect] = useState<string | null>(null);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [expandedShift, setExpandedShift] = useState<number | null>(null);
  const [editingShiftIndex, setEditingShiftIndex] = useState<number | null>(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [connectModalPlatform, setConnectModalPlatform] = useState<PlatformAuthProvider | null>(null);
  const [syncingPlatformId, setSyncingPlatformId] = useState<string | null>(null);
  const [lastSyncTimestamps, setLastSyncTimestamps] = useState<Record<string, string>>({});

  // Derive available platforms (not connected yet)
  const availablePlatforms = useMemo(() => {
    const connectedIds = new Set(connectedPlatforms.map(p => p.id));
    return Object.values(PLATFORMS)
      .filter(p => !connectedIds.has(p.id))
      .map(p => ({
        id: p.id,
        name: p.displayName,
        letter: p.letter,
        color: p.color,
        description: p.description,
        isRecommended: ['grubhub', 'instacart', 'deliveroo'].includes(p.id),
      }));
  }, [connectedPlatforms]);

  const recommendedPlatforms = availablePlatforms.filter(p => p.isRecommended);
  const otherPlatforms = availablePlatforms.filter(p => !p.isRecommended);

  // Open the platform connect modal using the auth framework
  const handleConnect = (platformId: string) => {
    const provider = PLATFORM_PROVIDERS[platformId];
    if (provider) {
      setConnectModalPlatform(provider);
    } else {
      // Fallback for platforms not in auth framework
      setConnectingPlatform(platformId);
      setConnectingProgress(0);

      const interval = setInterval(() => {
        setConnectingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        addPlatform(platformId as PlatformId);
        setConnectingPlatform(null);
        setConnectingProgress(0);
      }, 2000);
    }
  };

  // Handle platform connected via auth modal
  const handlePlatformConnected = (connection: PlatformConnection) => {
    addPlatform(connection.platformId as PlatformId);
    savePlatformConnection(connection);
    setLastSyncTimestamps(prev => ({ ...prev, [connection.platformId]: new Date().toLocaleString() }));
  };

  // Handle sync
  const handleSync = async (platformId: string) => {
    setSyncingPlatformId(platformId);
    try {
      const result = await syncPlatformData(platformId);
      if (result.success) {
        setLastSyncTimestamps(prev => ({ ...prev, [platformId]: new Date(result.syncedAt).toLocaleString() }));
      }
    } finally {
      setSyncingPlatformId(null);
    }
  };

  // Get providers grouped by status
  const providersByStatus = useMemo(() => getProvidersByStatus(), []);

  const handleDisconnect = (platformId: string) => {
    if (confirmDisconnect !== platformId) {
      setConfirmDisconnect(platformId);
      setTimeout(() => setConfirmDisconnect(null), 3000);
      return;
    }
    setDisconnectingPlatform(platformId);
    setTimeout(() => {
      removePlatform(platformId as PlatformId);
      setDisconnectingPlatform(null);
      setConfirmDisconnect(null);
    }, 300);
  };

  const togglePreferred = (id: string) => {
    updateAutoAcceptRules({
      preferredPlatforms: {
        ...autoAcceptRules.preferredPlatforms,
        [id]: !autoAcceptRules.preferredPlatforms[id],
      },
    });
  };

  const onlineCount = connectedPlatforms.filter(p => p.isOnline).length;
  const totalTodayEarnings = connectedPlatforms.reduce((sum, p) => sum + p.todayEarnings, 0);
  const totalTodayOrders = connectedPlatforms.reduce((sum, p) => sum + p.todayOrders, 0);
  const maxEarnings = Math.max(...connectedPlatforms.map(p => p.todayEarnings), 1);

  // Quick Stats calculations
  const avgRating = useMemo(() => {
    const rated = connectedPlatforms.filter(p => p.rating > 0);
    if (rated.length === 0) return '0.0';
    return (rated.reduce((sum, p) => sum + p.rating, 0) / rated.length).toFixed(1);
  }, [connectedPlatforms]);

  // Platform Performance calculations
  const { bestPlatform, worstPlatform } = useMemo(() => {
    if (connectedPlatforms.length === 0) return { bestPlatform: null, worstPlatform: null };
    const sorted = [...connectedPlatforms].sort((a, b) => b.todayEarnings - a.todayEarnings);
    return {
      bestPlatform: sorted[0],
      worstPlatform: sorted[sorted.length - 1],
    };
  }, [connectedPlatforms]);

  // Shift Scheduler helpers
  const handleExpandShift = useCallback((index: number) => {
    if (expandedShift === index) {
      setExpandedShift(null);
      setEditingShiftIndex(null);
    } else {
      setExpandedShift(index);
      const shift = shifts[index];
      if (shift.active && shift.time !== 'Not scheduled') {
        const parts = shift.time.split(' - ');
        setEditStartTime(parts[0] || '');
        setEditEndTime(parts[1] || '');
      } else {
        setEditStartTime('9:00 AM');
        setEditEndTime('9:00 PM');
      }
    }
  }, [expandedShift, shifts]);

  const handleSaveShiftTime = useCallback((index: number) => {
    const newTime = `${editStartTime} - ${editEndTime}`;
    updateShift(index, { active: true, time: newTime });
    setEditingShiftIndex(null);
  }, [editStartTime, editEndTime, updateShift]);

  const handleCopyToAll = useCallback(() => {
    const firstActiveShift = shifts.find(s => s.active);
    if (!firstActiveShift) return;
    shifts.forEach((shift, index) => {
      if (!shift.active) {
        updateShift(index, { active: true, time: firstActiveShift.time });
      }
    });
  }, [shifts, updateShift]);

  // Parse shift time to get a numeric position for the timeline bar (0-24 hours)
  const parseTimeToHours = (timeStr: string): { start: number; end: number } | null => {
    if (timeStr === 'Not scheduled') return null;
    const parts = timeStr.split(' - ');
    if (parts.length !== 2) return null;
    const parsePart = (p: string): number => {
      const match = p.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 0;
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return hours + minutes / 60;
    };
    return { start: parsePart(parts[0]), end: parsePart(parts[1]) };
  };

  // Platform health score (simulated)
  const getPlatformHealth = (p: typeof connectedPlatforms[0]) => {
    if (!p.isOnline) return { score: 0, label: 'Offline', color: 'text-[#7A7168]', bg: 'bg-[#E8E0D4]' };
    if (p.todayOrders >= 5 && p.rating >= 4.7) return { score: 95, label: 'Excellent', color: 'text-[#2C4A3E]', bg: 'bg-[#2C4A3E]/10' };
    if (p.todayOrders >= 3 && p.rating >= 4.5) return { score: 75, label: 'Good', color: 'text-[#2C4A3E]', bg: 'bg-[#2C4A3E]/10' };
    if (p.todayOrders >= 1) return { score: 50, label: 'Fair', color: 'text-[#8B5E3C]', bg: 'bg-[#8B5E3C]/10' };
    return { score: 25, label: 'Slow', color: 'text-[#7A7168]', bg: 'bg-[#F0EBE4]' };
  };

  // Week day labels for timeline
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDayIndex = new Date().getDay(); // 0=Sun
  const adjustedDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1; // Convert to Mon=0

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#D5CBBF] px-4 py-3">
        <div className="flex items-center justify-between">
          <h1
            className="text-lg font-bold text-[#1B2A4A] tracking-wide"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            Platforms
          </h1>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={setAllPlatformsOnline}
              whileTap={{ scale: 0.95 }}
              className="px-3.5 py-2 bg-[#2C4A3E] text-white rounded-lg text-[11px] font-semibold hover:bg-[#1A6B4A] transition-colors duration-200 shadow-sm flex items-center gap-1.5"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              <Wifi className="w-3 h-3" />
              All Online
            </motion.button>
            <motion.button
              onClick={setAllPlatformsOffline}
              whileTap={{ scale: 0.95 }}
              className="px-3.5 py-2 bg-[#F0EBE4] text-[#7A7168] rounded-lg text-[11px] font-semibold hover:bg-[#E8E0D4] transition-colors duration-200 flex items-center gap-1.5"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              <WifiOff className="w-3 h-3" />
              All Offline
            </motion.button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Platform Status Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-[#D5CBBF]"
          style={{ boxShadow: '0 2px 8px rgba(27, 42, 74, 0.04)' }}
        >
          <h3
            className="text-sm font-semibold text-[#2C2C2C] flex items-center gap-2 mb-3"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            <Shield className="w-4 h-4 text-[#1B2A4A]" />
            Platform Integration Status
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 bg-[#2C4A3E]/5 rounded-lg text-center">
              <p className="text-lg font-bold text-[#2C4A3E]" style={{ fontFamily: 'var(--font-playfair), serif' }}>{providersByStatus.available.length}</p>
              <p className="text-[8px] text-[#7A7168] tracking-wider uppercase font-semibold" style={{ fontFamily: 'var(--font-lora), serif' }}>Available</p>
            </div>
            <div className="p-2.5 bg-[#8B5E3C]/5 rounded-lg text-center">
              <p className="text-lg font-bold text-[#8B5E3C]" style={{ fontFamily: 'var(--font-playfair), serif' }}>{providersByStatus.beta.length}</p>
              <p className="text-[8px] text-[#7A7168] tracking-wider uppercase font-semibold" style={{ fontFamily: 'var(--font-lora), serif' }}>Beta</p>
            </div>
            <div className="p-2.5 bg-[#7A7168]/5 rounded-lg text-center">
              <p className="text-lg font-bold text-[#7A7168]" style={{ fontFamily: 'var(--font-playfair), serif' }}>{providersByStatus.comingSoon.length}</p>
              <p className="text-[8px] text-[#7A7168] tracking-wider uppercase font-semibold" style={{ fontFamily: 'var(--font-lora), serif' }}>Coming Soon</p>
            </div>
          </div>
          {/* Status pills for each provider */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {Object.values(PLATFORM_PROVIDERS).map((provider) => {
              const isConnectedPlatform = connectedPlatforms.some(p => p.id === provider.id);
              return (
                <button
                  key={provider.id}
                  onClick={() => !isConnectedPlatform && handleConnect(provider.id)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-semibold transition-all ${
                    isConnectedPlatform
                      ? 'bg-[#2C4A3E]/10 text-[#2C4A3E]'
                      : provider.status === 'available'
                        ? 'bg-[#2C4A3E]/5 text-[#2C4A3E] hover:bg-[#2C4A3E]/10'
                        : provider.status === 'beta'
                          ? 'bg-[#8B5E3C]/5 text-[#8B5E3C] hover:bg-[#8B5E3C]/10'
                          : 'bg-[#7A7168]/5 text-[#7A7168]'
                  }`}
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: isConnectedPlatform ? '#2C4A3E' : provider.color }}
                  />
                  {provider.displayName}
                  {isConnectedPlatform && <CheckCircle2 className="w-2.5 h-2.5" />}
                </button>
              );
            })}
          </div>
        </motion.div>
        {/* Quick Stats Row - Horizontally scrollable pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Avg. Rating Pill */}
          <div className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 bg-[#FAF7F2] rounded-full border border-[#C9A96E]/30 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-[#C9A96E] fill-[#C9A96E]" />
            </div>
            <div>
              <p
                className="text-[9px] text-[#7A7168] tracking-wider uppercase font-semibold"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Avg. Rating
              </p>
              <p
                className="text-sm font-bold text-[#1B2A4A] leading-tight"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                {avgRating}
              </p>
            </div>
          </div>

          {/* Best Hour Pill */}
          <div className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 bg-[#FAF7F2] rounded-full border border-[#C9A96E]/30 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-[#1B2A4A]" />
            </div>
            <div>
              <p
                className="text-[9px] text-[#7A7168] tracking-wider uppercase font-semibold"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Best Hour
              </p>
              <p
                className="text-sm font-bold text-[#1B2A4A] leading-tight"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                12-2 PM
              </p>
            </div>
          </div>

          {/* Accept Rate Pill */}
          <div className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 bg-[#FAF7F2] rounded-full border border-[#C9A96E]/30 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-[#2C4A3E]/10 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2C4A3E]" />
            </div>
            <div>
              <p
                className="text-[9px] text-[#7A7168] tracking-wider uppercase font-semibold"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Accept Rate
              </p>
              <p
                className="text-sm font-bold text-[#1B2A4A] leading-tight"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                94%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Status Summary Banner - Enhanced with gradient animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#1B2A4A] to-[#2A3F6A] rounded-xl p-4 text-white relative overflow-hidden"
          style={{ boxShadow: '0 4px 20px rgba(27, 42, 74, 0.2)' }}
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 animate-shimmer opacity-30" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#C9A96E]" />
                <span
                  className="text-xs font-semibold text-[#C9A96E] tracking-wider uppercase"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Platform Overview
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2C4A3E] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4ADE80]" />
                </span>
                <span
                  className="text-[10px] font-semibold text-white/80"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {onlineCount}/{connectedPlatforms.length} Online
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  ₹{totalTodayEarnings.toLocaleString()}
                </p>
                <p
                  className="text-[9px] text-white/50 tracking-wider uppercase"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Total Earnings
                </p>
              </div>
              <div>
                <p
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  {totalTodayOrders}
                </p>
                <p
                  className="text-[9px] text-white/50 tracking-wider uppercase"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Total Orders
                </p>
              </div>
              <div>
                <p
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  {connectedPlatforms.length}
                </p>
                <p
                  className="text-[9px] text-white/50 tracking-wider uppercase"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Connected
                </p>
              </div>
            </div>

            {/* Mini platform bar chart - Enhanced with labels */}
            <div className="flex items-end gap-1.5 mt-3 pt-3 border-t border-white/10">
              {connectedPlatforms.map((platform) => {
                const config = PLATFORMS[platform.id];
                const barHeight = Math.max((platform.todayEarnings / maxEarnings) * 40, 4);
                return (
                  <div key={platform.id} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[8px] text-white/60 font-bold tabular-nums">
                      {platform.todayEarnings > 0 ? `₹${platform.todayEarnings}` : '-'}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: barHeight }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="w-full rounded-t-sm"
                      style={{ backgroundColor: platform.isOnline ? (config?.color || '#7A7168') : '#4A5568', minHeight: 4, opacity: platform.isOnline ? 1 : 0.4 }}
                    />
                    <span className="text-[8px] text-white/40 font-bold">{config?.letter || '?'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Connected Platforms - Enhanced Cards with health scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-[#D5CBBF] overflow-hidden card-elegant"
        >
          <div className="p-4 pb-3">
            <h3
              className="text-sm font-semibold text-[#2C2C2C] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              <Link2 className="w-4 h-4 text-[#1B2A4A]" />
              Connected Platforms
              <Badge className="bg-[#2C4A3E]/10 text-[#2C4A3E] border-[#2C4A3E]/15 text-[9px] ml-1">
                {onlineCount}/{connectedPlatforms.length} Online
              </Badge>
            </h3>
          </div>

          <div className="space-y-0">
            {connectedPlatforms.map((platform, index) => {
              const config = PLATFORMS[platform.id];
              const isDisconnecting = disconnectingPlatform === platform.id;
              const earningsPercent = maxEarnings > 0 ? (platform.todayEarnings / maxEarnings) * 100 : 0;
              const health = getPlatformHealth(platform);
              const isExpanded = expandedPlatform === platform.id;
              const isConfirming = confirmDisconnect === platform.id;

              return (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: isDisconnecting ? 0 : 1, x: isDisconnecting ? 40 : 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <div className="px-4 py-3.5 border-t border-[#F0EBE4]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white border border-[#C9A96E]/20"
                            style={{ backgroundColor: config?.color || '#7A7168' }}
                          >
                            {config?.letter || platform.id[0].toUpperCase()}
                          </div>
                          {platform.isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1A6B4A] opacity-75" />
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#2C4A3E] border-2 border-white" />
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p
                              className="text-sm font-semibold text-[#2C2C2C]"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                            >
                              {config?.displayName || platform.id}
                            </p>
                            {/* Health badge */}
                            {platform.isOnline && (
                              <Badge className={`${health.bg} ${health.color} border-0 text-[8px] px-1.5 py-0`}>
                                <Activity className="w-2.5 h-2.5 mr-0.5" />
                                {health.label}
                              </Badge>
                            )}
                          </div>
                          <p
                            className="text-[10px] text-[#7A7168]"
                            style={{ fontFamily: 'var(--font-lora), serif' }}
                          >
                            Last order: {platform.lastOrder}
                            {platform.rating > 0 && (
                              <span className="ml-2 flex items-center gap-0.5 inline-flex">
                                <Star className="w-2.5 h-2.5 text-[#C9A96E] fill-[#C9A96E]" />
                                {platform.rating}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p
                            className="text-sm font-bold text-[#1B2A4A]"
                            style={{ fontFamily: 'var(--font-playfair), serif' }}
                          >
                            ₹{platform.todayEarnings}
                          </p>
                          <p
                            className="text-[9px] text-[#7A7168] tracking-wider uppercase"
                            style={{ fontFamily: 'var(--font-lora), serif' }}
                          >
                            {platform.todayOrders} orders
                          </p>
                        </div>
                        <Switch
                          checked={platform.isOnline}
                          onCheckedChange={() => togglePlatformOnline(platform.id)}
                          className="data-[state=checked]:bg-[#2C4A3E]"
                        />
                        {/* Disconnect button - with confirmation */}
                        <motion.button
                          onClick={() => handleDisconnect(platform.id)}
                          whileTap={{ scale: 0.85 }}
                          className={`p-1 rounded-full transition-all duration-200 ${
                            isConfirming
                              ? 'bg-[#722F37]/10'
                              : 'hover:bg-[#722F37]/5'
                          }`}
                        >
                          {isConfirming ? (
                            <AlertCircle className="w-3.5 h-3.5 text-[#722F37]" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-[#7A7168] hover:text-[#722F37]" />
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Confirm disconnect toast */}
                    <AnimatePresence>
                      {isConfirming && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-2 flex items-center justify-between bg-[#722F37]/5 border border-[#722F37]/15 rounded-lg px-3 py-2"
                        >
                          <p
                            className="text-[10px] text-[#722F37] font-medium"
                            style={{ fontFamily: 'var(--font-lora), serif' }}
                          >
                            Disconnect {config?.displayName}? Tap again to confirm
                          </p>
                          <button
                            onClick={() => setConfirmDisconnect(null)}
                            className="text-[9px] text-[#7A7168] font-semibold ml-2"
                          >
                            Cancel
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Mini earnings bar */}
                    <div className="mt-2.5 ml-14">
                      <div className="w-full bg-[#F0EBE4] rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${earningsPercent}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="h-1.5 rounded-full"
                          style={{ backgroundColor: config?.color || '#7A7168', opacity: platform.isOnline ? 1 : 0.4 }}
                        />
                      </div>
                    </div>
                    {/* Last synced & Sync Now */}
                    <div className="mt-2 ml-14 flex items-center justify-between">
                      <p className="text-[9px] text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                        {lastSyncTimestamps[platform.id]
                          ? `Last synced: ${lastSyncTimestamps[platform.id]}`
                          : 'Not synced yet'}
                      </p>
                      <motion.button
                        onClick={() => handleSync(platform.id)}
                        whileTap={{ scale: 0.95 }}
                        disabled={syncingPlatformId === platform.id}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-semibold bg-[#1B2A4A]/5 text-[#1B2A4A] hover:bg-[#1B2A4A]/10 transition-colors disabled:opacity-50"
                        style={{ fontFamily: 'var(--font-lora), serif' }}
                      >
                        {syncingPlatformId === platform.id ? (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        ) : (
                          <Route className="w-2.5 h-2.5" />
                        )}
                        {syncingPlatformId === platform.id ? 'Syncing...' : 'Sync Now'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Platform Performance Insight */}
        {bestPlatform && worstPlatform && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl border border-[#C9A96E]/25 overflow-hidden card-elegant"
            style={{ boxShadow: '0 2px 12px rgba(201, 169, 110, 0.08)' }}
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#C9A96E]/10 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-[#C9A96E]" />
                </div>
                <h3
                  className="text-sm font-semibold text-[#2C2C2C]"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  Platform Performance
                </h3>
              </div>

              <div className="flex gap-3 mb-3">
                {/* Best Performing */}
                <div className="flex-1 p-3 bg-[#2C4A3E]/5 rounded-lg border border-[#2C4A3E]/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Trophy className="w-3 h-3 text-[#C9A96E]" />
                    <span
                      className="text-[9px] font-semibold text-[#2C4A3E] tracking-wider uppercase"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      Best
                    </span>
                  </div>
                  <p
                    className="text-xs font-semibold text-[#1B2A4A]"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    {PLATFORMS[bestPlatform.id]?.displayName || bestPlatform.id}
                  </p>
                  <p
                    className="text-lg font-bold text-[#2C4A3E]"
                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                  >
                    ₹{bestPlatform.todayEarnings}
                  </p>
                </div>

                {/* Worst Performing */}
                <div className="flex-1 p-3 bg-[#8B5E3C]/5 rounded-lg border border-[#8B5E3C]/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertCircle className="w-3 h-3 text-[#8B5E3C]" />
                    <span
                      className="text-[9px] font-semibold text-[#8B5E3C] tracking-wider uppercase"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      Needs Work
                    </span>
                  </div>
                  <p
                    className="text-xs font-semibold text-[#1B2A4A]"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    {PLATFORMS[worstPlatform.id]?.displayName || worstPlatform.id}
                  </p>
                  <p
                    className="text-lg font-bold text-[#8B5E3C]"
                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                  >
                    ₹{worstPlatform.todayEarnings}
                  </p>
                </div>
              </div>

              {/* Insight Tip */}
              <div className="flex items-start gap-2.5 p-3 bg-[#C9A96E]/5 rounded-lg border border-[#C9A96E]/15">
                <Lightbulb className="w-4 h-4 text-[#C9A96E] flex-shrink-0 mt-0.5" />
                <div>
                  <p
                    className="text-[10px] font-semibold text-[#8B5E3C] tracking-wider uppercase mb-0.5"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    Pro Tip
                  </p>
                  <p
                    className="text-[11px] text-[#1B2A4A] leading-relaxed"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    Switch to Uber Eats during lunch hours for 23% more earnings. Peak demand is between 12-2 PM.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Add New Platform */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-[#D5CBBF] overflow-hidden card-elegant"
        >
          <button
            onClick={() => setShowAddPlatform(!showAddPlatform)}
            className="w-full p-4 flex items-center justify-between"
          >
            <h3
              className="text-sm font-semibold text-[#2C2C2C] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              <Plus className="w-4 h-4 text-[#1B2A4A]" />
              Add New Platform
              {availablePlatforms.length > 0 && (
                <Badge className="bg-[#C9A96E]/10 text-[#8B5E3C] border-[#C9A96E]/20 text-[9px] ml-1">
                  {availablePlatforms.length} available
                </Badge>
              )}
            </h3>
            <ChevronRight
              className={`w-4 h-4 text-[#7A7168] transition-transform ${
                showAddPlatform ? 'rotate-90' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {showAddPlatform && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-4">
                  {/* Recommended for You */}
                  {recommendedPlatforms.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
                        <span
                          className="text-[10px] font-semibold text-[#8B5E3C] tracking-wider uppercase"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          Recommended for You
                        </span>
                      </div>
                      <div className="space-y-2">
                        {recommendedPlatforms.map((platform) => (
                          <div
                            key={platform.id}
                            className="flex items-center justify-between p-3 bg-[#C9A96E]/5 rounded-lg border border-[#C9A96E]/15"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold text-white border border-[#C9A96E]/20"
                                style={{ backgroundColor: platform.color }}
                              >
                                {platform.letter}
                              </div>
                              <div>
                                <p
                                  className="text-sm font-medium text-[#2C2C2C]"
                                  style={{ fontFamily: 'var(--font-lora), serif' }}
                                >
                                  {platform.name}
                                </p>
                                <p
                                  className="text-[10px] text-[#7A7168]"
                                  style={{ fontFamily: 'var(--font-lora), serif' }}
                                >
                                  {platform.description}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleConnect(platform.id)}
                              disabled={connectingPlatform === platform.id}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 bg-[#1B2A4A] text-[#FAF7F2] active:scale-[0.97] disabled:opacity-70 flex items-center gap-1.5"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                            >
                              {connectingPlatform === platform.id ? (
                                <span className="flex items-center gap-1.5">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  {connectingProgress}%
                                </span>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  Connect
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Available Platforms */}
                  {otherPlatforms.length > 0 && (
                    <div>
                      <span
                        className="text-[10px] font-semibold text-[#7A7168] tracking-wider uppercase block mb-2"
                        style={{ fontFamily: 'var(--font-lora), serif' }}
                      >
                        More Platforms
                      </span>
                      <div className="space-y-2">
                        {otherPlatforms.map((platform) => (
                          <div
                            key={platform.id}
                            className="flex items-center justify-between p-3 bg-[#F5F0EB] rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold text-white border border-[#C9A96E]/20"
                                style={{ backgroundColor: platform.color }}
                              >
                                {platform.letter}
                              </div>
                              <div>
                                <p
                                  className="text-sm font-medium text-[#2C2C2C]"
                                  style={{ fontFamily: 'var(--font-lora), serif' }}
                                >
                                  {platform.name}
                                </p>
                                <p
                                  className="text-[10px] text-[#7A7168]"
                                  style={{ fontFamily: 'var(--font-lora), serif' }}
                                >
                                  {platform.description}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleConnect(platform.id)}
                              disabled={connectingPlatform === platform.id}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 bg-[#1B2A4A] text-[#FAF7F2] active:scale-[0.97] disabled:opacity-70 flex items-center gap-1.5"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                            >
                              {connectingPlatform === platform.id ? (
                                <span className="flex items-center gap-1.5">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  {connectingProgress}%
                                </span>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  Connect
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {availablePlatforms.length === 0 && (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 rounded-full bg-[#2C4A3E]/10 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="w-7 h-7 text-[#2C4A3E]" />
                      </div>
                      <p className="text-sm text-[#2C2C2C] font-medium" style={{ fontFamily: 'var(--font-lora), serif' }}>
                        All platforms connected!
                      </p>
                      <p className="text-[10px] text-[#7A7168] mt-1" style={{ fontFamily: 'var(--font-lora), serif' }}>
                        You&apos;re maximizing your earning potential
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Auto-Accept Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-xl border overflow-hidden transition-all duration-300 card-elegant ${
            autoAcceptRules.enabled
              ? 'bg-[#1B2A4A]/[0.03] border-[#1B2A4A]/20'
              : 'bg-white border-[#D5CBBF]'
          }`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-sm font-semibold text-[#2C2C2C] flex items-center gap-2"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                <Zap className={`w-4 h-4 ${autoAcceptRules.enabled ? 'text-[#C9A96E]' : 'text-[#7A7168]'}`} />
                Auto-Accept Rules
                {autoAcceptRules.enabled && (
                  <Badge className="bg-[#2C4A3E]/10 text-[#2C4A3E] border-[#2C4A3E]/15 text-[9px] ml-1">
                    <CircleDot className="w-2 h-2 mr-0.5 fill-[#2C4A3E]" />
                    ACTIVE
                  </Badge>
                )}
              </h3>
              <Switch
                checked={autoAcceptRules.enabled}
                onCheckedChange={(checked) => updateAutoAcceptRules({ enabled: checked })}
                className="data-[state=checked]:bg-[#2C4A3E]"
              />
            </div>

            <AnimatePresence>
              {autoAcceptRules.enabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5 overflow-hidden"
                >
                  {/* Minimum Payout */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        className="text-xs text-[#7A7168] flex items-center gap-1.5"
                        style={{ fontFamily: 'var(--font-lora), serif' }}
                      >
                        <Star className="w-3 h-3" />
                        Minimum Payout
                      </label>
                      <span
                        className="text-sm font-bold text-[#1B2A4A] bg-[#1B2A4A]/5 px-2 py-0.5 rounded"
                        style={{ fontFamily: 'var(--font-playfair), serif' }}
                      >
                        ₹{autoAcceptRules.minPayout}
                      </span>
                    </div>
                    <Slider
                      value={[autoAcceptRules.minPayout]}
                      onValueChange={(v) => updateAutoAcceptRules({ minPayout: v[0] })}
                      max={100}
                      min={10}
                      step={5}
                      className="w-full [&_[role=slider]]:bg-[#1B2A4A] [&_[role=slider]]:border-[#C9A96E] [&_.relative]:bg-[#F0EBE4] [&_[data-orientation=horizontal]>.bg-primary]:bg-[#1B2A4A]"
                    />
                    <div
                      className="flex justify-between text-[9px] text-[#7A7168]"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      <span>₹10</span>
                      <span>₹100</span>
                    </div>
                  </div>

                  {/* Maximum Distance */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        className="text-xs text-[#7A7168] flex items-center gap-1.5"
                        style={{ fontFamily: 'var(--font-lora), serif' }}
                      >
                        <MapPin className="w-3 h-3" />
                        Maximum Distance
                      </label>
                      <span
                        className="text-sm font-bold text-[#1B2A4A] bg-[#1B2A4A]/5 px-2 py-0.5 rounded"
                        style={{ fontFamily: 'var(--font-playfair), serif' }}
                      >
                        {autoAcceptRules.maxDistance} km
                      </span>
                    </div>
                    <Slider
                      value={[autoAcceptRules.maxDistance]}
                      onValueChange={(v) => updateAutoAcceptRules({ maxDistance: v[0] })}
                      max={15}
                      min={1}
                      step={0.5}
                      className="w-full [&_[role=slider]]:bg-[#1B2A4A] [&_[role=slider]]:border-[#C9A96E] [&_.relative]:bg-[#F0EBE4] [&_[data-orientation=horizontal]>.bg-primary]:bg-[#1B2A4A]"
                    />
                    <div
                      className="flex justify-between text-[9px] text-[#7A7168]"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      <span>1 km</span>
                      <span>15 km</span>
                    </div>
                  </div>

                  {/* Preferred Platforms */}
                  <div className="space-y-2">
                    <label
                      className="text-xs text-[#7A7168] flex items-center gap-1.5"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      <Globe className="w-3 h-3" />
                      Preferred Platforms
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {connectedPlatforms.map((p) => {
                        const config = PLATFORMS[p.id];
                        return (
                          <div
                            key={p.id}
                            onClick={() => togglePreferred(p.id)}
                            className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                              autoAcceptRules.preferredPlatforms[p.id]
                                ? 'bg-[#1B2A4A]/8 border border-[#1B2A4A]/20'
                                : 'bg-[#F5F0EB] border border-[#D5CBBF]'
                            }`}
                          >
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                              style={{ backgroundColor: config?.color || '#7A7168' }}
                            >
                              {config?.letter || p.id[0].toUpperCase()}
                            </div>
                            <span
                              className="text-xs text-[#2C2C2C] font-medium"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                            >
                              {config?.displayName || p.id}
                            </span>
                            <Checkbox
                              checked={!!autoAcceptRules.preferredPlatforms[p.id]}
                              onCheckedChange={() => togglePreferred(p.id)}
                              className="ml-auto h-3.5 w-3.5 data-[state=checked]:bg-[#1B2A4A] data-[state=checked]:border-[#1B2A4A]"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Peak Hours Boost */}
                  <div className="flex items-center justify-between p-3 bg-[#F5F0EB] rounded-lg">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#8B5E3C]" />
                      <div>
                        <p
                          className="text-xs font-medium text-[#2C2C2C]"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          Peak Hours Boost
                        </p>
                        <p
                          className="text-[10px] text-[#7A7168]"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          Auto-accept higher pay during peak
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={autoAcceptRules.peakBoost}
                      onCheckedChange={(checked) => updateAutoAcceptRules({ peakBoost: checked })}
                      className="data-[state=checked]:bg-[#8B5E3C]"
                    />
                  </div>

                  {/* Smart Stack */}
                  <div className="flex items-center justify-between p-3 bg-[#F5F0EB] rounded-lg">
                    <div className="flex items-center gap-2">
                      <Route className="w-4 h-4 text-[#1B2A4A]" />
                      <div>
                        <p
                          className="text-xs font-medium text-[#2C2C2C]"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          Smart Stack
                        </p>
                        <p
                          className="text-[10px] text-[#7A7168]"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          Auto-accept orders on same route
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={autoAcceptRules.smartStack}
                      onCheckedChange={(checked) => updateAutoAcceptRules({ smartStack: checked })}
                      className="data-[state=checked]:bg-[#1B2A4A]"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Shift Scheduler - Enhanced with visual timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 border border-[#D5CBBF] card-elegant"
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-sm font-semibold text-[#2C2C2C] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              <Shield className="w-4 h-4 text-[#1B2A4A]" />
              Shift Scheduler
              {shifts.filter(s => s.active).length > 0 && (
                <Badge className="bg-[#2C4A3E]/10 text-[#2C4A3E] border-[#2C4A3E]/15 text-[9px]">
                  {shifts.filter(s => s.active).length} scheduled
                </Badge>
              )}
            </h3>
            {shifts.some(s => s.active) && (
              <motion.button
                onClick={handleCopyToAll}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-[#1B2A4A]/5 text-[#1B2A4A] hover:bg-[#1B2A4A]/10 transition-colors duration-200"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                <Copy className="w-3 h-3" />
                Copy to All
              </motion.button>
            )}
          </div>

          {/* Visual Week Timeline Bar */}
          <div className="mb-4 p-3 bg-[#F5F0EB] rounded-lg">
            <p
              className="text-[9px] text-[#7A7168] font-semibold tracking-wider uppercase mb-2"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Weekly Overview
            </p>
            <div className="flex gap-1">
              {weekDays.map((day, i) => {
                // Map shift data to the week timeline
                const shiftForDay = i < shifts.length ? shifts[i] : null;
                const isActive = shiftForDay?.active ?? false;
                const isToday = i === adjustedDayIndex;
                const timeRange = shiftForDay ? parseTimeToHours(shiftForDay.time) : null;

                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <span
                      className={`text-[8px] font-bold ${isToday ? 'text-[#C9A96E]' : 'text-[#7A7168]'}`}
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      {day}
                    </span>
                    <div className="w-full h-8 rounded-sm bg-[#E8E0D4] relative overflow-hidden">
                      {isActive && timeRange && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                          className="absolute top-0 bottom-0 rounded-sm origin-left"
                          style={{
                            left: `${(timeRange.start / 24) * 100}%`,
                            width: `${((timeRange.end - timeRange.start) / 24) * 100}%`,
                            backgroundColor: isToday ? '#1B2A4A' : '#2C4A3E',
                            opacity: isToday ? 1 : 0.6,
                          }}
                        />
                      )}
                      {isActive && !timeRange && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                          className="absolute top-0 bottom-0 left-[25%] w-[50%] rounded-sm origin-left"
                          style={{
                            backgroundColor: isToday ? '#1B2A4A' : '#2C4A3E',
                            opacity: isToday ? 1 : 0.6,
                          }}
                        />
                      )}
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-[#C9A96E]' : isActive ? 'bg-[#2C4A3E]' : 'bg-[#D5CBBF]'}`} />
                  </div>
                );
              })}
            </div>
            {/* Hour labels */}
            <div className="flex justify-between mt-1.5 px-0.5">
              <span className="text-[7px] text-[#7A7168]/60">6AM</span>
              <span className="text-[7px] text-[#7A7168]/60">12PM</span>
              <span className="text-[7px] text-[#7A7168]/60">6PM</span>
              <span className="text-[7px] text-[#7A7168]/60">12AM</span>
            </div>
          </div>

          <div className="space-y-2">
            {shifts.map((shift, index) => {
              const isExpanded = expandedShift === index;
              const isEditing = editingShiftIndex === index;

              return (
                <div key={shift.day}>
                  <motion.button
                    onClick={() => handleExpandShift(index)}
                    className="w-full flex items-center justify-between p-3 bg-[#F5F0EB] rounded-lg text-left"
                    whileTap={{ scale: 0.995 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${shift.active ? 'bg-[#2C4A3E]' : 'bg-[#D5CBBF]'}`} />
                      <div>
                        <p
                          className="text-sm font-medium text-[#2C2C2C]"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          {shift.day}
                        </p>
                        <p
                          className={`text-[10px] ${shift.active ? 'text-[#2C4A3E]' : 'text-[#7A7168]'}`}
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          {shift.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all duration-200 ${
                          shift.active
                            ? 'bg-[#2C4A3E]/10 text-[#2C4A3E]'
                            : 'bg-[#E8E0D4] text-[#7A7168]'
                        }`}
                        style={{ fontFamily: 'var(--font-lora), serif' }}
                      >
                        {shift.active ? 'Scheduled' : 'Set'}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#7A7168] transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </motion.button>

                  {/* Expanded shift details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 py-3 bg-[#F5F0EB]/50 rounded-b-lg border-t border-[#E8E0D4] space-y-3">
                          {/* Toggle active */}
                          <div className="flex items-center justify-between">
                            <span
                              className="text-[11px] text-[#7A7168] font-medium"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                            >
                              Active Shift
                            </span>
                            <Switch
                              checked={shift.active}
                              onCheckedChange={(checked) => updateShift(index, { active: checked, time: checked ? (shift.time === 'Not scheduled' ? '9:00 AM - 9:00 PM' : shift.time) : 'Not scheduled' })}
                              className="data-[state=checked]:bg-[#2C4A3E]"
                            />
                          </div>

                          {/* Edit time range */}
                          {shift.active && (
                            <div className="space-y-2">
                              <span
                                className="text-[10px] text-[#7A7168] font-semibold tracking-wider uppercase"
                                style={{ fontFamily: 'var(--font-lora), serif' }}
                              >
                                Shift Hours
                              </span>
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editStartTime}
                                    onChange={(e) => setEditStartTime(e.target.value)}
                                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#D5CBBF] bg-white text-xs text-[#1B2A4A] font-medium focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E]/30"
                                    style={{ fontFamily: 'var(--font-lora), serif' }}
                                    placeholder="9:00 AM"
                                  />
                                  <span className="text-[10px] text-[#7A7168]">to</span>
                                  <input
                                    type="text"
                                    value={editEndTime}
                                    onChange={(e) => setEditEndTime(e.target.value)}
                                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#D5CBBF] bg-white text-xs text-[#1B2A4A] font-medium focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E]/30"
                                    style={{ fontFamily: 'var(--font-lora), serif' }}
                                    placeholder="9:00 PM"
                                  />
                                  <motion.button
                                    onClick={() => handleSaveShiftTime(index)}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-[#1B2A4A] text-[#FAF7F2]"
                                    style={{ fontFamily: 'var(--font-lora), serif' }}
                                  >
                                    Save
                                  </motion.button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <span
                                    className="text-xs font-semibold text-[#1B2A4A]"
                                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                                  >
                                    {shift.time}
                                  </span>
                                  <motion.button
                                    onClick={() => setEditingShiftIndex(index)}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#C9A96E]/10 text-[#8B5E3C] hover:bg-[#C9A96E]/20 transition-colors"
                                    style={{ fontFamily: 'var(--font-lora), serif' }}
                                  >
                                    <Timer className="w-3 h-3" />
                                    Edit
                                  </motion.button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Platform Connect Modal */}
      <AnimatePresence>
        {connectModalPlatform && (
          <PlatformConnectModal
            platform={connectModalPlatform}
            onClose={() => setConnectModalPlatform(null)}
            onConnected={handlePlatformConnected}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
