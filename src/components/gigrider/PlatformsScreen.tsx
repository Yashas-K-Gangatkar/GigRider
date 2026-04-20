'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Link2,
  Unlink,
  Plus,
  Zap,
  Clock,
  MapPin,
  Shield,
  Route,
  ToggleLeft,
  ToggleRight,
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
  { id: 'swiggy', name: 'Swiggy', letter: 'S', color: '#FC8019', isOnline: true, lastOrder: '12 min ago', todayEarnings: 320 },
  { id: 'zomato', name: 'Zomato', letter: 'Z', color: '#E23744', isOnline: true, lastOrder: '25 min ago', todayEarnings: 280 },
  { id: 'ubereats', name: 'Uber Eats', letter: 'U', color: '#06C167', isOnline: false, lastOrder: '2 hrs ago', todayEarnings: 145 },
  { id: 'doordash', name: 'DoorDash', letter: 'D', color: '#FF3008', isOnline: true, lastOrder: '45 min ago', todayEarnings: 100 },
];

const AVAILABLE_PLATFORMS: AvailablePlatform[] = [
  { id: 'grubhub', name: 'Grubhub', letter: 'G', color: '#F06617', description: 'Food delivery across US cities' },
  { id: 'instacart', name: 'Instacart', letter: 'I', color: '#43B02A', description: 'Grocery delivery & pickup' },
  { id: 'postmates', name: 'Postmates', letter: 'P', color: '#FFD614', description: 'On-demand delivery anything' },
  { id: 'deliveroo', name: 'Deliveroo', letter: 'D', color: '#00CCBC', description: 'Premium food delivery in UK & EU' },
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
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#222222] px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">Platforms</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPlatforms((prev) =>
                  prev.map((p) => ({ ...p, isOnline: true }))
                );
              }}
              className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-[11px] font-bold hover:bg-green-500/30 transition-colors"
            >
              All Online
            </button>
            <button
              onClick={() => {
                setPlatforms((prev) =>
                  prev.map((p) => ({ ...p, isOnline: false }))
                );
              }}
              className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg text-[11px] font-bold hover:bg-zinc-700 transition-colors"
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
          className="bg-[#141414] rounded-xl border border-[#222222] overflow-hidden"
        >
          <div className="p-4 pb-3">
            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-green-400" />
              Connected Platforms
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[9px] ml-1">
                {onlineCount}/{platforms.length} Online
              </Badge>
            </h3>
          </div>

          <div className="space-y-0">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex items-center justify-between px-4 py-3 border-t border-[#1E1E1E]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: platform.color }}
                    >
                      {platform.letter}
                    </div>
                    {platform.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-[#141414]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{platform.name}</p>
                    <p className="text-[10px] text-zinc-500">
                      Last order: {platform.lastOrder}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">₹{platform.todayEarnings}</p>
                    <p className="text-[9px] text-zinc-600">today</p>
                  </div>
                  <Switch
                    checked={platform.isOnline}
                    onCheckedChange={() => togglePlatformOnline(platform.id)}
                    className="data-[state=checked]:bg-green-500"
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
          className="bg-[#141414] rounded-xl border border-[#222222] overflow-hidden"
        >
          <button
            onClick={() => setShowAddPlatform(!showAddPlatform)}
            className="w-full p-4 flex items-center justify-between"
          >
            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-400" />
              Add New Platform
            </h3>
            <ChevronRight
              className={`w-4 h-4 text-zinc-500 transition-transform ${
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
                      className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                          style={{ backgroundColor: platform.color }}
                        >
                          {platform.letter}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{platform.name}</p>
                          <p className="text-[10px] text-zinc-500">{platform.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleConnect(platform.id)}
                        disabled={connectingPlatform === platform.id}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                          connectingPlatform === platform.id
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-green-500 text-white active:scale-95'
                        }`}
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
          className={`rounded-xl border overflow-hidden transition-all ${
            autoAcceptEnabled
              ? 'bg-green-500/5 border-green-500/30'
              : 'bg-[#141414] border-[#222222]'
          }`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <Zap className={`w-4 h-4 ${autoAcceptEnabled ? 'text-green-400' : 'text-zinc-500'}`} />
                Auto-Accept Rules
                {autoAcceptEnabled && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[9px] ml-1">
                    ACTIVE
                  </Badge>
                )}
              </h3>
              <Switch
                checked={autoAcceptEnabled}
                onCheckedChange={setAutoAcceptEnabled}
                className="data-[state=checked]:bg-green-500"
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
                      <label className="text-xs text-zinc-400 flex items-center gap-1.5">
                        <Star className="w-3 h-3" />
                        Minimum Payout
                      </label>
                      <span className="text-sm font-bold text-green-400">₹{minPayout[0]}</span>
                    </div>
                    <Slider
                      value={minPayout}
                      onValueChange={setMinPayout}
                      max={100}
                      min={10}
                      step={5}
                      className="w-full [&_[role=slider]]:bg-green-500 [&_[role=slider]]:border-green-400 [&_.relative]:bg-zinc-800 [&_[data-orientation=horizontal]>.bg-primary]:bg-green-500"
                    />
                    <div className="flex justify-between text-[9px] text-zinc-600">
                      <span>₹10</span>
                      <span>₹100</span>
                    </div>
                  </div>

                  {/* Maximum Distance */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-zinc-400 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        Maximum Distance
                      </label>
                      <span className="text-sm font-bold text-green-400">{maxDistance[0]} km</span>
                    </div>
                    <Slider
                      value={maxDistance}
                      onValueChange={setMaxDistance}
                      max={15}
                      min={1}
                      step={0.5}
                      className="w-full [&_[role=slider]]:bg-green-500 [&_[role=slider]]:border-green-400 [&_.relative]:bg-zinc-800 [&_[data-orientation=horizontal]>.bg-primary]:bg-green-500"
                    />
                    <div className="flex justify-between text-[9px] text-zinc-600">
                      <span>1 km</span>
                      <span>15 km</span>
                    </div>
                  </div>

                  {/* Preferred Platforms */}
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <Globe className="w-3 h-3" />
                      Preferred Platforms
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {platforms.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => togglePreferred(p.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all ${
                            preferredPlatforms[p.id]
                              ? 'bg-green-500/15 border border-green-500/30'
                              : 'bg-[#1E1E1E] border border-[#222222]'
                          }`}
                        >
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ backgroundColor: p.color }}
                          >
                            {p.letter}
                          </div>
                          <span className="text-xs text-white font-medium">{p.name}</span>
                          <Checkbox
                            checked={preferredPlatforms[p.id]}
                            onCheckedChange={() => togglePreferred(p.id)}
                            className="ml-auto h-3.5 w-3.5 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Peak Hours Boost */}
                  <div className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="text-xs font-medium text-white">Peak Hours Boost</p>
                        <p className="text-[10px] text-zinc-500">Auto-accept higher pay during peak</p>
                      </div>
                    </div>
                    <Switch
                      checked={peakBoost}
                      onCheckedChange={setPeakBoost}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>

                  {/* Smart Stack */}
                  <div className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg">
                    <div className="flex items-center gap-2">
                      <Route className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs font-medium text-white">Smart Stack</p>
                        <p className="text-[10px] text-zinc-500">Auto-accept orders on same route</p>
                      </div>
                    </div>
                    <Switch
                      checked={smartStack}
                      onCheckedChange={setSmartStack}
                      className="data-[state=checked]:bg-blue-500"
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
          className="bg-[#141414] rounded-xl p-4 border border-[#222222]"
        >
          <h3 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
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
                className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-white">{shift.day}</p>
                  <p className={`text-[10px] ${shift.active ? 'text-green-400' : 'text-zinc-600'}`}>
                    {shift.time}
                  </p>
                </div>
                <button
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    shift.active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-zinc-700 text-zinc-400'
                  }`}
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
