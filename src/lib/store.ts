import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==================== TYPES ====================

export type PlatformId = 'swiggy' | 'zomato' | 'ubereats' | 'doordash' | 'grubhub' | 'instacart' | 'postmates' | 'deliveroo';

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  displayName: string;
  letter: string;
  color: string;
  description: string;
}

export interface ConnectedPlatform {
  id: PlatformId;
  isOnline: boolean;
  lastOrder: string;
  todayEarnings: number;
  todayOrders: number;
  rating: number;
}

export interface Order {
  id: string;
  platform: PlatformId;
  restaurant: string;
  distance: number;
  pickup: string;
  drop: string;
  earnings: number;
  estimatedTime: number;
  rank: number;
  timer: number;
  isNew: boolean;
  createdAt: number;
  stackId?: string;
}

export interface ActiveDelivery {
  id: string;
  platform: PlatformId;
  restaurant: string;
  customer: string;
  eta: number;
  earnings: number;
  startedAt: number;
  isStacked?: boolean;
  stackedOrders?: string[];
}

export interface DeliveryRecord {
  id: string;
  platform: PlatformId;
  restaurant: string;
  customer: string;
  earnings: number;
  distance: number;
  duration: number;
  status: 'completed' | 'in-progress' | 'cancelled';
  time: string;
  timestamp: number;
  rating?: number;
  tip?: number;
}

export interface AutoAcceptRules {
  enabled: boolean;
  minPayout: number;
  maxDistance: number;
  preferredPlatforms: Record<string, boolean>;
  peakBoost: boolean;
  smartStack: boolean;
}

export interface RiderProfile {
  name: string;
  phone: string;
  vehicleType: 'bicycle' | 'scooter' | 'motorcycle' | 'car';
  avatar: string;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  memberSince: string;
  tier: 'free' | 'pro' | 'elite' | 'fleet';
}

export interface DailyEarning {
  day: string;
  amount: number;
  orders: number;
  isBest: boolean;
}

export interface ShiftSchedule {
  day: string;
  time: string;
  active: boolean;
}

export interface Notification {
  id: string;
  type: 'order_accepted' | 'order_completed' | 'earnings_milestone' | 'platform_update' | 'tier_upgrade' | 'tip_received' | 'stack_order';
  title: string;
  description: string;
  timestamp: number;
  isRead: boolean;
  icon?: string;
}

export interface Transaction {
  id: string;
  type: 'delivery' | 'tip' | 'bonus' | 'incentive' | 'referral' | 'withdrawal' | 'payout';
  amount: number;
  description: string;
  platform: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: number;
}

export interface WalletState {
  balance: number;
  pendingAmount: number;
  transactions: Transaction[];
  bankAccount: string;
  upiId: string;
  payoutSchedule: 'daily' | 'weekly' | 'monthly';
  lastPayoutDate: string | null;
}

// ==================== PLATFORM CONFIGS ====================

export const PLATFORMS: Record<PlatformId, PlatformConfig> = {
  swiggy: { id: 'swiggy', name: 'Food Delivery S', displayName: 'Swiggy', letter: 'S', color: '#B87333', description: 'India\'s largest food delivery' },
  zomato: { id: 'zomato', name: 'Food Delivery Z', displayName: 'Zomato', letter: 'Z', color: '#943540', description: 'Food delivery & dining out' },
  ubereats: { id: 'ubereats', name: 'Meal Delivery U', displayName: 'Uber Eats', letter: 'U', color: '#2C7A5F', description: 'Global meal delivery' },
  doordash: { id: 'doordash', name: 'Delivery D', displayName: 'DoorDash', letter: 'D', color: '#A84020', description: 'US delivery powerhouse' },
  grubhub: { id: 'grubhub', name: 'Food Delivery G', displayName: 'Grubhub', letter: 'G', color: '#9E6B2F', description: 'Food delivery across US cities' },
  instacart: { id: 'instacart', name: 'Grocery Delivery I', displayName: 'Instacart', letter: 'I', color: '#3A7A3A', description: 'Grocery delivery & pickup' },
  postmates: { id: 'postmates', name: 'On-Demand P', displayName: 'Postmates', letter: 'P', color: '#8A8A3A', description: 'On-demand delivery anything' },
  deliveroo: { id: 'deliveroo', name: 'Premium Delivery R', displayName: 'Deliveroo', letter: 'R', color: '#2A8A8A', description: 'Premium food delivery UK & EU' },
};

