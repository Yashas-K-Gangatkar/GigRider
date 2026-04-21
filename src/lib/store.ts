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
  acceptedOrderIds: Set<string>;
  declinedOrderIds: Set<string>;

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
      acceptedOrderIds: new Set<string>(),
      declinedOrderIds: new Set<string>(),

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
        acceptedOrderIds: new Set(),
        declinedOrderIds: new Set(),
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
            const newAccepted = new Set(state.acceptedOrderIds);
            newAccepted.add(order.id);
            return {
              incomingOrders: [order, ...state.incomingOrders],
              acceptedOrderIds: newAccepted,
            };
          }
        }
        return { incomingOrders: [order, ...state.incomingOrders] };
      }),

      addIncomingOrders: (orders) => set((state) => {
        const newAccepted = new Set(state.acceptedOrderIds);
        const processedOrders = orders.map(order => {
          if (state.autoAcceptRules.enabled) {
            const rules = state.autoAcceptRules;
            const platformOnline = state.connectedPlatforms.find(p => p.id === order.platform)?.isOnline;
            if (platformOnline &&
                order.earnings >= rules.minPayout &&
                order.distance <= rules.maxDistance &&
                rules.preferredPlatforms[order.platform]) {
              newAccepted.add(order.id);
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
        const newAccepted = new Set(state.acceptedOrderIds);
        newAccepted.add(orderId);

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
        const newDeclined = new Set(state.declinedOrderIds);
        newDeclined.add(orderId);
        return { declinedOrderIds: newDeclined };
      }),

      removeExpiredOrders: () => set((state) => {
        const now = Date.now();
        const active = state.incomingOrders.filter(o => {
          const elapsed = (now - o.createdAt) / 1000;
          const accepted = state.acceptedOrderIds.has(o.id);
          const declined = state.declinedOrderIds.has(o.id);
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

      reset: () => set({
        isAuthenticated: false,
        rider: null,
        isOnline: true,
        incomingOrders: [],
        acceptedOrderIds: new Set(),
        declinedOrderIds: new Set(),
        activeDelivery: null,
        deliveryHistory: [],
        todayEarnings: 0,
        todayOrders: 0,
        sessionStart: null,
        totalOnlineTime: 0,
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
      }),
    }
  )
);
