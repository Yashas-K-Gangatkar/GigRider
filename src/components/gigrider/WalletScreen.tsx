'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGigRiderStore, type Transaction } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Banknote,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Gift,
  Star,
  Zap,
  Users,
  CreditCard,
  Building2,
  Smartphone,
  Shield,
  TrendingUp,
  X,
  Info,
} from 'lucide-react';

// Animated counter component
function AnimatedCounter({
  target,
  prefix = '₹',
  duration = 1200,
}: {
  target: number;
  prefix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return (
    <span style={{ fontFamily: 'var(--font-playfair), serif' }}>
      {prefix}
      {count.toLocaleString()}
    </span>
  );
}

// Transaction type icon mapping
function getTransactionIcon(type: Transaction['type']) {
  switch (type) {
    case 'delivery':
      return { icon: Banknote, color: '#2C4A3E', bg: '#2C4A3E/10' };
    case 'tip':
      return { icon: Gift, color: '#C9A96E', bg: '#C9A96E/10' };
    case 'bonus':
      return { icon: Zap, color: '#8B5E3C', bg: '#8B5E3C/10' };
    case 'incentive':
      return { icon: Star, color: '#C9A96E', bg: '#C9A96E/10' };
    case 'referral':
      return { icon: Users, color: '#1B2A4A', bg: '#1B2A4A/10' };
    case 'withdrawal':
      return { icon: ArrowUpRight, color: '#722F37', bg: '#722F37/10' };
    case 'payout':
      return { icon: CreditCard, color: '#722F37', bg: '#722F37/10' };
    default:
      return { icon: Banknote, color: '#7A7168', bg: '#7A7168/10' };
  }
}

// Format relative time
function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

// Status badge component
function StatusBadge({ status, holdDaysRemaining }: { status: Transaction['status']; holdDaysRemaining?: number }) {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold text-[#2C4A3E] bg-[#2C4A3E]/10 px-1.5 py-0.5 rounded-full">
          <CheckCircle2 className="w-2.5 h-2.5" />
          Completed
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold text-[#8B5E3C] bg-[#8B5E3C]/10 px-1.5 py-0.5 rounded-full">
          <Clock className="w-2.5 h-2.5" />
          Pending
        </span>
      );
    case 'on_hold':
      return (
        <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold text-[#1B2A4A] bg-[#1B2A4A]/10 px-1.5 py-0.5 rounded-full">
          <Shield className="w-2.5 h-2.5" />
          {holdDaysRemaining ? `${holdDaysRemaining}d hold` : 'On Hold'}
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold text-[#722F37] bg-[#722F37]/10 px-1.5 py-0.5 rounded-full">
          <AlertCircle className="w-2.5 h-2.5" />
          Failed
        </span>
      );
  }
}

type FilterTab = 'all' | 'income' | 'withdrawals' | 'pending' | 'on_hold';

export default function WalletScreen({
  onBack,
}: {
  onBack?: () => void;
}) {
  const wallet = useGigRiderStore((s) => s.wallet);
  const todayEarnings = useGigRiderStore((s) => s.todayEarnings);
  const weekEarnings = useGigRiderStore((s) => s.weekEarnings);
  const monthEarnings = useGigRiderStore((s) => s.monthEarnings);
  const todayOrders = useGigRiderStore((s) => s.todayOrders);
  const updateWallet = useGigRiderStore((s) => s.updateWallet);
  const addTransaction = useGigRiderStore((s) => s.addTransaction);
  const deliveryHistory = useGigRiderStore((s) => s.deliveryHistory);

  const { toast } = useToast();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'upi'>('bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmWithdraw, setShowConfirmWithdraw] = useState(false);

  // Computed values
  const payoutBalance = useMemo(
    () => Math.round(todayEarnings * 0.7),
    [todayEarnings]
  );
  const pendingSettlement = useMemo(
    () => Math.round(todayEarnings * 0.3),
    [todayEarnings]
  );
  const avgPerDelivery = useMemo(
    () => (todayOrders > 0 ? Math.round(todayEarnings / todayOrders) : 0),
    [todayEarnings, todayOrders]
  );

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    const txs = wallet.transactions;
    switch (activeFilter) {
      case 'income':
        return txs.filter(
          (t) =>
            t.type !== 'withdrawal' &&
            t.type !== 'payout' &&
            t.amount > 0
        );
      case 'withdrawals':
        return txs.filter(
          (t) => t.type === 'withdrawal' || t.type === 'payout'
        );
      case 'pending':
        return txs.filter((t) => t.status === 'pending');
      case 'on_hold':
        return txs.filter((t) => t.status === 'on_hold');
      default:
        return txs;
    }
  }, [wallet.transactions, activeFilter]);

  // Payout history (past payouts from transactions)
  const payoutHistory = useMemo(() => {
    return wallet.transactions.filter((t) => t.type === 'payout');
  }, [wallet.transactions]);

  // Monthly summary
  const monthlySummary = useMemo(() => {
    const now = new Date();
    const thisMonth = wallet.transactions.filter((t) => {
      const txDate = new Date(t.timestamp);
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear() &&
        t.amount > 0
      );
    });
    const totalIncome = thisMonth.reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = wallet.transactions
      .filter((t) => {
        const txDate = new Date(t.timestamp);
        return (
          txDate.getMonth() === now.getMonth() &&
          txDate.getFullYear() === now.getFullYear() &&
          (t.type === 'withdrawal' || t.type === 'payout')
        );
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { totalIncome, totalWithdrawals, net: totalIncome - totalWithdrawals };
  }, [wallet.transactions]);

  // Handle withdraw
  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid withdrawal amount.',
        variant: 'destructive',
      });
      return;
    }
    if (amount > wallet.balance) {
      toast({
        title: 'Insufficient balance',
        description: `Your available balance is ₹${wallet.balance.toLocaleString()}.`,
        variant: 'destructive',
      });
      return;
    }
    if (amount < 100) {
      toast({
        title: 'Minimum amount',
        description: 'Minimum withdrawal amount is ₹100.',
        variant: 'destructive',
      });
      return;
    }
    setShowConfirmWithdraw(true);
  };

  const confirmWithdraw = async () => {
    setIsProcessing(true);
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const amount = parseInt(withdrawAmount);
    addTransaction({
      type: 'withdrawal',
      amount: -amount,
      description: `Withdrawal to ${withdrawMethod === 'bank' ? wallet.bankAccount : wallet.upiId}`,
      platform: 'GigRider',
      status: 'pending',
      timestamp: Date.now(),
    });

    setIsProcessing(false);
    setShowConfirmWithdraw(false);
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    toast({
      title: 'Withdrawal initiated',
      description: `₹${amount.toLocaleString()} will be transferred to your ${withdrawMethod === 'bank' ? 'bank account' : 'UPI ID'} in 1-2 business days.`,
    });
  };

  // Handle add money
  const handleAddMoney = () => {
    const amount = parseInt(addMoneyAmount);
    if (!amount || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Coming soon!',
      description: 'UPI integration is in progress. This feature will be available soon.',
    });
    setShowAddMoneyModal(false);
    setAddMoneyAmount('');
  };

  // Format last payout date
  const lastPayoutFormatted = wallet.lastPayoutDate
    ? new Date(wallet.lastPayoutDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#D5CBBF] px-4 py-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <motion.button
              onClick={onBack}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 -ml-1 rounded-lg hover:bg-[#F0EBE4] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
            </motion.button>
          )}
          <div className="flex-1">
            <h1
              className="text-lg font-bold text-[#1B2A4A] tracking-wide"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              My Wallet
            </h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2C4A3E]/10 rounded-full">
            <Shield className="w-3.5 h-3.5 text-[#2C4A3E]" />
            <span
              className="text-[10px] font-semibold text-[#2C4A3E] tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Secured
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-xl"
          style={{
            background:
              'linear-gradient(135deg, #1B2A4A 0%, #2A3F6A 50%, #1B2A4A 100%)',
            boxShadow:
              '0 8px 32px rgba(27, 42, 74, 0.25), 0 0 0 1px rgba(201, 169, 110, 0.15)',
          }}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#C9A96E]/5 -mr-8 -mt-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-[#C9A96E]/5 -ml-6 -mb-6" />

          <div className="relative z-10 p-5">
            {/* Total Balance */}
            <div className="mb-1">
              <p
                className="text-xs text-[#C9A96E] tracking-wider uppercase font-semibold"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Total Balance
              </p>
            </div>
            <div className="flex items-end gap-2 mb-4">
              <p
                className="text-4xl font-bold text-[#C9A96E]"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                <AnimatedCounter target={wallet.balance} />
              </p>
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-[#4ADE80]" />
                <span className="text-[10px] text-[#4ADE80] font-semibold">
                  +12%
                </span>
              </div>
            </div>

            {/* Balance breakdown */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <p
                  className="text-[9px] text-white/50 tracking-wider uppercase mb-0.5"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Available
                </p>
                <p
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  ₹{payoutBalance.toLocaleString()}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <p
                  className="text-[9px] text-white/50 tracking-wider uppercase mb-0.5"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Pending
                </p>
                <p
                  className="text-lg font-bold text-[#C9A96E]"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  ₹{pendingSettlement.toLocaleString()}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <p
                  className="text-[9px] text-white/50 tracking-wider uppercase mb-0.5"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  On Hold
                </p>
                <p
                  className="text-lg font-bold text-[#1B2A4A]"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  ₹{wallet.lockedReferralAmount.toLocaleString()}
                </p>
                <p
                  className="text-[7px] text-white/40 mt-0.5"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  7-day fraud hold
                </p>
              </div>
            </div>

            {/* Last payout */}
            <div className="flex items-center justify-between mb-4">
              <p
                className="text-[10px] text-white/40"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Last payout: {lastPayoutFormatted}
              </p>
              <div className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ADE80]" />
                </span>
                <span
                  className="text-[9px] text-[#4ADE80] font-semibold"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Active
                </span>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2">
              <motion.button
                onClick={() => setShowAddMoneyModal(true)}
                whileTap={{ scale: 0.95 }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#C9A96E] rounded-lg text-[11px] font-semibold text-[#1B2A4A] active:bg-[#D4BC8E] transition-colors"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Money
              </motion.button>
              <motion.button
                onClick={() => setShowWithdrawModal(true)}
                whileTap={{ scale: 0.95 }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/15 rounded-lg text-[11px] font-semibold text-white border border-white/20 active:bg-white/25 transition-colors"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Withdraw
              </motion.button>
              <motion.button
                onClick={() =>
                  toast({
                    title: 'Coming soon!',
                    description: 'Send money feature is under development.',
                  })
                }
                whileTap={{ scale: 0.95 }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/15 rounded-lg text-[11px] font-semibold text-white border border-white/20 active:bg-white/25 transition-colors"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Earnings Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-[#D5CBBF]"
          style={{ boxShadow: '0 2px 8px rgba(27, 42, 74, 0.04)' }}
        >
          <h3
            className="text-sm font-semibold text-[#2C2C2C] flex items-center gap-2 mb-4"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            <TrendingUp className="w-4 h-4 text-[#1B2A4A]" />
            Earnings Breakdown
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#F5F0EB] rounded-lg">
              <p
                className="text-[9px] text-[#7A7168] tracking-wider uppercase font-semibold"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Today
              </p>
              <p
                className="text-xl font-bold text-[#1B2A4A] mt-0.5"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                ₹{todayEarnings.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-[#F5F0EB] rounded-lg">
              <p
                className="text-[9px] text-[#7A7168] tracking-wider uppercase font-semibold"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                This Week
              </p>
              <p
                className="text-xl font-bold text-[#1B2A4A] mt-0.5"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                ₹{weekEarnings.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-[#F5F0EB] rounded-lg">
              <p
                className="text-[9px] text-[#7A7168] tracking-wider uppercase font-semibold"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                This Month
              </p>
              <p
                className="text-xl font-bold text-[#1B2A4A] mt-0.5"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                ₹{monthEarnings.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-[#C9A96E]/5 rounded-lg border border-[#C9A96E]/15">
              <p
                className="text-[9px] text-[#8B5E3C] tracking-wider uppercase font-semibold"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Avg/Delivery
              </p>
              <p
                className="text-xl font-bold text-[#C9A96E] mt-0.5"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                ₹{avgPerDelivery}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl border border-[#D5CBBF] overflow-hidden"
          style={{ boxShadow: '0 2px 8px rgba(27, 42, 74, 0.04)' }}
        >
          <div className="p-4 pb-2">
            <h3
              className="text-sm font-semibold text-[#2C2C2C] flex items-center gap-2 mb-3"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              <Banknote className="w-4 h-4 text-[#1B2A4A]" />
              Transaction History
            </h3>

            {/* Filter tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'income', label: 'Income' },
                  { id: 'withdrawals', label: 'Withdrawals' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'on_hold', label: 'On Hold' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200 whitespace-nowrap ${
                    activeFilter === tab.id
                      ? 'bg-[#1B2A4A] text-[#FAF7F2]'
                      : 'bg-[#F0EBE4] text-[#7A7168] hover:bg-[#E8E0D4]'
                  }`}
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction list */}
          <div className="max-h-96 overflow-y-auto">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx, index) => {
                const iconInfo = getTransactionIcon(tx.type);
                const Icon = iconInfo.icon;
                const isIncome =
                  tx.type !== 'withdrawal' && tx.type !== 'payout';
                const isExpanded = expandedTx === tx.id;

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <button
                      onClick={() =>
                        setExpandedTx(isExpanded ? null : tx.id)
                      }
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0EBE4] hover:bg-[#FAF7F2]/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${iconInfo.color}15` }}
                          >
                            <Icon
                              className="w-4 h-4"
                              style={{ color: iconInfo.color }}
                            />
                          </div>
                          <div>
                            <p
                              className="text-sm text-[#2C2C2C] font-medium"
                              style={{
                                fontFamily: 'var(--font-lora), serif',
                              }}
                            >
                              {tx.description}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p
                                className="text-[10px] text-[#7A7168]"
                                style={{
                                  fontFamily: 'var(--font-lora), serif',
                                }}
                              >
                                {tx.platform}
                              </p>
                              <span className="text-[8px] text-[#D5CBBF]">
                                •
                              </span>
                              <p
                                className="text-[10px] text-[#7A7168]"
                                style={{
                                  fontFamily: 'var(--font-lora), serif',
                                }}
                              >
                                {formatRelativeTime(tx.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p
                              className={`text-sm font-bold ${
                                isIncome
                                  ? 'text-[#2C4A3E]'
                                  : 'text-[#722F37]'
                              }`}
                              style={{
                                fontFamily: 'var(--font-playfair), serif',
                              }}
                            >
                              {isIncome ? '+' : '-'}₹
                              {Math.abs(tx.amount).toLocaleString()}
                            </p>
                            <StatusBadge status={tx.status} holdDaysRemaining={tx.holdDaysRemaining} />
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#7A7168]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#7A7168]" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#F0EBE4]">
                            <div className="grid grid-cols-2 gap-3 text-[10px]">
                              <div>
                                <p
                                  className="text-[#7A7168] tracking-wider uppercase font-semibold"
                                  style={{
                                    fontFamily: 'var(--font-lora), serif',
                                  }}
                                >
                                  Type
                                </p>
                                <p
                                  className="text-[#2C2C2C] font-medium capitalize mt-0.5"
                                  style={{
                                    fontFamily: 'var(--font-lora), serif',
                                  }}
                                >
                                  {tx.type}
                                </p>
                              </div>
                              <div>
                                <p
                                  className="text-[#7A7168] tracking-wider uppercase font-semibold"
                                  style={{
                                    fontFamily: 'var(--font-lora), serif',
                                  }}
                                >
                                  Platform
                                </p>
                                <p
                                  className="text-[#2C2C2C] font-medium mt-0.5"
                                  style={{
                                    fontFamily: 'var(--font-lora), serif',
                                  }}
                                >
                                  {tx.platform}
                                </p>
                              </div>
                              <div>
                                <p
                                  className="text-[#7A7168] tracking-wider uppercase font-semibold"
                                  style={{
                                    fontFamily: 'var(--font-lora), serif',
                                  }}
                                >
                                  Date & Time
                                </p>
                                <p
                                  className="text-[#2C2C2C] font-medium mt-0.5"
                                  style={{
                                    fontFamily: 'var(--font-lora), serif',
                                  }}
                                >
                                  {new Date(tx.timestamp).toLocaleString(
                                    'en-IN',
                                    {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }
                                  )}
                                </p>
                              </div>
                              <div>
                                <p
                                  className="text-[#7A7168] tracking-wider uppercase font-semibold"
                                  style={{
                                    fontFamily: 'var(--font-lora), serif',
                                  }}
                                >
                                  Transaction ID
                                </p>
                                <p
                                  className="text-[#2C2C2C] font-medium mt-0.5"
                                  style={{
                                    fontFamily: 'var(--font-lora), serif',
                                  }}
                                >
                                  {tx.id}
                                </p>
                              </div>
                              {tx.status === 'on_hold' && tx.holdDaysRemaining && (
                                <div className="col-span-2 mt-1 p-2 bg-[#1B2A4A]/5 rounded-lg border border-[#1B2A4A]/10">
                                  <div className="flex items-center gap-1.5">
                                    <Shield className="w-3 h-3 text-[#1B2A4A]/60" />
                                    <p
                                      className="text-[9px] text-[#1B2A4A]/70 font-semibold"
                                      style={{ fontFamily: 'var(--font-lora), serif' }}
                                    >
                                      Referral bonus on {tx.holdDaysRemaining}-day fraud hold
                                    </p>
                                  </div>
                                  <p
                                    className="text-[8px] text-[#7A7168] mt-0.5 ml-[18px]"
                                    style={{ fontFamily: 'var(--font-lora), serif' }}
                                  >
                                    Bonus unlocks after hold period to verify genuine referrals
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[#F0EBE4] flex items-center justify-center mx-auto mb-3">
                  <Banknote className="w-6 h-6 text-[#7A7168]" />
                </div>
                <p
                  className="text-sm text-[#7A7168]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  No transactions found
                </p>
                <p
                  className="text-[10px] text-[#D5CBBF] mt-1"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {activeFilter !== 'all'
                    ? 'Try a different filter'
                    : 'Complete deliveries to see transactions'}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Withdraw Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 border border-[#D5CBBF]"
          style={{ boxShadow: '0 2px 8px rgba(27, 42, 74, 0.04)' }}
        >
          <h3
            className="text-sm font-semibold text-[#2C2C2C] flex items-center gap-2 mb-4"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            <CreditCard className="w-4 h-4 text-[#1B2A4A]" />
            Quick Withdraw
          </h3>

          <div className="flex items-center justify-between mb-3">
            <div>
              <p
                className="text-[9px] text-[#7A7168] tracking-wider uppercase font-semibold"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Available Balance
              </p>
              <p
                className="text-2xl font-bold text-[#1B2A4A]"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                ₹{wallet.balance.toLocaleString()}
              </p>
            </div>
            <motion.button
              onClick={() => setShowWithdrawModal(true)}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2.5 bg-[#1B2A4A] rounded-lg text-[11px] font-semibold text-[#FAF7F2] active:bg-[#2A3F6A] transition-colors shadow-sm"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Withdraw
            </motion.button>
          </div>

          {/* Bank account & UPI */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-[#F5F0EB] rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-[#1B2A4A]/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#1B2A4A]" />
              </div>
              <div className="flex-1">
                <p
                  className="text-xs font-medium text-[#2C2C2C]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {wallet.bankAccount}
                </p>
                <p
                  className="text-[10px] text-[#7A7168]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Savings Account
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#F5F0EB] rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-[#C9A96E]/10 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-[#C9A96E]" />
              </div>
              <div className="flex-1">
                <p
                  className="text-xs font-medium text-[#2C2C2C]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {wallet.upiId}
                </p>
                <p
                  className="text-[10px] text-[#7A7168]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  UPI ID
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-3 p-2.5 bg-[#C9A96E]/5 rounded-lg border border-[#C9A96E]/10">
            <Info className="w-3.5 h-3.5 text-[#8B5E3C] flex-shrink-0" />
            <p
              className="text-[10px] text-[#8B5E3C]"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Withdrawals are processed within 1-2 business days. Minimum ₹100.
            </p>
          </div>
        </motion.div>

        {/* Payout History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-xl border border-[#D5CBBF] overflow-hidden"
          style={{ boxShadow: '0 2px 8px rgba(27, 42, 74, 0.04)' }}
        >
          <div className="p-4 pb-2">
            <h3
              className="text-sm font-semibold text-[#2C2C2C] flex items-center gap-2 mb-3"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              <Clock className="w-4 h-4 text-[#1B2A4A]" />
              Payout History
            </h3>
          </div>

          {payoutHistory.length > 0 ? (
            <div className="max-h-48 overflow-y-auto">
              {payoutHistory.map((payout, index) => (
                <motion.div
                  key={payout.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between px-4 py-3 border-b border-[#F0EBE4] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#722F37]/10 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-[#722F37]" />
                    </div>
                    <div>
                      <p
                        className="text-sm text-[#2C2C2C] font-medium"
                        style={{ fontFamily: 'var(--font-lora), serif' }}
                      >
                        {payout.description}
                      </p>
                      <p
                        className="text-[10px] text-[#7A7168]"
                        style={{ fontFamily: 'var(--font-lora), serif' }}
                      >
                        {new Date(payout.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-bold text-[#722F37]"
                      style={{ fontFamily: 'var(--font-playfair), serif' }}
                    >
                      -₹{Math.abs(payout.amount).toLocaleString()}
                    </p>
                    <StatusBadge status={payout.status} />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <p
                className="text-sm text-[#7A7168]"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                No payout history yet
              </p>
            </div>
          )}

          {/* Monthly summary */}
          <div className="p-4 border-t border-[#F0EBE4] bg-[#FAF7F2]">
            <p
              className="text-[9px] text-[#7A7168] tracking-wider uppercase font-semibold mb-2"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Monthly Summary
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p
                  className="text-xs font-bold text-[#2C4A3E]"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  ₹{monthlySummary.totalIncome.toLocaleString()}
                </p>
                <p
                  className="text-[8px] text-[#7A7168]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Income
                </p>
              </div>
              <div className="text-center">
                <p
                  className="text-xs font-bold text-[#722F37]"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  ₹{monthlySummary.totalWithdrawals.toLocaleString()}
                </p>
                <p
                  className="text-[8px] text-[#7A7168]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Withdrawn
                </p>
              </div>
              <div className="text-center">
                <p
                  className="text-xs font-bold text-[#1B2A4A]"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  ₹{monthlySummary.net.toLocaleString()}
                </p>
                <p
                  className="text-[8px] text-[#7A7168]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Net
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
            onClick={() => !isProcessing && setShowWithdrawModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-[#FAF7F2] rounded-t-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                {/* Handle */}
                <div className="w-10 h-1 bg-[#D5CBBF] rounded-full mx-auto mb-4" />

                <h3
                  className="text-lg font-bold text-[#1B2A4A] mb-4"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  Withdraw Funds
                </h3>

                {/* Available balance */}
                <div className="p-3 bg-[#F5F0EB] rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] text-[#7A7168] tracking-wider uppercase font-semibold"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      Available Balance
                    </span>
                    <span
                      className="text-lg font-bold text-[#1B2A4A]"
                      style={{ fontFamily: 'var(--font-playfair), serif' }}
                    >
                      ₹{wallet.balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Amount input */}
                <div className="mb-4">
                  <label
                    className="text-[10px] text-[#7A7168] tracking-wider uppercase font-semibold mb-1.5 block"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    Withdrawal Amount
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1B2A4A] font-bold"
                      style={{ fontFamily: 'var(--font-playfair), serif' }}
                    >
                      ₹
                    </span>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-8 pr-4 py-3 bg-white border border-[#D5CBBF] rounded-lg text-[#1B2A4A] text-lg font-bold focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E]/30 transition-all"
                      style={{ fontFamily: 'var(--font-playfair), serif' }}
                      disabled={isProcessing}
                    />
                  </div>
                  {/* Quick amounts */}
                  <div className="flex gap-2 mt-2">
                    {[100, 500, 1000, 2000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setWithdrawAmount(String(amt))}
                        disabled={isProcessing}
                        className="flex-1 py-1.5 bg-[#F0EBE4] rounded-lg text-[10px] font-semibold text-[#1B2A4A] hover:bg-[#E8E0D4] transition-colors disabled:opacity-50"
                        style={{ fontFamily: 'var(--font-lora), serif' }}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Withdraw method */}
                <div className="mb-4">
                  <label
                    className="text-[10px] text-[#7A7168] tracking-wider uppercase font-semibold mb-1.5 block"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    Withdraw To
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setWithdrawMethod('bank')}
                      disabled={isProcessing}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        withdrawMethod === 'bank'
                          ? 'border-[#C9A96E] bg-[#C9A96E]/5'
                          : 'border-[#D5CBBF] bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#1B2A4A]/10 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-[#1B2A4A]" />
                      </div>
                      <div className="flex-1 text-left">
                        <p
                          className="text-xs font-medium text-[#2C2C2C]"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          {wallet.bankAccount}
                        </p>
                        <p
                          className="text-[10px] text-[#7A7168]"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          Bank Transfer (1-2 days)
                        </p>
                      </div>
                      {withdrawMethod === 'bank' && (
                        <CheckCircle2 className="w-4 h-4 text-[#C9A96E]" />
                      )}
                    </button>
                    <button
                      onClick={() => setWithdrawMethod('upi')}
                      disabled={isProcessing}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        withdrawMethod === 'upi'
                          ? 'border-[#C9A96E] bg-[#C9A96E]/5'
                          : 'border-[#D5CBBF] bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#C9A96E]/10 flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-[#C9A96E]" />
                      </div>
                      <div className="flex-1 text-left">
                        <p
                          className="text-xs font-medium text-[#2C2C2C]"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          {wallet.upiId}
                        </p>
                        <p
                          className="text-[10px] text-[#7A7168]"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          UPI Transfer (Instant)
                        </p>
                      </div>
                      {withdrawMethod === 'upi' && (
                        <CheckCircle2 className="w-4 h-4 text-[#C9A96E]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Processing note */}
                <div className="flex items-center gap-1.5 p-2.5 bg-[#C9A96E]/5 rounded-lg border border-[#C9A96E]/10 mb-4">
                  <Info className="w-3.5 h-3.5 text-[#8B5E3C] flex-shrink-0" />
                  <p
                    className="text-[10px] text-[#8B5E3C]"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    {withdrawMethod === 'bank'
                      ? 'Bank transfers are processed within 1-2 business days.'
                      : 'UPI transfers are usually instant but may take up to 30 minutes.'}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setShowWithdrawModal(false)}
                    whileTap={{ scale: 0.95 }}
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-[#F0EBE4] rounded-lg text-sm font-semibold text-[#7A7168] active:bg-[#E8E0D4] transition-colors disabled:opacity-50"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleWithdraw}
                    whileTap={{ scale: 0.95 }}
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-[#1B2A4A] rounded-lg text-sm font-semibold text-[#FAF7F2] active:bg-[#2A3F6A] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Withdraw'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Withdraw Modal */}
      <AnimatePresence>
        {showConfirmWithdraw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-6"
            onClick={() => !isProcessing && setShowConfirmWithdraw(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#FAF7F2] rounded-xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-[#1B2A4A]" />
                </div>
                <h3
                  className="text-lg font-bold text-[#1B2A4A]"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  Confirm Withdrawal
                </h3>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between py-2 border-b border-[#F0EBE4]">
                  <span
                    className="text-xs text-[#7A7168]"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    Amount
                  </span>
                  <span
                    className="text-sm font-bold text-[#1B2A4A]"
                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                  >
                    ₹{parseInt(withdrawAmount || '0').toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#F0EBE4]">
                  <span
                    className="text-xs text-[#7A7168]"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    Method
                  </span>
                  <span
                    className="text-sm font-medium text-[#2C2C2C]"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    {withdrawMethod === 'bank'
                      ? wallet.bankAccount
                      : wallet.upiId}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span
                    className="text-xs text-[#7A7168]"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    Processing Time
                  </span>
                  <span
                    className="text-sm font-medium text-[#2C2C2C]"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    {withdrawMethod === 'bank' ? '1-2 business days' : 'Up to 30 min'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowConfirmWithdraw(false)}
                  whileTap={{ scale: 0.95 }}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-[#F0EBE4] rounded-lg text-sm font-semibold text-[#7A7168] disabled:opacity-50"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmWithdraw}
                  whileTap={{ scale: 0.95 }}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-[#1B2A4A] rounded-lg text-sm font-semibold text-[#FAF7F2] disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    'Confirm'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Money Modal */}
      <AnimatePresence>
        {showAddMoneyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
            onClick={() => setShowAddMoneyModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-[#FAF7F2] rounded-t-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                {/* Handle */}
                <div className="w-10 h-1 bg-[#D5CBBF] rounded-full mx-auto mb-4" />

                <h3
                  className="text-lg font-bold text-[#1B2A4A] mb-4"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  Add Money
                </h3>

                {/* Amount input */}
                <div className="mb-4">
                  <label
                    className="text-[10px] text-[#7A7168] tracking-wider uppercase font-semibold mb-1.5 block"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    Amount
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1B2A4A] font-bold"
                      style={{ fontFamily: 'var(--font-playfair), serif' }}
                    >
                      ₹
                    </span>
                    <input
                      type="number"
                      value={addMoneyAmount}
                      onChange={(e) => setAddMoneyAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-8 pr-4 py-3 bg-white border border-[#D5CBBF] rounded-lg text-[#1B2A4A] text-lg font-bold focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E]/30 transition-all"
                      style={{ fontFamily: 'var(--font-playfair), serif' }}
                    />
                  </div>
                  {/* Quick amounts */}
                  <div className="flex gap-2 mt-2">
                    {[200, 500, 1000, 2000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setAddMoneyAmount(String(amt))}
                        className="flex-1 py-1.5 bg-[#F0EBE4] rounded-lg text-[10px] font-semibold text-[#1B2A4A] hover:bg-[#E8E0D4] transition-colors"
                        style={{ fontFamily: 'var(--font-lora), serif' }}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment methods */}
                <div className="mb-4">
                  <label
                    className="text-[10px] text-[#7A7168] tracking-wider uppercase font-semibold mb-1.5 block"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    Payment Method
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-[#D5CBBF] bg-white opacity-60">
                      <div className="w-8 h-8 rounded-lg bg-[#C9A96E]/10 flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-[#C9A96E]" />
                      </div>
                      <div className="flex-1">
                        <p
                          className="text-xs font-medium text-[#2C2C2C]"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          UPI Payment
                        </p>
                        <p
                          className="text-[10px] text-[#7A7168]"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          {wallet.upiId}
                        </p>
                      </div>
                      <span className="text-[8px] px-2 py-0.5 bg-[#8B5E3C]/10 text-[#8B5E3C] rounded-full font-semibold">
                        Coming Soon
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-[#D5CBBF] bg-white opacity-60">
                      <div className="w-8 h-8 rounded-lg bg-[#1B2A4A]/10 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-[#1B2A4A]" />
                      </div>
                      <div className="flex-1">
                        <p
                          className="text-xs font-medium text-[#2C2C2C]"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          Net Banking
                        </p>
                        <p
                          className="text-[10px] text-[#7A7168]"
                          style={{ fontFamily: 'var(--font-lora), serif' }}
                        >
                          {wallet.bankAccount}
                        </p>
                      </div>
                      <span className="text-[8px] px-2 py-0.5 bg-[#8B5E3C]/10 text-[#8B5E3C] rounded-full font-semibold">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coming soon notice */}
                <div className="flex items-center gap-2 p-3 bg-[#C9A96E]/5 rounded-lg border border-[#C9A96E]/15 mb-4">
                  <Info className="w-4 h-4 text-[#8B5E3C] flex-shrink-0" />
                  <div>
                    <p
                      className="text-[10px] font-semibold text-[#8B5E3C] tracking-wider uppercase"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      Coming Soon
                    </p>
                    <p
                      className="text-[10px] text-[#8B5E3C]"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      UPI integration is in progress. This feature will be
                      available soon!
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setShowAddMoneyModal(false)}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 bg-[#F0EBE4] rounded-lg text-sm font-semibold text-[#7A7168] active:bg-[#E8E0D4] transition-colors"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    Close
                  </motion.button>
                  <motion.button
                    onClick={handleAddMoney}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 bg-[#1B2A4A] rounded-lg text-sm font-semibold text-[#FAF7F2] active:bg-[#2A3F6A] transition-colors shadow-sm opacity-60 cursor-not-allowed"
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    Add Money
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