// ==================== MOCK DATA GENERATORS ====================

const RESTAURANTS = [
  'The Grand Kitchens', 'Dominique\'s Pizzeria', 'McKinley\'s Grill', 'The Spice Heritage',
  'Royal Biryani House', 'The Truffle Club', 'Barbeque Heritage', 'Meghana Estates',
  'The Garden Table', 'Colonel\'s Kitchen', 'Imperial Wok', 'Florentine Bistro',
  'The Heritage Dhaba', 'Café Monarch', 'Saffron Palace', 'The Velvet Spoon',
  'Prestige Grill', 'Maharaja\'s Feast', 'Boulevard Bakes', 'Golden Fork Kitchen',
];

const LOCATIONS = [
  'MG Road Metro', 'Koramangala 5th Block', 'HSR Layout Sector 2', 'Indiranagar 100ft Road',
  'Whitefield Main Rd', 'ITPL Back Gate', 'Jayanagar 4th Block', 'BTM 2nd Stage',
  'Bellandur Outer Ring Rd', 'Marathahalli Bridge', 'Electronic City Phase 1',
  'HSR BDA Complex', 'St. Mark\'s Road', 'Brigade Road', 'Church Street',
  'Cunningham Road', 'Richmond Circle', 'Sadashiv Nagar', 'Malleshwaram 8th Cross',
  'Rajajinagar', 'Yelahanka New Town', 'Hebbal Flyover', 'Nagawara Junction',
];

