'use client';

import { motion } from 'framer-motion';
import {
  Trophy,
  Flame,
  Star,
  Target,
  Zap,
  ChevronRight,
  Crown,
  TrendingUp,
  Gift,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface RewardsScreenProps {
  onNavigate: (screen: string) => void;
}

const achievements = [
  { id: 1, name: 'First Order', icon: '🎯', unlocked: true, description: 'Place your first order on Delivro' },
  { id: 2, name: 'Speed Comparer', icon: '⚡', unlocked: true, description: 'Compare 5 orders in under 30 seconds' },
  { id: 3, name: 'Savings Master', icon: '💰', unlocked: true, description: 'Save ₹500 total through comparisons' },
  { id: 4, name: '5-Day Streak', icon: '🔥', unlocked: true, description: 'Maintain a 5-day ordering streak' },
  { id: 5, name: 'Category Explorer', icon: '🌍', unlocked: true, description: 'Order from 4 different categories' },
  { id: 6, name: 'Price Hawk', icon: '🦅', unlocked: false, description: 'Find the cheapest option 10 times' },
  { id: 7, name: 'Night Owl', icon: '🦉', unlocked: false, description: 'Order between 12am-5am' },
  { id: 8, name: 'Early Bird', icon: '🐦', unlocked: false, description: 'Order before 7am for 5 days' },
];

const dailyChallenges = [
  { id: 1, title: 'Order from 2 different platforms', current: 1, target: 2, points: 50, unit: 'platforms' },
  { id: 2, title: 'Save ₹100 through comparison', current: 67, target: 100, points: 75, unit: '₹', isCurrency: true },
  { id: 3, title: 'Try a new category', current: 1, target: 1, points: 30, unit: '', complete: true },
];

const leaderboard = [
  { rank: 1, name: 'Priya S.', points: 8920, avatar: '👩‍💼' },
  { rank: 2, name: 'Rahul K.', points: 8450, avatar: '👨‍💻' },
  { rank: 3, name: 'Anita M.', points: 7890, avatar: '👩‍🎨' },
];

const streakDays = [
  { day: 'Mon', completed: true },
  { day: 'Tue', completed: true },
  { day: 'Wed', completed: true },
  { day: 'Thu', completed: true },
  { day: 'Fri', completed: true },
  { day: 'Sat', completed: true },
  { day: 'Sun', completed: true },
];

export default function RewardsScreen({ onNavigate: _onNavigate }: RewardsScreenProps) {
  const [displayPoints, setDisplayPoints] = useState(0);
  const targetPoints = 2450;
  const [spinning, setSpinning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = targetPoints / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetPoints) {
        setDisplayPoints(targetPoints);
        clearInterval(timer);
      } else {
        setDisplayPoints(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      showToast('🎉 You won 50 bonus points!');
    }, 2000);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Toast */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-4 right-4 z-50 bg-[#242424] border border-orange-500/30 rounded-2xl px-4 py-3 text-center text-sm text-orange-400 font-medium shadow-lg shadow-orange-500/10"
        >
          {toastMessage}
        </motion.div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0F0F0F]/90 backdrop-blur-xl px-4 pt-4 pb-3">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-orange-500" />
          Rewards Hub
        </h1>
      </div>

      {/* Level & Points Card */}
      <div className="px-4 mt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-orange-600/20 via-amber-600/10 to-orange-600/20 border border-orange-500/20 p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-bold text-amber-400">Level 12</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">Delivery Pro</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Flame className="w-5 h-5 text-orange-500 animate-fire-pulse" />
                <span className="text-2xl font-black text-white">{displayPoints.toLocaleString()}</span>
              </div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">points</span>
            </div>
          </div>
          {/* XP Progress Bar */}
          <div className="h-2 w-full rounded-full bg-[#1A1A1A] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '72%' }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-500"
            />
          </div>
          <p className="text-[10px] text-zinc-500 mt-1.5">2,450 / 3,400 XP to Level 13</p>
        </motion.div>
      </div>

      {/* Daily Streak */}
      <div className="px-4 mt-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500 animate-fire-pulse" />
              7 Day Streak!
            </h3>
            <span className="text-xs text-orange-400 font-medium">🔥 Keep it going!</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            {streakDays.map((day) => (
              <div key={day.day} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    day.completed
                      ? 'bg-gradient-to-br from-orange-500 to-amber-500'
                      : 'bg-[#242424] border border-[#2A2A2A]'
                  }`}
                >
                  {day.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-zinc-600" />
                  )}
                </div>
                <span className={`text-[10px] ${day.completed ? 'text-orange-400' : 'text-zinc-500'}`}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Daily Challenges */}
      <div className="px-4 mt-5">
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-orange-500" />
          Daily Challenges
        </h2>
        <div className="space-y-2">
          {dailyChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl p-3 border ${
                challenge.complete
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-[#1A1A1A] border-[#2A2A2A]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${challenge.complete ? 'text-green-400' : 'text-white'}`}>
                  {challenge.title}
                </span>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span className="text-xs text-amber-400 font-bold">+{challenge.points}</span>
                </div>
              </div>
              {challenge.complete ? (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">Complete!</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-zinc-500">
                      {challenge.isCurrency
                        ? `₹${challenge.current} / ₹${challenge.target}`
                        : `${challenge.current} / ${challenge.target} ${challenge.unit}`}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {Math.round((challenge.current / challenge.target) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#242424] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(challenge.current / challenge.target) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-500"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="px-4 mt-5">
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-orange-500" />
          Achievements
        </h2>
        <div className="grid grid-cols-4 gap-2.5">
          {achievements.map((badge, index) => (
            <motion.button
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.06 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (badge.unlocked) {
                  showToast(`${badge.icon} ${badge.name}: ${badge.description}`);
                } else {
                  showToast(`🔒 ${badge.name} - Keep going to unlock!`);
                }
              }}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border ${
                badge.unlocked
                  ? 'bg-[#1A1A1A] border-[#2A2A2A]'
                  : 'bg-[#141414] border-[#1E1E1E]'
              }`}
            >
              <span className={`text-2xl ${badge.unlocked ? '' : 'grayscale opacity-30'}`}>
                {badge.unlocked ? badge.icon : '🔒'}
              </span>
              <span
                className={`text-[9px] font-medium leading-tight text-center ${
                  badge.unlocked ? 'text-zinc-300' : 'text-zinc-600'
                }`}
              >
                {badge.name}
              </span>
              {badge.unlocked && (
                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              )}
              {!badge.unlocked && (
                <Lock className="w-2.5 h-2.5 text-zinc-600" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Spin & Win */}
      <div className="px-4 mt-5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSpin}
          className="w-full rounded-2xl overflow-hidden border border-amber-500/20"
        >
          <div className="bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-amber-600/20 animate-gradient-shift p-4 flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 ${
                spinning ? 'animate-spin-wheel' : ''
              }`}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-white text-sm">Spin & Win</h3>
              <p className="text-xs text-amber-300/80 mt-0.5">1 free spin available!</p>
              <div className="flex items-center gap-1 mt-1">
                <Gift className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] text-amber-400">Win up to 500 bonus points</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-400" />
          </div>
        </motion.button>
      </div>

      {/* Leaderboard Preview */}
      <div className="px-4 mt-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            Leaderboard
          </h2>
          <button className="text-xs text-orange-500 font-medium">View All</button>
        </div>
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden">
          {leaderboard.map((user, index) => (
            <motion.div
              key={user.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 ${
                index < leaderboard.length - 1 ? 'border-b border-[#2A2A2A]' : ''
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                user.rank === 1
                  ? 'bg-amber-500/20 text-amber-400'
                  : user.rank === 2
                  ? 'bg-zinc-400/20 text-zinc-300'
                  : 'bg-orange-800/20 text-orange-400'
              }`}>
                {user.rank}
              </div>
              <span className="text-xl">{user.avatar}</span>
              <div className="flex-1">
                <span className="text-sm font-medium text-white">{user.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-sm font-bold text-orange-400">{user.points.toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
          {/* Your rank */}
          <div className="flex items-center gap-3 p-3 bg-orange-500/5 border-t border-orange-500/10">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-orange-500/20 text-orange-400">
              47
            </div>
            <span className="text-xl">🙋</span>
            <div className="flex-1">
              <span className="text-sm font-medium text-white">You</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-sm font-bold text-orange-400">2,450</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
