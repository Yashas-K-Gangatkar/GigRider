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
    
    // Animate progress
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
              className="px-3.5 py-2 bg-[#2C4A3E] text-white rounded-lg text-[11px] font-semibold hover:bg-[#1A6B4A] transition-colors duration-200 shadow-sm"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              All Online
            </motion.button>
            <motion.button
              onClick={setAllPlatformsOffline}
              whileTap={{ scale: 0.95 }}
              className="px-3.5 py-2 bg-[#F0EBE4] text-[#7A7168] rounded-lg text-[11px] font-semibold hover:bg-[#E8E0D4] transition-colors duration-200"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              All Offline
            </motion.button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Platform Performance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          {connectedPlatforms.map((platform, index) => {
            const config = PLATFORMS[platform.id];
            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.06 }}
                className="bg-white rounded-xl p-3 border border-[#D5CBBF] card-elegant"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-[#C9A96E]/20"
                    style={{ backgroundColor: config?.color || '#7A7168' }}
                  >
                    {config?.letter || platform.id[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#2C2C2C] truncate" style={{ fontFamily: 'var(--font-lora), serif' }}>
                      {config?.displayName || platform.id}
                    </p>
                    <p className="text-[9px] text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                      {platform.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#1B2A4A]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                      ₹{platform.todayEarnings}
                    </p>
                    <p className="text-[8px] text-[#7A7168] tracking-wider uppercase" style={{ fontFamily: 'var(--font-lora), serif' }}>
                      Today
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#2C2C2C]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                      {platform.todayOrders}
                    </p>
                    <p className="text-[8px] text-[#7A7168] tracking-wider uppercase" style={{ fontFamily: 'var(--font-lora), serif' }}>
                      Orders
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Connected Platforms */}
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
              return (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: isDisconnecting ? 0 : 1, x: isDisconnecting ? 40 : 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-center justify-between px-4 py-3 border-t border-[#F0EBE4]"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white border border-[#C9A96E]/20"
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
                        today
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
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white border border-[#C9A96E]/20"
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
                              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 bg-[#1B2A4A] text-[#FAF7F2] active:scale-[0.97] disabled:opacity-70"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                            >
                              {connectingPlatform === platform.id ? (
                                <span className="flex items-center gap-1.5">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  {connectingProgress}%
                                </span>
                              ) : 'Connect'}
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
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white border border-[#C9A96E]/20"
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
                              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 bg-[#1B2A4A] text-[#FAF7F2] active:scale-[0.97] disabled:opacity-70"
                              style={{ fontFamily: 'var(--font-lora), serif' }}
                            >
                              {connectingPlatform === platform.id ? (
                                <span className="flex items-center gap-1.5">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  {connectingProgress}%
                                </span>
                              ) : 'Connect'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {availablePlatforms.length === 0 && (
                    <p className="text-sm text-[#7A7168] text-center py-4" style={{ fontFamily: 'var(--font-lora), serif' }}>
                      All platforms connected!
                    </p>
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
                <Zap className={`w-4 h-4 ${autoAcceptRules.enabled ? 'text-[#1B2A4A]' : 'text-[#7A7168]'}`} />
                Auto-Accept Rules
                {autoAcceptRules.enabled && (
                  <Badge className="bg-[#2C4A3E]/10 text-[#2C4A3E] border-[#2C4A3E]/15 text-[9px] ml-1">
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
                        className="text-sm font-bold text-[#1B2A4A]"
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
                        className="text-sm font-bold text-[#1B2A4A]"
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
                <button
                  onClick={() => updateShift(index, { active: !shift.active })}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold ${
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