const CUSTOMERS = [
  'Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield', 'Jayanagar',
  'BTM Layout', 'Marathahalli', 'Electronic City', 'Malleshwaram', 'Hebbal',
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let orderCounter = 0;
export function generateOrderId(): string {
  orderCounter++;
  return `ord-${Date.now()}-${orderCounter}`;
}

export function generateOrder(platforms: PlatformId[]): Order | null {
  if (platforms.length === 0) return null;
  const platform = randomItem(platforms);
  const earnings = randomBetween(30, 85);
  const distance = parseFloat((Math.random() * 6 + 1).toFixed(1));
  const estimatedTime = Math.round(distance * 5 + randomBetween(5, 15));
  const timer = randomBetween(18, 35);
  const rank = randomBetween(1, 5);

  return {
    id: generateOrderId(),
    platform,
    restaurant: randomItem(RESTAURANTS),
    distance,
    pickup: randomItem(LOCATIONS),
    drop: randomItem(LOCATIONS.filter(l => l !== '')) || randomItem(CUSTOMERS),
    earnings,
    estimatedTime,
    rank,
    timer,
    isNew: true,
    createdAt: Date.now(),
  };
}

export function generateStack(connectedPlatforms: PlatformId[]): Order[] | null {
  if (connectedPlatforms.length < 2) return null;
  // Pick 2 different platforms for stacking
  const shuffled = [...connectedPlatforms].sort(() => Math.random() - 0.5);
  const p1 = shuffled[0];
  const p2 = shuffled[1];
  const stackId = `stack-${Date.now()}`;
  const baseEarnings = randomBetween(30, 55);
  const baseDistance = parseFloat((Math.random() * 3 + 1).toFixed(1));
  const pickup = randomItem(LOCATIONS);
  const drop1 = randomItem(CUSTOMERS);
  const drop2 = randomItem(CUSTOMERS.filter(c => c !== drop1));

  const o1: Order = {
    id: generateOrderId(),
    platform: p1,
    restaurant: randomItem(RESTAURANTS),
    distance: baseDistance,
    pickup,
    drop: drop1,
    earnings: baseEarnings,
    estimatedTime: Math.round(baseDistance * 5 + 10),
    rank: 1,
    timer: randomBetween(20, 30),
    isNew: true,
    createdAt: Date.now(),
    stackId,
  };

  const o2: Order = {
    id: generateOrderId(),
    platform: p2,
    restaurant: randomItem(RESTAURANTS),
    distance: parseFloat((baseDistance * 0.6).toFixed(1)),
    pickup: drop1,
    drop: drop2,
    earnings: Math.round(baseEarnings * 0.7),
    estimatedTime: Math.round(baseDistance * 3 + 8),
    rank: 2,
    timer: randomBetween(18, 28),
    isNew: true,
    createdAt: Date.now(),
    stackId,
  };

  return [o1, o2];
}

// ==================== SETTINGS ====================

export interface AppSettings {
  // Profile
  profileName: string;
  profileEmail: string;
  profilePhone: string;

  // Earnings & Finance
  weeklyEarningGoal: number;
  dailyTarget: number;
  currency: string;
  payoutSchedule: 'daily' | 'weekly' | 'monthly';

  // Delivery Preferences
  defaultVehicle: 'bicycle' | 'scooter' | 'car';
  maxDeliveryDistance: number; // km 2-25
  maxDailyKm: number; // 20-200
  breakReminder: boolean;
  breakInterval: 30 | 60 | 90 | 120; // minutes

  // Notifications
  pushNotifications: boolean;
  orderAlerts: boolean;
  earningsAlerts: boolean;
  tipNotifications: boolean;
  surgeAlerts: boolean;
  soundEnabled: boolean;

  // Platform Management
  autoOnlineOnStart: boolean;
  defaultPlatform: PlatformId | 'none';
  acceptStackedOrders: boolean;

  // App Settings
  language: 'en' | 'hi' | 'kn';
  theme: 'light' | 'dark' | 'system';
  dataExportFormat: 'csv' | 'json' | 'pdf';
}

const DEFAULT_SETTINGS: AppSettings = {
  profileName: '',
  profileEmail: '',
  profilePhone: '',
  weeklyEarningGoal: 5000,
  dailyTarget: 1000,
  currency: 'INR',
  payoutSchedule: 'weekly',
  defaultVehicle: 'scooter',
  maxDeliveryDistance: 10,
  maxDailyKm: 80,
  breakReminder: true,
  breakInterval: 60,
  pushNotifications: true,
  orderAlerts: true,
  earningsAlerts: true,
  tipNotifications: true,
  surgeAlerts: true,
  soundEnabled: true,
  autoOnlineOnStart: false,
  defaultPlatform: 'none',
  acceptStackedOrders: true,
  language: 'en',
  theme: 'light',
  dataExportFormat: 'csv',
};

// ==================== STORE ====================

interface GigRiderState {
  // Auth
  isAuthenticated: boolean;
  rider: RiderProfile | null;

  // Online status
  isOnline: boolean;

  // Smart mode
  smartMode: 'auto-rank' | 'first-come';

  // Platforms
  connectedPlatforms: ConnectedPlatform[];

  // Orders
  incomingOrders: Order[];
  acceptedOrderIds: string[];
  declinedOrderIds: string[];

  // Active delivery
  activeDelivery: ActiveDelivery | null;

  // Delivery history
  deliveryHistory: DeliveryRecord[];

  // Auto-accept rules
  autoAcceptRules: AutoAcceptRules;

  // Earnings
  todayEarnings: number;
  todayOrders: number;
  weekEarnings: number;
  monthEarnings: number;
  dailyEarnings: DailyEarning[];
  tipsThisWeek: number;

  // Shifts
  shifts: ShiftSchedule[];

  // Session tracking
  sessionStart: number | null;
  totalOnlineTime: number; // in seconds

  // Notifications
  notifications: Notification[];
  unreadNotificationCount: number;

  // Wallet
  wallet: WalletState;

  // Settings
  settings: AppSettings;

  // Actions
  login: (name: string, phone: string, vehicle: RiderProfile['vehicleType']) => void;
  logout: () => void;
  setOnline: (online: boolean) => void;
  setSmartMode: (mode: 'auto-rank' | 'first-come') => void;
  togglePlatformOnline: (id: PlatformId) => void;
  setAllPlatformsOnline: () => void;
  setAllPlatformsOffline: () => void;
  addPlatform: (id: PlatformId) => void;
  removePlatform: (id: PlatformId) => void;
  addIncomingOrder: (order: Order) => void;
  addIncomingOrders: (orders: Order[]) => void;
  acceptOrder: (orderId: string) => void;
  declineOrder: (orderId: string) => void;
  removeExpiredOrders: () => void;
  completeActiveDelivery: () => void;
  cancelActiveDelivery: () => void;
  updateAutoAcceptRules: (rules: Partial<AutoAcceptRules>) => void;
  updateShift: (index: number, shift: Partial<ShiftSchedule>) => void;
  tickOnlineTime: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  updateWallet: (partial: Partial<WalletState>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  reset: () => void;
}

const DEFAULT_CONNECTED: ConnectedPlatform[] = [
  { id: 'swiggy', isOnline: true, lastOrder: '12 min ago', todayEarnings: 320, todayOrders: 6, rating: 4.9 },
  { id: 'zomato', isOnline: true, lastOrder: '25 min ago', todayEarnings: 280, todayOrders: 5, rating: 4.7 },
  { id: 'ubereats', isOnline: false, lastOrder: '2 hrs ago', todayEarnings: 145, todayOrders: 3, rating: 4.8 },
  { id: 'doordash', isOnline: true, lastOrder: '45 min ago', todayEarnings: 100, todayOrders: 2, rating: 4.6 },
];

const DEFAULT_DAILY_EARNINGS: DailyEarning[] = [
  { day: 'Mon', amount: 1120, orders: 7, isBest: false },
  { day: 'Tue', amount: 1450, orders: 9, isBest: false },
  { day: 'Wed', amount: 980, orders: 6, isBest: false },
  { day: 'Thu', amount: 1680, orders: 11, isBest: true },
  { day: 'Fri', amount: 1320, orders: 8, isBest: false },
  { day: 'Sat', amount: 1100, orders: 7, isBest: false },
  { day: 'Sun', amount: 800, orders: 5, isBest: false },
];

const DEFAULT_SHIFTS: ShiftSchedule[] = [
  { day: 'Today', time: '10:00 AM - 10:00 PM', active: true },
  { day: 'Tomorrow', time: '9:00 AM - 9:00 PM', active: true },
  { day: 'Wednesday', time: 'Not scheduled', active: false },
  { day: 'Thursday', time: 'Not scheduled', active: false },
];

export const useGigRiderStore = create<GigRiderState>()(
  persist(
    (set, get) => ({
      // Auth
      isAuthenticated: false,
      rider: null,

      // Online
      isOnline: true,

      // Smart mode
      smartMode: 'auto-rank',

      // Platforms
      connectedPlatforms: DEFAULT_CONNECTED,

      // Orders
      incomingOrders: [],
      acceptedOrderIds: [],
      declinedOrderIds: [],

      // Active delivery
      activeDelivery: null,

      // Delivery history
      deliveryHistory: [],

      // Auto-accept
      autoAcceptRules: {
        enabled: false,
        minPayout: 35,
        maxDistance: 5,
        preferredPlatforms: { swiggy: true, zomato: true, ubereats: false, doordash: true },
        peakBoost: true,
        smartStack: false,
      },

      // Earnings
      todayEarnings: 845,
      todayOrders: 8,
      weekEarnings: 8450,
      monthEarnings: 32450,
      dailyEarnings: DEFAULT_DAILY_EARNINGS,
      tipsThisWeek: 680,

      // Shifts
      shifts: DEFAULT_SHIFTS,

      // Session
      sessionStart: null,
      totalOnlineTime: 15980, // ~4h 23m in seconds

      // Notifications
      notifications: [
        { id: 'n1', type: 'order_completed', title: 'Delivery Completed', description: 'Royal Biryani House delivery done. Earned ₹65 + ₹15 tip!', timestamp: Date.now() - 1800000, isRead: false },
        { id: 'n2', type: 'earnings_milestone', title: 'Earnings Milestone', description: 'You\'ve crossed ₹8,000 this week! Keep it up.', timestamp: Date.now() - 7200000, isRead: false },
        { id: 'n3', type: 'platform_update', title: 'Swiggy Update', description: 'New surge pricing areas near Koramangala. Go online to benefit.', timestamp: Date.now() - 14400000, isRead: false },
        { id: 'n4', type: 'order_accepted', title: 'Auto-Accepted Order', description: 'Zomato order from The Spice Heritage auto-accepted (₹52).', timestamp: Date.now() - 28800000, isRead: true },
        { id: 'n5', type: 'tip_received', title: 'Tip Received!', description: 'A happy customer tipped you ₹20 for fast delivery.', timestamp: Date.now() - 86400000, isRead: true },
        { id: 'n6', type: 'stack_order', title: 'Smart Stack Match', description: '2 orders on the same route. Combined earnings: ₹95.', timestamp: Date.now() - 172800000, isRead: true },
      ],
      unreadNotificationCount: 3,

      // Wallet
      wallet: {
        balance: Math.round(845 * 0.7), // 70% of todayEarnings
        pendingAmount: Math.round(845 * 0.3), // 30% settlement in progress
        transactions: [
          { id: 'tx-1', type: 'delivery', amount: 65, description: 'Royal Biryani House delivery', platform: 'Swiggy', status: 'completed', timestamp: Date.now() - 1800000 },
          { id: 'tx-2', type: 'tip', amount: 15, description: 'Tip from Royal Biryani order', platform: 'Swiggy', status: 'completed', timestamp: Date.now() - 1800000 },
          { id: 'tx-3', type: 'delivery', amount: 52, description: 'The Spice Heritage delivery', platform: 'Zomato', status: 'completed', timestamp: Date.now() - 3600000 },
          { id: 'tx-4', type: 'delivery', amount: 48, description: 'McKinley\'s Grill delivery', platform: 'Uber Eats', status: 'completed', timestamp: Date.now() - 7200000 },
          { id: 'tx-5', type: 'bonus', amount: 100, description: 'Peak hour surge bonus', platform: 'Swiggy', status: 'completed', timestamp: Date.now() - 14400000 },
          { id: 'tx-6', type: 'delivery', amount: 72, description: 'The Truffle Club delivery', platform: 'Zomato', status: 'completed', timestamp: Date.now() - 21600000 },
          { id: 'tx-7', type: 'incentive', amount: 50, description: 'Weekly completion incentive', platform: 'Swiggy', status: 'pending', timestamp: Date.now() - 28800000 },
          { id: 'tx-8', type: 'withdrawal', amount: -500, description: 'Withdrawal to HDFC Bank', platform: 'GigRider', status: 'completed', timestamp: Date.now() - 43200000 },
          { id: 'tx-9', type: 'delivery', amount: 55, description: 'Imperial Wok delivery', platform: 'Uber Eats', status: 'completed', timestamp: Date.now() - 50400000 },
          { id: 'tx-10', type: 'tip', amount: 20, description: 'Tip from Imperial Wok order', platform: 'Uber Eats', status: 'completed', timestamp: Date.now() - 50400000 },
          { id: 'tx-11', type: 'referral', amount: 200, description: 'Referral bonus - Friend joined', platform: 'GigRider', status: 'completed', timestamp: Date.now() - 86400000 },
          { id: 'tx-12', type: 'payout', amount: -3200, description: 'Weekly payout to HDFC Bank', platform: 'GigRider', status: 'completed', timestamp: Date.now() - 172800000 },
        ],
        bankAccount: 'HDFC Bank ****4523',
        upiId: 'rider@upi',
        payoutSchedule: 'weekly',
        lastPayoutDate: new Date(Date.now() - 172800000).toISOString(),
      },

      // Settings
      settings: DEFAULT_SETTINGS,

      // ---- ACTIONS ----

      login: (name, phone, vehicle) => set({
        isAuthenticated: true,
        rider: {
          name,
          phone,
          vehicleType: vehicle,
          avatar: name.charAt(0).toUpperCase(),
          rating: 4.8,
          totalDeliveries: 3247,
          totalEarnings: 485000,
          memberSince: 'March 2023',
          tier: 'pro',
        },
        sessionStart: Date.now(),
      }),

      logout: () => set({
        isAuthenticated: false,
        rider: null,
        isOnline: true,
        incomingOrders: [],
        acceptedOrderIds: [],
        declinedOrderIds: [],
        activeDelivery: null,
        sessionStart: null,
      }),

      setOnline: (online) => set({ isOnline: online }),

      setSmartMode: (mode) => set({ smartMode: mode }),

      togglePlatformOnline: (id) => set((state) => ({
        connectedPlatforms: state.connectedPlatforms.map(p =>
          p.id === id ? { ...p, isOnline: !p.isOnline } : p
        ),
      })),

      setAllPlatformsOnline: () => set((state) => ({
        connectedPlatforms: state.connectedPlatforms.map(p => ({ ...p, isOnline: true })),
      })),

      setAllPlatformsOffline: () => set((state) => ({
        connectedPlatforms: state.connectedPlatforms.map(p => ({ ...p, isOnline: false })),
      })),

      addPlatform: (id) => set((state) => {
        if (state.connectedPlatforms.find(p => p.id === id)) return state;
        const config = PLATFORMS[id];
        return {
          connectedPlatforms: [...state.connectedPlatforms, {
            id,
            isOnline: false,
            lastOrder: 'Never',
            todayEarnings: 0,
            todayOrders: 0,
            rating: 0,
          }],
          autoAcceptRules: {
            ...state.autoAcceptRules,
            preferredPlatforms: { ...state.autoAcceptRules.preferredPlatforms, [id]: false },
          },
        };
      }),

      removePlatform: (id) => set((state) => ({
        connectedPlatforms: state.connectedPlatforms.filter(p => p.id !== id),
      })),

      addIncomingOrder: (order) => set((state) => {
        // Check auto-accept
        if (state.autoAcceptRules.enabled) {
          const rules = state.autoAcceptRules;
          const platformOnline = state.connectedPlatforms.find(p => p.id === order.platform)?.isOnline;
          if (platformOnline &&
              order.earnings >= rules.minPayout &&
              order.distance <= rules.maxDistance &&
              rules.preferredPlatforms[order.platform]) {
            // Auto-accept
            const newAccepted = [...state.acceptedOrderIds];
            if (!newAccepted.includes(order.id)) newAccepted.push(order.id);
            return {
              incomingOrders: [order, ...state.incomingOrders],
              acceptedOrderIds: newAccepted,
            };
          }
        }
        return { incomingOrders: [order, ...state.incomingOrders] };
      }),

      addIncomingOrders: (orders) => set((state) => {
        const newAccepted = [...state.acceptedOrderIds];
        const processedOrders = orders.map(order => {
          if (state.autoAcceptRules.enabled) {
            const rules = state.autoAcceptRules;
            const platformOnline = state.connectedPlatforms.find(p => p.id === order.platform)?.isOnline;
            if (platformOnline &&
                order.earnings >= rules.minPayout &&
                order.distance <= rules.maxDistance &&
                rules.preferredPlatforms[order.platform]) {
              if (!newAccepted.includes(order.id)) newAccepted.push(order.id);
            }
          }
          return order;
        });
        return {
          incomingOrders: [...processedOrders, ...state.incomingOrders],
          acceptedOrderIds: newAccepted,
        };
      }),

      acceptOrder: (orderId) => set((state) => {
        const newAccepted = [...state.acceptedOrderIds];
        if (!newAccepted.includes(orderId)) newAccepted.push(orderId);

        const order = state.incomingOrders.find(o => o.id === orderId);
        // If no active delivery, start one
        let newActive = state.activeDelivery;
        if (!state.activeDelivery && order) {
          newActive = {
            id: `act-${Date.now()}`,
            platform: order.platform,
            restaurant: order.restaurant,
            customer: order.drop,
            eta: order.estimatedTime,
            earnings: order.earnings,
            startedAt: Date.now(),
          };
        }

        return {
          acceptedOrderIds: newAccepted,
          activeDelivery: newActive,
        };
      }),

      declineOrder: (orderId) => set((state) => {
        const newDeclined = [...state.declinedOrderIds];
        if (!newDeclined.includes(orderId)) newDeclined.push(orderId);
        return { declinedOrderIds: newDeclined };
      }),

      removeExpiredOrders: () => set((state) => {
        const now = Date.now();
        const active = state.incomingOrders.filter(o => {
          const elapsed = (now - o.createdAt) / 1000;
          const declined = state.declinedOrderIds.includes(o.id);
          return elapsed < 40 && !declined;
        });
        return { incomingOrders: active };
      }),

      completeActiveDelivery: () => set((state) => {
        if (!state.activeDelivery) return state;
        const delivery = state.activeDelivery;
        const platform = PLATFORMS[delivery.platform];
        const record: DeliveryRecord = {
          id: delivery.id,
          platform: delivery.platform,
          restaurant: delivery.restaurant,
          customer: delivery.customer,
          earnings: delivery.earnings,
          distance: parseFloat((Math.random() * 4 + 1).toFixed(1)),
          duration: delivery.eta,
          status: 'completed',
          time: 'Just now',
          timestamp: Date.now(),
          rating: Math.random() > 0.3 ? 5 : 4,
          tip: Math.random() > 0.5 ? randomBetween(10, 30) : undefined,
        };

        const newTip = record.tip || 0;

        return {
          activeDelivery: null,
          deliveryHistory: [record, ...state.deliveryHistory],
          todayEarnings: state.todayEarnings + delivery.earnings + newTip,
          todayOrders: state.todayOrders + 1,
          weekEarnings: state.weekEarnings + delivery.earnings + newTip,
          monthEarnings: state.monthEarnings + delivery.earnings + newTip,
          tipsThisWeek: state.tipsThisWeek + newTip,
          connectedPlatforms: state.connectedPlatforms.map(p =>
            p.id === delivery.platform
              ? { ...p, todayEarnings: p.todayEarnings + delivery.earnings, todayOrders: p.todayOrders + 1, lastOrder: 'Just now' }
              : p
          ),
        };
      }),

      cancelActiveDelivery: () => set((state) => {
        if (!state.activeDelivery) return state;
        const delivery = state.activeDelivery;
        const record: DeliveryRecord = {
          id: delivery.id,
          platform: delivery.platform,
          restaurant: delivery.restaurant,
          customer: delivery.customer,
          earnings: 0,
          distance: 0,
          duration: 0,
          status: 'cancelled',
          time: 'Just now',
          timestamp: Date.now(),
        };

        return {
          activeDelivery: null,
          deliveryHistory: [record, ...state.deliveryHistory],
        };
      }),

      updateAutoAcceptRules: (rules) => set((state) => ({
        autoAcceptRules: { ...state.autoAcceptRules, ...rules },
      })),

      updateShift: (index, shift) => set((state) => ({
        shifts: state.shifts.map((s, i) => i === index ? { ...s, ...shift } : s),
      })),

      tickOnlineTime: () => set((state) => ({
        totalOnlineTime: state.totalOnlineTime + 1,
      })),

      addNotification: (notification) => set((state) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
          isRead: false,
        };
        return {
          notifications: [newNotification, ...state.notifications],
          unreadNotificationCount: state.unreadNotificationCount + 1,
        };
      }),

      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
        unreadNotificationCount: Math.max(0, state.unreadNotificationCount - (state.notifications.find(n => n.id === id && !n.isRead) ? 1 : 0)),
      })),

      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadNotificationCount: 0,
      })),

      clearNotifications: () => set({
        notifications: [],
        unreadNotificationCount: 0,
      }),

      updateWallet: (partial) => set((state) => ({
        wallet: { ...state.wallet, ...partial },
      })),

      addTransaction: (transaction) => set((state) => {
        const newTx: Transaction = {
          ...transaction,
          id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        };
        const balanceChange = transaction.type === 'withdrawal' || transaction.type === 'payout'
          ? -Math.abs(transaction.amount)
          : Math.abs(transaction.amount);
        return {
          wallet: {
            ...state.wallet,
            transactions: [newTx, ...state.wallet.transactions],
            balance: state.wallet.balance + balanceChange,
          },
        };
      }),

      updateSettings: (partial) => set((state) => ({
        settings: { ...state.settings, ...partial },
      })),

      reset: () => set({
        isAuthenticated: false,
        rider: null,
        isOnline: true,
        incomingOrders: [],
        acceptedOrderIds: [],
        declinedOrderIds: [],
        activeDelivery: null,
        deliveryHistory: [],
        todayEarnings: 0,
        todayOrders: 0,
        sessionStart: null,
        totalOnlineTime: 0,
        notifications: [],
        unreadNotificationCount: 0,
        wallet: {
          balance: 0,
          pendingAmount: 0,
          transactions: [],
          bankAccount: '',
          upiId: '',
          payoutSchedule: 'weekly',
          lastPayoutDate: null,
        },
        settings: DEFAULT_SETTINGS,
      }),
    }),
    {
      name: 'gigrider-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        rider: state.rider,
        connectedPlatforms: state.connectedPlatforms,
        autoAcceptRules: state.autoAcceptRules,
        deliveryHistory: state.deliveryHistory,
        todayEarnings: state.todayEarnings,
        todayOrders: state.todayOrders,
        weekEarnings: state.weekEarnings,
        monthEarnings: state.monthEarnings,
        dailyEarnings: state.dailyEarnings,
        tipsThisWeek: state.tipsThisWeek,
        shifts: state.shifts,
        totalOnlineTime: state.totalOnlineTime,
        notifications: state.notifications,
        unreadNotificationCount: state.unreadNotificationCount,
        wallet: state.wallet,
        settings: state.settings,
      }),
    }
  )
);
