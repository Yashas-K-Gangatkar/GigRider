'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGigRiderStore, PLATFORMS, type AppSettings } from '@/lib/store';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Camera,
  Wallet,
  Bell,
  Shield,
  Globe,
  Trash2,
  Download,
  Phone,
  LogOut,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Crown,
  X,
  Layers,
  Settings,
  Star,
  Info,
  ExternalLink,
  FileDown,
  Bike,
} from 'lucide-react';

type SettingsSection =
  | 'profile'
  | 'earnings'
  | 'delivery'
  | 'notifications'
  | 'platform'
  | 'app'
  | 'account'
  | 'about'
  | null;

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  free: { label: 'Rider', color: '#7A7168', bg: 'bg-[#7A7168]/10' },
  pro: { label: 'Pro Rider', color: '#C9A96E', bg: 'bg-[#C9A96E]/10' },
  elite: { label: 'Elite Rider', color: '#1B2A4A', bg: 'bg-[#1B2A4A]/10' },
  fleet: { label: 'Fleet Manager', color: '#2C4A3E', bg: 'bg-[#2C4A3E]/10' },
};

const VEHICLE_LABELS: Record<string, string> = { bicycle: 'Bicycle', scooter: 'Scooter', car: 'Car' };
const EXPORT_LABELS: Record<string, string> = { csv: 'CSV', json: 'JSON', pdf: 'PDF' };

// ─── Static Sub-Components (outside render) ───

