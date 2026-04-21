'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useGigRiderStore, PLATFORMS, type PlatformId } from '@/lib/store';
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

  const handleConnect = (platformId: string) => {
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
  };

  const handleDisconnect = (platformId: string) => {
    setDisconnectingPlatform(platformId);
    setTimeout(() => {
      removePlatform(platformId as PlatformId);
      setDisconnectingPlatform(null);
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
        {/* Status Summary Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#1B2A4A] to-[#2A3F6A] rounded-xl p-4 text-white"
          style={{ boxShadow: '0 4px 20px rgba(27, 42, 74, 0.2)' }}
        >
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

          {/* Mini platform bar chart */}
          <div className="flex items-end gap-1.5 mt-3 pt-3 border-t border-white/10">
            {connectedPlatforms.map((platform) => {
              const config = PLATFORMS[platform.id];
              const barHeight = Math.max((platform.todayEarnings / maxEarnings) * 40, 4);
              return (
                <div key={platform.id} className="flex-1 flex flex-col items-center gap-1">
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
        </motion.div>

        {/* Connected Platforms - Enhanced Cards */}
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

              return (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: isDisconnecting ? 0 : 1, x: isDisconnecting ? 40 : 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="px-4 py-3.5 border-t border-[#F0EBE4]"
                >
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
                        <p
                          className="text-sm font-semibold text-[#2C2C2C]"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          {config?.displayName || platform.id}
                        </p>
                        <p
                          className="text-[10px] text-[#7A7168]"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          Last order: {platform.lastOrder}
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
                      {/* Disconnect button */}
                      <motion.button
                        onClick={() => handleDisconnect(platform.id)}
                        whileTap={{ scale: 0.85 }}
                        className="p-1 rounded-full hover:bg-[#722F37]/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-[#7A7168] hover:text-[#722F37]" />
                      </motion.button>
                    </div>
                  </div>

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
                </motion.div>
              );
            })}
          </div>
        </motion.div>

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
                      <Clock className="w-4 h-4 text-[#8B5E3C]" />
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

        {/* Shift Scheduler */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 border border-[#D5CBBF] card-elegant"
        >
          <h3
            className="text-sm font-semibold text-[#2C2C2C] mb-3 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            <Shield className="w-4 h-4 text-[#1B2A4A]" />
            Shift Scheduler
          </h3>

          <div className="space-y-2">
            {shifts.map((shift, index) => (
              <div
                key={shift.day}
                className="flex items-center justify-between p-3 bg-[#F5F0EB] rounded-lg"
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
                <button
                  onClick={() => updateShift(index, { active: !shift.active })}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all duration-200 ${
                    shift.active
                      ? 'bg-[#2C4A3E]/10 text-[#2C4A3E]'
                      : 'bg-[#E8E0D4] text-[#7A7168]'
                  }`}
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {shift.active ? 'Scheduled' : 'Set'}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
