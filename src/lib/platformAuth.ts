// ==================== PLATFORM INTEGRATION FRAMEWORK ====================
// Architecture for connecting to real gig platforms.
// Since Swiggy/Zomato/UberEats don't have public rider APIs,
// we build a framework that can be upgraded to real API integration
// when platforms provide access.

export interface PlatformAuthProvider {
  id: string;
  name: string;
  displayName: string;
  color: string;
  icon: string; // letter icon
  authUrl: string; // OAuth URL (real or simulated)
  scope: string[]; // Required permissions
  status: 'available' | 'coming_soon' | 'beta';
  features: PlatformFeature[];
  description: string;
}

export interface PlatformFeature {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

export interface PlatformConnection {
  platformId: string;
  isConnected: boolean;
  connectedAt?: string;
  accessToken?: string; // Encrypted
  refreshToken?: string; // Encrypted
  scopes: string[];
  lastSync?: string;
  syncStatus: 'idle' | 'syncing' | 'error';
  error?: string;
}

// Platform definitions
export const PLATFORM_PROVIDERS: Record<string, PlatformAuthProvider> = {
  'swiggy': {
    id: 'swiggy',
    name: 'swiggy',
    displayName: 'Swiggy',
    color: '#B87333',
    icon: 'S',
    authUrl: 'https://partner.swiggy.com/oauth/authorize', // Simulated
    scope: ['orders', 'earnings', 'profile', 'ratings'],
    status: 'beta',
    description: "India's largest food delivery platform",
    features: [
      { id: 'orders', name: 'Live Orders', description: 'Receive and manage orders in real-time', available: true },
      { id: 'earnings', name: 'Earnings Sync', description: 'Auto-sync earnings data', available: true },
      { id: 'ratings', name: 'Ratings', description: 'View customer ratings and feedback', available: true },
      { id: 'payouts', name: 'Payout Info', description: 'View payout schedule and history', available: false },
    ],
  },
  'zomato': {
    id: 'zomato',
    name: 'zomato',
    displayName: 'Zomato',
    color: '#943540',
    icon: 'Z',
    authUrl: 'https://partner.zomato.com/oauth/authorize',
    scope: ['orders', 'earnings', 'profile'],
    status: 'beta',
    description: 'Food delivery & dining out',
    features: [
      { id: 'orders', name: 'Live Orders', description: 'Receive and manage orders', available: true },
      { id: 'earnings', name: 'Earnings Sync', description: 'Auto-sync earnings data', available: true },
      { id: 'ratings', name: 'Ratings', description: 'View customer ratings', available: false },
    ],
  },
  'ubereats': {
    id: 'ubereats',
    name: 'uber-eats',
    displayName: 'Uber Eats',
    color: '#2C7A5F',
    icon: 'U',
    authUrl: 'https://auth.uber.com/oauth/authorize',
    scope: ['delivery', 'earnings', 'profile'],
    status: 'available',
    description: 'Global meal delivery platform',
    features: [
      { id: 'delivery', name: 'Delivery Queue', description: 'View and accept deliveries', available: true },
      { id: 'earnings', name: 'Earnings', description: 'Track earnings and incentives', available: true },
      { id: 'navigation', name: 'In-App Navigation', description: 'Turn-by-turn directions', available: true },
      { id: 'ratings', name: 'Ratings', description: 'Customer ratings', available: true },
    ],
  },
  'doordash': {
    id: 'doordash',
    name: 'doordash',
    displayName: 'DoorDash',
    color: '#A84020',
    icon: 'D',
    authUrl: 'https://auth.doordash.com/oauth/authorize',
    scope: ['deliveries', 'earnings', 'profile'],
    status: 'coming_soon',
    description: 'US delivery powerhouse',
    features: [
      { id: 'deliveries', name: 'Deliveries', description: 'View and accept dash offers', available: false },
      { id: 'earnings', name: 'Earnings', description: 'Track dash earnings', available: false },
    ],
  },
  'grubhub': {
    id: 'grubhub',
    name: 'grubhub',
    displayName: 'Grubhub',
    color: '#9E6B2F',
    icon: 'G',
    authUrl: 'https://auth.grubhub.com/oauth/authorize',
    scope: ['orders', 'earnings', 'profile'],
    status: 'coming_soon',
    description: 'Food delivery across US cities',
    features: [
      { id: 'orders', name: 'Orders', description: 'View and manage orders', available: false },
      { id: 'earnings', name: 'Earnings', description: 'Track earnings', available: false },
    ],
  },
  'instacart': {
    id: 'instacart',
    name: 'instacart',
    displayName: 'Instacart',
    color: '#3A7A3A',
    icon: 'I',
    authUrl: 'https://auth.instacart.com/oauth/authorize',
    scope: ['orders', 'earnings'],
    status: 'coming_soon',
    description: 'Grocery delivery & pickup',
    features: [
      { id: 'orders', name: 'Orders', description: 'View and manage grocery orders', available: false },
      { id: 'earnings', name: 'Earnings', description: 'Track earnings', available: false },
    ],
  },
  'postmates': {
    id: 'postmates',
    name: 'postmates',
    displayName: 'Postmates',
    color: '#8A8A3A',
    icon: 'P',
    authUrl: 'https://auth.postmates.com/oauth/authorize',
    scope: ['deliveries', 'earnings'],
    status: 'coming_soon',
    description: 'On-demand delivery anything',
    features: [
      { id: 'deliveries', name: 'Deliveries', description: 'View and accept deliveries', available: false },
      { id: 'earnings', name: 'Earnings', description: 'Track earnings', available: false },
    ],
  },
  'deliveroo': {
    id: 'deliveroo',
    name: 'deliveroo',
    displayName: 'Deliveroo',
    color: '#2A8A8A',
    icon: 'R',
    authUrl: 'https://auth.deliveroo.com/oauth/authorize',
    scope: ['orders', 'earnings', 'profile'],
    status: 'beta',
    description: 'Premium food delivery UK & EU',
    features: [
      { id: 'orders', name: 'Orders', description: 'View and manage orders', available: true },
      { id: 'earnings', name: 'Earnings', description: 'Track earnings', available: true },
      { id: 'ratings', name: 'Ratings', description: 'View customer ratings', available: false },
    ],
  },
};

// Get providers grouped by status
export function getProvidersByStatus(): {
  available: PlatformAuthProvider[];
  beta: PlatformAuthProvider[];
  comingSoon: PlatformAuthProvider[];
} {
  const providers = Object.values(PLATFORM_PROVIDERS);
  return {
    available: providers.filter(p => p.status === 'available'),
    beta: providers.filter(p => p.status === 'beta'),
    comingSoon: providers.filter(p => p.status === 'coming_soon'),
  };
}

// Simulated OAuth flow
export async function initiatePlatformAuth(
  platformId: string
): Promise<{ success: boolean; authUrl?: string; message: string }> {
  const provider = PLATFORM_PROVIDERS[platformId];
  if (!provider) return { success: false, message: 'Unknown platform' };

  if (provider.status === 'coming_soon') {
    return {
      success: false,
      message: `${provider.displayName} integration is coming soon! We're working with them to enable access.`,
    };
  }

  // In production, this would redirect to the OAuth URL
  // For now, we simulate the flow
  return {
    success: true,
    authUrl: provider.authUrl,
    message: `Connecting to ${provider.displayName}... In production, this would redirect to their OAuth flow.`,
  };
}

// Verify platform connection (simulated)
export async function verifyPlatformConnection(
  platformId: string,
  _code: string
): Promise<PlatformConnection> {
  const provider = PLATFORM_PROVIDERS[platformId];

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    platformId,
    isConnected: true,
    connectedAt: new Date().toISOString(),
    scopes: provider?.scope || [],
    lastSync: new Date().toISOString(),
    syncStatus: 'idle',
  };
}