function Section({
  id,
  icon: Icon,
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
}: {
  id: SettingsSection;
  icon: typeof User;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: (id: SettingsSection) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#D5CBBF] overflow-hidden card-elegant">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#FAF7F2]/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1B2A4A]/8 flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#1B2A4A]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[#2C2C2C]" style={{ fontFamily: 'var(--font-lora), serif' }}>
              {title}
            </p>
            {subtitle && (
              <p className="text-[10px] text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-[#7A7168]" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#2C2C2C]" style={{ fontFamily: 'var(--font-lora), serif' }}>
        {label}
      </span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={checked ? 'bg-[#2C4A3E]' : 'bg-[#D5CBBF]'}
      />
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  formatValue,
  onValueChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  formatValue?: (v: number) => string;
  onValueChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#2C2C2C]" style={{ fontFamily: 'var(--font-lora), serif' }}>
          {label}
        </span>
        <span className="text-sm font-bold text-[#1B2A4A]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onValueChange(v)}
        className="w-full"
      />
    </div>
  );
}

function SelectorRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-sm text-[#2C2C2C] block mb-2" style={{ fontFamily: 'var(--font-lora), serif' }}>
        {label}
      </span>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
              value === opt.value
                ? 'bg-[#1B2A4A] text-[#FAF7F2] shadow-sm'
                : 'bg-[#F5F0EB] text-[#7A7168] hover:bg-[#F0EBE4]'
            }`}
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Settings Screen ───

export default function SettingsScreen({ onBack, onLogout }: { onBack?: () => void; onLogout?: () => void }) {
  const settings = useGigRiderStore((s) => s.settings);
  const updateSettings = useGigRiderStore((s) => s.updateSettings);
  const rider = useGigRiderStore((s) => s.rider);
  const logout = useGigRiderStore((s) => s.logout);
  const connectedPlatforms = useGigRiderStore((s) => s.connectedPlatforms);
  const { permission, requestPermission } = useNotifications();
  const { toast } = useToast();

  const [openSection, setOpenSection] = useState<SettingsSection>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);
  const [profileForm, setProfileForm] = useState({
    name: settings.profileName || rider?.name || '',
    email: settings.profileEmail || '',
    phone: settings.profilePhone || rider?.phone || '',
  });

  const toggleSection = (section: SettingsSection) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleSettingChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    updateSettings({ [key]: value });
  };

  const handlePushToggle = async (checked: boolean) => {
    if (checked) {
      const result = await requestPermission();
      if (result === 'granted') {
        handleSettingChange('pushNotifications', true);
      } else {
        toast({ title: 'Permission denied', description: 'Please enable notifications in your browser settings.' });
      }
    } else {
      handleSettingChange('pushNotifications', false);
    }
  };

  const handleSaveProfile = () => {
    updateSettings({
      profileName: profileForm.name,
      profileEmail: profileForm.email,
      profilePhone: profileForm.phone,
    });
    setEditingProfile(false);
    toast({ title: 'Profile updated', description: 'Your profile has been saved.' });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmStep === 0) {
      setDeleteConfirmStep(1);
    } else {
      logout();
      if (onLogout) onLogout();
      toast({ title: 'Account deleted', description: 'Your account has been permanently deleted.' });
    }
  };

  const handleSignOut = () => {
    logout();
    if (onLogout) onLogout();
  };

  const tier = rider?.tier || 'free';
  const tierConfig = TIER_CONFIG[tier];

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#D5CBBF] px-4 py-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-1 -ml-1 rounded-full hover:bg-[#F0EBE4] transition-colors">
              <ChevronRight className="w-5 h-5 text-[#1B2A4A] rotate-180" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#1B2A4A]" />
            <h1
              className="text-lg font-bold text-[#1B2A4A] tracking-wide"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              Settings
            </h1>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B2A4A]/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#D5CBBF] shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#722F37]/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-[#722F37]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1B2A4A]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    Delete Account
                  </h3>
                  <p className="text-xs text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                    This action cannot be undone
                  </p>
                </div>
              </div>

              {deleteConfirmStep === 0 ? (
                <>
                  <p className="text-sm text-[#2C2C2C] mb-4" style={{ fontFamily: 'var(--font-lora), serif' }}>
                    Are you sure you want to delete your account? All your data, delivery history, and earnings
                    records will be permanently removed.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowDeleteModal(false); setDeleteConfirmStep(0); }}
                      className="flex-1 py-2.5 rounded-lg bg-[#F5F0EB] text-sm font-semibold text-[#2C2C2C]"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 py-2.5 rounded-lg bg-[#722F37] text-sm font-semibold text-white"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      Continue
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-[#722F37] font-medium mb-4" style={{ fontFamily: 'var(--font-lora), serif' }}>
                    This is your final warning. Press &quot;Delete Forever&quot; to permanently delete your account
                    and all associated data.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowDeleteModal(false); setDeleteConfirmStep(0); }}
                      className="flex-1 py-2.5 rounded-lg bg-[#F5F0EB] text-sm font-semibold text-[#2C2C2C]"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 py-2.5 rounded-lg bg-[#722F37] text-sm font-bold text-white"
                      style={{ fontFamily: 'var(--font-lora), serif' }}
                    >
                      Delete Forever
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 pt-4 space-y-3">
        {/* ─── Profile Section ─── */}
        <Section
          id="profile"
          icon={User}
          title="Profile"
          subtitle={settings.profileName || rider?.name || 'Set up your profile'}
          isOpen={openSection === 'profile'}
          onToggle={toggleSection}
        >
          {/* Profile Photo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => toast({ title: 'Coming soon', description: 'Profile photo upload is coming soon!' })}
              className="relative"
            >
              <div className="w-16 h-16 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center text-2xl border-2 border-[#C9A96E]/40">
                <span style={{ fontFamily: 'var(--font-playfair), serif' }}>
                  {(settings.profileName || rider?.name || 'R').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1B2A4A] flex items-center justify-center border-2 border-white">
                <Camera className="w-3 h-3 text-white" />
              </div>
            </button>
            <div className="flex-1">
              <p className="text-base font-bold text-[#1B2A4A]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                {settings.profileName || rider?.name || 'Rider'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className="text-[9px] px-2 py-0.5"
                  style={{
                    backgroundColor: tierConfig.bg,
                    color: tierConfig.color,
                    borderColor: tierConfig.color + '30',
                  }}
                >
                  <Crown className="w-2.5 h-2.5 mr-0.5" />
                  {tierConfig.label}
                </Badge>
              </div>
            </div>
          </div>

          {editingProfile ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#7A7168] block mb-1" style={{ fontFamily: 'var(--font-lora), serif' }}>
                  Name
                </label>
                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#D5CBBF] bg-white text-sm text-[#2C2C2C] focus:outline-none focus:border-[#C9A96E]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                />
              </div>
              <div>
                <label className="text-xs text-[#7A7168] block mb-1" style={{ fontFamily: 'var(--font-lora), serif' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#D5CBBF] bg-white text-sm text-[#2C2C2C] focus:outline-none focus:border-[#C9A96E]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                  placeholder="rider@example.com"
                />
              </div>
              <div>
                <label className="text-xs text-[#7A7168] block mb-1" style={{ fontFamily: 'var(--font-lora), serif' }}>
                  Phone
                </label>
                <input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#D5CBBF] bg-white text-sm text-[#2C2C2C] focus:outline-none focus:border-[#C9A96E]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingProfile(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[#F5F0EB] text-sm font-semibold text-[#7A7168]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 py-2.5 rounded-lg bg-[#1B2A4A] text-sm font-semibold text-[#FAF7F2]"
                  style={{ fontFamily: 'var(--font-lora), serif' }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditingProfile(true)}
              className="w-full py-2.5 rounded-lg border border-[#D5CBBF] bg-[#FAF7F2] text-sm font-semibold text-[#1B2A4A] flex items-center justify-center gap-2 hover:bg-[#F5F0EB] transition-colors"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              <User className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </Section>

        {/* ─── Earnings & Finance ─── */}
        <Section
          id="earnings"
          icon={Wallet}
          title="Earnings & Finance"
          subtitle={`${settings.currency} · ${settings.payoutSchedule} payout`}
          isOpen={openSection === 'earnings'}
          onToggle={toggleSection}
        >
          <SliderRow
            label="Weekly Earning Goal"
            value={settings.weeklyEarningGoal}
            min={1000}
            max={20000}
            step={500}
            formatValue={(v) => `₹${v.toLocaleString()}`}
            onValueChange={(v) => handleSettingChange('weeklyEarningGoal', v)}
          />
          <SliderRow
            label="Daily Target"
            value={settings.dailyTarget}
            min={200}
            max={5000}
            step={100}
            formatValue={(v) => `₹${v.toLocaleString()}`}
            onValueChange={(v) => handleSettingChange('dailyTarget', v)}
          />
          <SelectorRow
            label="Currency"
            options={[{ value: 'INR', label: '₹ INR' }]}
            value={settings.currency}
            onChange={(v) => handleSettingChange('currency', v)}
          />
          <SelectorRow
            label="Payout Schedule"
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
            value={settings.payoutSchedule}
            onChange={(v) => handleSettingChange('payoutSchedule', v as AppSettings['payoutSchedule'])}
          />
        </Section>

        {/* ─── Delivery Preferences ─── */}
        <Section
          id="delivery"
          icon={Bike}
          title="Delivery Preferences"
          subtitle={`${VEHICLE_LABELS[settings.defaultVehicle]} · ${settings.maxDeliveryDistance} km max`}
          isOpen={openSection === 'delivery'}
          onToggle={toggleSection}
        >
          <SelectorRow
            label="Default Vehicle Type"
            options={[
              { value: 'bicycle', label: 'Bicycle' },
              { value: 'scooter', label: 'Scooter' },
              { value: 'car', label: 'Car' },
            ]}
            value={settings.defaultVehicle}
            onChange={(v) => handleSettingChange('defaultVehicle', v as AppSettings['defaultVehicle'])}
          />
          <SliderRow
            label="Max Delivery Distance"
            value={settings.maxDeliveryDistance}
            min={2}
            max={25}
            step={1}
            formatValue={(v) => `${v} km`}
            onValueChange={(v) => handleSettingChange('maxDeliveryDistance', v)}
          />
          <SliderRow
            label="Max Daily KM Target"
            value={settings.maxDailyKm}
            min={20}
            max={200}
            step={10}
            formatValue={(v) => `${v} km`}
            onValueChange={(v) => handleSettingChange('maxDailyKm', v)}
          />
          <ToggleRow
            label="Break Reminder"
            checked={settings.breakReminder}
            onCheckedChange={(v) => handleSettingChange('breakReminder', v)}
          />
          {settings.breakReminder && (
            <SelectorRow
              label="Break Interval"
              options={[
                { value: '30', label: '30 min' },
                { value: '60', label: '60 min' },
                { value: '90', label: '90 min' },
                { value: '120', label: '120 min' },
              ]}
              value={String(settings.breakInterval)}
              onChange={(v) => handleSettingChange('breakInterval', Number(v) as AppSettings['breakInterval'])}
            />
          )}
        </Section>

        {/* ─── Notifications ─── */}
        <Section
          id="notifications"
          icon={Bell}
          title="Notifications"
          subtitle={settings.pushNotifications ? 'Enabled' : 'Disabled'}
          isOpen={openSection === 'notifications'}
          onToggle={toggleSection}
        >
          <ToggleRow
            label="Push Notifications"
            checked={settings.pushNotifications}
            onCheckedChange={handlePushToggle}
          />
          {settings.pushNotifications && (
            <>
              <ToggleRow
                label="Order Alerts"
                checked={settings.orderAlerts}
                onCheckedChange={(v) => handleSettingChange('orderAlerts', v)}
              />
              <ToggleRow
                label="Earnings Alerts"
                checked={settings.earningsAlerts}
                onCheckedChange={(v) => handleSettingChange('earningsAlerts', v)}
              />
              <ToggleRow
                label="Tip Notifications"
                checked={settings.tipNotifications}
                onCheckedChange={(v) => handleSettingChange('tipNotifications', v)}
              />
              <ToggleRow
                label="Surge Alerts"
                checked={settings.surgeAlerts}
                onCheckedChange={(v) => handleSettingChange('surgeAlerts', v)}
              />
            </>
          )}
          <ToggleRow
            label="Sound"
            checked={settings.soundEnabled}
            onCheckedChange={(v) => handleSettingChange('soundEnabled', v)}
          />
          {permission !== 'granted' && permission !== 'denied' && (
            <div className="bg-[#C9A96E]/10 rounded-lg p-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#8B5E3C] shrink-0" />
              <p className="text-xs text-[#8B5E3C]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                Enable push notifications to receive real-time order alerts and surge notifications.
              </p>
            </div>
          )}
        </Section>

        {/* ─── Platform Management ─── */}
        <Section
          id="platform"
          icon={Layers}
          title="Platform Management"
          subtitle={`${connectedPlatforms.length} platforms connected`}
          isOpen={openSection === 'platform'}
          onToggle={toggleSection}
        >
          <ToggleRow
            label="Auto-Online on App Start"
            checked={settings.autoOnlineOnStart}
            onCheckedChange={(v) => handleSettingChange('autoOnlineOnStart', v)}
          />
          <div>
            <span className="text-sm text-[#2C2C2C] block mb-2" style={{ fontFamily: 'var(--font-lora), serif' }}>
              Default Platform for New Orders
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSettingChange('defaultPlatform', 'none')}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                  settings.defaultPlatform === 'none'
                    ? 'bg-[#1B2A4A] text-[#FAF7F2] shadow-sm'
                    : 'bg-[#F5F0EB] text-[#7A7168] hover:bg-[#F0EBE4]'
                }`}
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                Auto
              </button>
              {connectedPlatforms.map((p) => {
                const config = PLATFORMS[p.id];
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSettingChange('defaultPlatform', p.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      settings.defaultPlatform === p.id
                        ? 'bg-[#1B2A4A] text-[#FAF7F2] shadow-sm'
                        : 'bg-[#F5F0EB] text-[#7A7168] hover:bg-[#F0EBE4]'
                    }`}
                    style={{ fontFamily: 'var(--font-lora), serif' }}
                  >
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white"
                      style={{ backgroundColor: config?.color || '#7A7168' }}
                    >
                      {config?.letter || p.id[0].toUpperCase()}
                    </div>
                    {config?.displayName || p.id}
                  </button>
                );
              })}
            </div>
          </div>
          <ToggleRow
            label="Accept Stacked Orders"
            checked={settings.acceptStackedOrders}
            onCheckedChange={(v) => handleSettingChange('acceptStackedOrders', v)}
          />
        </Section>

        {/* ─── App Settings ─── */}
        <Section
          id="app"
          icon={Globe}
          title="App Settings"
          subtitle={`${settings.language === 'en' ? 'English' : settings.language === 'hi' ? 'Hindi' : 'Kannada'} · ${settings.dataExportFormat.toUpperCase()}`}
          isOpen={openSection === 'app'}
          onToggle={toggleSection}
        >
          <SelectorRow
            label="Language"
            options={[
              { value: 'en', label: 'English' },
              { value: 'hi', label: 'Hindi' },
              { value: 'kn', label: 'Kannada' },
            ]}
            value={settings.language}
            onChange={(v) => handleSettingChange('language', v as AppSettings['language'])}
          />
          <SelectorRow
            label="Theme"
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
            value={settings.theme}
            onChange={(v) => {
              if (v === 'dark') {
                toast({ title: 'Coming soon', description: 'Dark mode is coming soon!' });
                return;
              }
              handleSettingChange('theme', v as AppSettings['theme']);
            }}
          />
          <SelectorRow
            label="Data Export Format"
            options={[
              { value: 'csv', label: 'CSV' },
              { value: 'json', label: 'JSON' },
              { value: 'pdf', label: 'PDF' },
            ]}
            value={settings.dataExportFormat}
            onChange={(v) => handleSettingChange('dataExportFormat', v as AppSettings['dataExportFormat'])}
          />
          <button
            onClick={() => toast({ title: 'Cache cleared', description: 'App cache has been cleared successfully.' })}
            className="w-full py-2.5 rounded-lg border border-[#D5CBBF] bg-[#FAF7F2] text-sm font-semibold text-[#1B2A4A] flex items-center justify-center gap-2 hover:bg-[#F5F0EB] transition-colors"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            <Trash2 className="w-4 h-4" />
            Clear Cache
          </button>
          <button
            onClick={() =>
              toast({ title: 'Export started', description: `Your data will be exported as ${EXPORT_LABELS[settings.dataExportFormat]}.` })
            }
            className="w-full py-2.5 rounded-lg border border-[#1B2A4A] bg-[#1B2A4A] text-sm font-semibold text-[#FAF7F2] flex items-center justify-center gap-2 hover:bg-[#2A3F6A] transition-colors"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            <Download className="w-4 h-4" />
            Export All Data
          </button>
        </Section>

        {/* ─── Account ─── */}
        <Section
          id="account"
          icon={Shield}
          title="Account"
          subtitle="Security & account management"
          isOpen={openSection === 'account'}
          onToggle={toggleSection}
        >
          <button
            onClick={() => toast({ title: 'Coming soon', description: 'Phone number change will be available soon.' })}
            className="w-full flex items-center justify-between py-3 px-4 rounded-lg bg-[#FAF7F2] border border-[#D5CBBF] hover:bg-[#F5F0EB] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#7A7168]" />
              <span className="text-sm text-[#2C2C2C]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                Change Phone Number
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7A7168]" />
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-between py-3 px-4 rounded-lg bg-[#722F37]/5 border border-[#722F37]/20 hover:bg-[#722F37]/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-[#722F37]" />
              <span className="text-sm text-[#722F37] font-medium" style={{ fontFamily: 'var(--font-lora), serif' }}>
                Delete Account
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#722F37]" />
          </button>
          <button
            onClick={handleSignOut}
            className="w-full py-3 rounded-lg border-2 border-[#722F37]/30 text-[#722F37] font-semibold flex items-center justify-center gap-2 hover:bg-[#722F37]/5 transition-all duration-200"
            style={{ fontFamily: 'var(--font-lora), serif' }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </Section>

        {/* ─── About ─── */}
        <Section
          id="about"
          icon={Info}
          title="About"
          subtitle="GigRider v2.1.0"
          isOpen={openSection === 'about'}
          onToggle={toggleSection}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#2C2C2C]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                App Version
              </span>
              <span className="text-sm text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                2.1.0
              </span>
            </div>
            <Separator className="bg-[#F0EBE4]" />
            <button
              onClick={() => window.open('https://gigrider.app/privacy', '_blank')}
              className="w-full flex items-center justify-between py-2 hover:bg-[#FAF7F2] transition-colors rounded"
            >
              <div className="flex items-center gap-2">
                <FileDown className="w-4 h-4 text-[#7A7168]" />
                <span className="text-sm text-[#2C2C2C]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                  Privacy Policy
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#7A7168]" />
            </button>
            <button
              onClick={() => window.open('https://gigrider.app/terms', '_blank')}
              className="w-full flex items-center justify-between py-2 hover:bg-[#FAF7F2] transition-colors rounded"
            >
              <div className="flex items-center gap-2">
                <FileDown className="w-4 h-4 text-[#7A7168]" />
                <span className="text-sm text-[#2C2C2C]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                  Terms of Service
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#7A7168]" />
            </button>
            <Separator className="bg-[#F0EBE4]" />
            <button
              onClick={() => toast({ title: 'Thank you!', description: 'Your rating helps us improve GigRider.' })}
              className="w-full py-3 rounded-lg bg-[#C9A96E]/10 border border-[#C9A96E]/25 text-sm font-semibold text-[#8B5E3C] flex items-center justify-center gap-2 hover:bg-[#C9A96E]/15 transition-colors"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              <Star className="w-4 h-4" />
              Rate the App
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
