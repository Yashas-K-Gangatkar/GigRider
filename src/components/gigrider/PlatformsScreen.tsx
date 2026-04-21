'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
} from 'lucide-react';

interface ConnectedPlatform {
  id: string;
  name: string;
  letter: string;
  color: string;
  isOnline: boolean;
  lastOrder: string;
  todayEarnings: number;
}

interface AvailablePlatform {
  id: string;
  name: string;
  letter: string;
  color: string;
  description: string;
}

const CONNECTED_PLATFORMS: ConnectedPlatform[] = [
  { id: 'swiggy', name: 'Food Delivery S', letter: 'S', color: '#B87333', isOnline: true, lastOrder: '12 min ago', todayEarnings: 320 },
  { id: 'zomato', name: 'Food Delivery Z', letter: 'Z', color: '#943540', isOnline: true, lastOrder: '25 min ago', todayEarnings: 280 },
  { id: 'ubereats', name: 'Meal Delivery U', letter: 'U', color: '#2C7A5F', isOnline: false, lastOrder: '2 hrs ago', todayEarnings: 145 },
  { id: 'doordash', name: 'Delivery D', letter: 'D', color: '#A84020', isOnline: true, lastOrder: '45 min ago', todayEarnings: 100 },
];

const AVAILABLE_PLATFORMS: AvailablePlatform[] = [
  { id: 'grubhub', name: 'Food Delivery G', letter: 'G', color: '#9E6B2F', description: 'Food delivery across US cities' },
  { id: 'instacart', name: 'Grocery Delivery I', letter: 'I', color: '#3A7A3A', description: 'Grocery delivery & pickup' },
  { id: 'postmates', name: 'On-Demand P', letter: 'P', color: '#8A8A3A', description: 'On-demand delivery anything' },
  { id: 'deliveroo', name: 'Premium Delivery R', letter: 'R', color: '#2A8A8A', description: 'Premium food delivery in UK & EU' },
];

export default function PlatformsScreen() {
  const [platforms, setPlatforms] = useState(CONNECTED_PLATFORMS);
  const [autoAcceptEnabled, setAutoAcceptEnabled] = useState(false);
  const [minPayout, setMinPayout] = useState([35]);
  const [maxDistance, setMaxDistance] = useState([5]);
  const [preferredPlatforms, setPreferredPlatforms] = useState<Record<string, boolean>>({
    swiggy: true,
    zomato: true,
    ubereats: false,
    doordash: true,
  });
  const [peakBoost, setPeakBoost] = useState(true);
  const [smartStack, setSmartStack] = useState(false);
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  const togglePlatformOnline = (id: string) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isOnline: !p.isOnline } : p))
    );
  };

  const handleConnect = (platformId: string) => {
    setConnectingPlatform(platformId);
    setTimeout(() => {
      setConnectingPlatform(null);
    }, 2000);
  };

  const togglePreferred = (id: string) => {
    setPreferredPlatforms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onlineCount = platforms.filter((p) => p.isOnline).length;

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
            <button
              onClick={() => {
                setPlatforms((prev) =>
                  prev.map((p) => ({ ...p, isOnline: true }))
                );
              }}
              className="px-3 py-1.5 bg-[#2C4A3E]/10 text-[#2C4A3E] rounded-lg text-[11px] font-semibold hover:bg-[#2C4A3E]/15 transition-colors duration-200"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              All Online
            </button>
            <button
              onClick={() => {
                setPlatforms((prev) =>
                  prev.map((p) => ({ ...p, isOnline: false }))
                );
              }}
              className="px-3 py-1.5 bg-[#F0EBE4] text-[#7A7168] rounded-lg text-[11px] font-semibold hover:bg-[#E8E0D4] transition-colors duration-200"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              All Offline
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Connected Platforms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
                {onlineCount}/{platforms.length} Online
              </Badge>
            </h3>
          </div>

          <div className="space-y-0">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex items-center justify-between px-4 py-3 border-t border-[#F0EBE4]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white border border-[#C9A96E]/20"
                      style={{ backgroundColor: platform.color }}
                    >
                      {platform.letter}
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
                      {platform.name}
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
                </div>
              </motion.div>
            ))}
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
                <div className="px-4 pb-4 space-y-2">
                  {AVAILABLE_PLATFORMS.map((platform) => (
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
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                          connectingPlatform === platform.id
                            ? 'bg-[#1B2A4A]/10 text-[#1B2A4A]'
                            : 'bg-[#1B2A4A] text-[#FAF7F2] active:scale-[0.97]'
                        }`}
                        style={{ fontFamily: 'var(--font-lora), serif' }}
                      >
                        {connectingPlatform === platform.id ? 'Connecting...' : 'Connect'}
                      </button>
                    </div>
                  ))}
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
            autoAcceptEnabled
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
                <Zap className={`w-4 h-4 ${autoAcceptEnabled ? 'text-[#1B2A4A]' : 'text-[#7A7168]'}`} />
                Auto-Accept Rules
                {autoAcceptEnabled && (
                  <Badge className="bg-[#2C4A3E]/10 text-[#2C4A3E] border-[#2C4A3E]/15 text-[9px] ml-1">
                    ACTIVE
                  </Badge>
                )}
              </h3>
              <Switch
                checked={autoAcceptEnabled}
                onCheckedChange={setAutoAcceptEnabled}
                className="data-[state=checked]:bg-[#2C4A3E]"
              />
            </div>

            <AnimatePresence>
              {autoAcceptEnabled && (
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
                        ₹{minPayout[0]}
                      </span>
                    </div>
                    <Slider
                      value={minPayout}
                      onValueChange={setMinPayout}
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
                        {maxDistance[0]} km
                      </span>
                    </div>
                    <Slider
                      value={maxDistance}
                      onValueChange={setMaxDistance}
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
                      {platforms.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => togglePreferred(p.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                            preferredPlatforms[p.id]
                              ? 'bg-[#1B2A4A]/8 border border-[#1B2A4A]/20'
                              : 'bg-[#F5F0EB] border border-[#D5CBBF]'
                          }`}
                        >
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ backgroundColor: p.color }}
                          >
                            {p.letter}
                          </div>
                          <span
                            className="text-xs text-[#2C2C2C] font-medium"
                            style={{ fontFamily: 'var(--font-lora), serif' }}
                          >
                            {p.name}
                          </span>
                          <Checkbox
                            checked={preferredPlatforms[p.id]}
                            onCheckedChange={() => togglePreferred(p.id)}
                            className="ml-auto h-3.5 w-3.5 data-[state=checked]:bg-[#1B2A4A] data-[state=checked]:border-[#1B2A4A]"
                          />
                        </div>
                      ))}
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
                      checked={peakBoost}
                      onCheckedChange={setPeakBoost}
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
                      checked={smartStack}
                      onCheckedChange={setSmartStack}
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
            {[
              { day: 'Today', time: '10:00 AM - 10:00 PM', active: true },
              { day: 'Tomorrow', time: '9:00 AM - 9:00 PM', active: true },
              { day: 'Wednesday', time: 'Not scheduled', active: false },
              { day: 'Thursday', time: 'Not scheduled', active: false },
            ].map((shift) => (
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