// Sync platform data (simulated)
export async function syncPlatformData(
  platformId: string
): Promise<{ success: boolean; syncedAt: string; recordsSynced: number }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    syncedAt: new Date().toISOString(),
    recordsSynced: Math.floor(Math.random() * 20) + 5,
  };
}

// Simple encryption for localStorage (NOT production-grade)
function simpleEncrypt(text: string): string {
  return btoa(encodeURIComponent(text));
}

function simpleDecrypt(encoded: string): string {
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    return '';
  }
}

// Save platform connection to localStorage
export function savePlatformConnection(connection: PlatformConnection): void {
  const connections = getStoredConnections();
  connections[connection.platformId] = {
    ...connection,
    accessToken: connection.accessToken
      ? simpleEncrypt(connection.accessToken)
      : undefined,
    refreshToken: connection.refreshToken
      ? simpleEncrypt(connection.refreshToken)
      : undefined,
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      'gigrider_platform_connections',
      JSON.stringify(connections)
    );
  }
}

// Get stored connections from localStorage
export function getStoredConnections(): Record<string, PlatformConnection> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('gigrider_platform_connections');
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, PlatformConnection>;
    // Decrypt tokens
    Object.values(parsed).forEach((conn) => {
      if (conn.accessToken) conn.accessToken = simpleDecrypt(conn.accessToken);
      if (conn.refreshToken)
        conn.refreshToken = simpleDecrypt(conn.refreshToken);
    });
    return parsed;
  } catch {
    return {};
  }
}

// Remove platform connection
export function removePlatformConnection(platformId: string): void {
  const connections = getStoredConnections();
  delete connections[platformId];
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      'gigrider_platform_connections',
      JSON.stringify(connections)
    );
  }
}

// Join waitlist for coming_soon platforms (simulated)
export async function joinWaitlist(
  platformId: string,
  email: string
): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const provider = PLATFORM_PROVIDERS[platformId];
  if (!provider) return { success: false, message: 'Unknown platform' };

  // Save email to localStorage for demo
  if (typeof window !== 'undefined') {
    const waitlist = JSON.parse(
      localStorage.getItem('gigrider_waitlist') || '{}'
    ) as Record<string, string[]>;
    if (!waitlist[platformId]) waitlist[platformId] = [];
    if (!waitlist[platformId].includes(email)) {
      waitlist[platformId].push(email);
    }
    localStorage.setItem('gigrider_waitlist', JSON.stringify(waitlist));
  }

  return {
    success: true,
    message: `You've been added to the ${provider.displayName} waitlist! We'll notify you when access is available.`,
  };
}
