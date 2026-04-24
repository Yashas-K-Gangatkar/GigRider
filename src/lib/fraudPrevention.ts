/**
 * GigRider Fraud Prevention System
 * 
 * Multi-layer verification to prevent referral abuse:
 * - Device Fingerprinting: One device = one account
 * - IP + Location Cluster Detection: Flag family-farming patterns
 * - 7-Day Hold: Bonus locked for 7 days after qualifying
 * - Minimum Activity: Referred rider must complete 10 deliveries
 * - Aadhaar + Selfie Match: KYC liveness detection
 * - PAN Card Verification: Tax identity cross-check
 * - Bank Account Linking: One bank account = one rider
 */

// ==================== TYPES ====================

export interface DeviceFingerprint {
  deviceId: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: boolean;
  touchSupport: boolean;
  colorDepth: number;
  pixelRatio: number;
  fonts: string[];
  canvasHash: string;
  webglHash: string;
  audioHash: string;
}

export interface LocationCluster {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  ip: string;
}

export interface FraudCheckResult {
  isClean: boolean;
  riskScore: number; // 0-100, higher = more risky
  flags: FraudFlag[];
  recommendation: 'approve' | 'review' | 'reject';
}

export interface FraudFlag {
  type: FraudFlagType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  detail: string;
}

export type FraudFlagType =
  | 'duplicate_device'
  | 'ip_cluster'
  | 'location_cluster'
  | 'suspicious_velocity'
  | 'kyc_mismatch'
  | 'bank_account_duplicate'
  | 'pan_duplicate'
  | 'rapid_referrals'
  | 'low_activity'
  | 'proxy_vpn';

export interface ReferralEligibility {
  referrerEligible: boolean;
  refereeEligible: boolean;
  referrerBonusAmount: number;
  refereeBonusAmount: number;
  holdDaysRemaining: number;
  deliveriesCompleted: number;
  deliveriesRequired: number;
  kycVerified: boolean;
  bankAccountLinked: boolean;
  flags: string[];
}

// ==================== CONSTANTS ====================

/** Minimum deliveries before referral bonus unlocks */
export const MIN_DELIVERIES_FOR_REFERRAL = 10;

/** Referral bonus amounts (in INR) */
export const REFERRER_BONUS = 200;
export const REFEREE_BONUS = 100;

/** Hold period in days before bonus can be withdrawn */
export const HOLD_PERIOD_DAYS = 7;

/** Max accounts allowed from same IP in 30 days */
export const MAX_ACCOUNTS_PER_IP = 3;

/** Max accounts allowed from same device ever */
export const MAX_ACCOUNTS_PER_DEVICE = 1;

/** Max referrals from one person in 30 days before flagging */
export const MAX_REFERRALS_PER_MONTH = 10;

/** Max accounts within 500m radius in 24 hours */
export const MAX_ACCOUNTS_PER_LOCATION = 5;

/** Risk score thresholds */
const RISK_THRESHOLD_REJECT = 70;
const RISK_THRESHOLD_REVIEW = 40;

// ==================== DEVICE FINGERPRINTING ====================

/**
 * Generate a device fingerprint using browser characteristics.
 * This creates a unique identifier for the device to prevent
 * multiple accounts from the same phone/computer.
 */
export function generateDeviceFingerprint(): DeviceFingerprint {
  if (typeof window === 'undefined') {
    return getEmptyFingerprint();
  }

  const nav = window.navigator;
  const screen = window.screen;

  return {
    deviceId: '', // Will be computed below
    userAgent: nav.userAgent,
    screenResolution: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: nav.language,
    platform: nav.platform || 'unknown',
    cookieEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack === '1',
    touchSupport: 'ontouchstart' in window || nav.maxTouchPoints > 0,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio || 1,
    fonts: detectFonts(),
    canvasHash: generateCanvasHash(),
    webglHash: generateWebGLHash(),
    audioHash: generateAudioHash(),
  };
}

/**
 * Compute a stable device ID from fingerprint components.
 * Uses a simple hash of immutable characteristics.
 */
export function computeDeviceId(fp: DeviceFingerprint): string {
  const components = [
    fp.userAgent,
    fp.screenResolution,
    fp.timezone,
    fp.language,
    fp.platform,
    fp.colorDepth.toString(),
    fp.pixelRatio.toString(),
    fp.canvasHash,
    fp.webglHash,
    fp.audioHash,
  ];

  const raw = components.join('||');
  return hashString(raw);
}

/**
 * Check if a device is already registered with another account.
 * Returns the existing account ID if found, null otherwise.
 */
export async function checkDeviceDuplicate(
  deviceId: string,
  currentRiderId: string
): Promise<string | null> {
  try {
    const res = await fetch('/api/fraud-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'device_duplicate',
        deviceId,
        riderId: currentRiderId,
      }),
    });
    const data = await res.json();
    return data.existingRiderId || null;
  } catch {
    // If API is not available, allow through but log
    console.warn('[FraudPrevention] Device check API unavailable, allowing through');
    return null;
  }
}

// ==================== IP & LOCATION CLUSTER DETECTION ====================

/**
 * Get current IP address from external service.
 */
export async function getCurrentIP(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}

/**
 * Get current geolocation position.
 */
export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
}

/**
 * Calculate distance between two coordinates using Haversine formula.
 * Returns distance in meters.
 */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Check for IP and location clusters.
 * Flags if too many accounts are being created from the same
 * IP address or geographic location (family-farming pattern).
 */
export async function checkLocationCluster(
  ip: string,
  latitude: number,
  longitude: number,
  riderId: string
): Promise<FraudFlag[]> {
  const flags: FraudFlag[] = [];

  try {
    const res = await fetch('/api/fraud-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'location_cluster',
        ip,
        latitude,
        longitude,
        riderId,
      }),
    });
    const data = await res.json();

    if (data.ipAccountCount >= MAX_ACCOUNTS_PER_IP) {
      flags.push({
        type: 'ip_cluster',
        severity: 'high',
        message: `${data.ipAccountCount} accounts from same IP address`,
        detail: `Detected ${data.ipAccountCount} accounts registered from IP ${ip} in the last 30 days. Maximum allowed: ${MAX_ACCOUNTS_PER_IP}.`,
      });
    }

    if (data.locationAccountCount >= MAX_ACCOUNTS_PER_LOCATION) {
      flags.push({
        type: 'location_cluster',
        severity: 'high',
        message: `${data.locationAccountCount} accounts near same location`,
        detail: `Detected ${data.locationAccountCount} accounts within 500m radius in the last 24 hours. Maximum allowed: ${MAX_ACCOUNTS_PER_LOCATION}.`,
      });
    }

    // Check for VPN/Proxy
    if (data.isVPN || data.isProxy) {
      flags.push({
        type: 'proxy_vpn',
        severity: 'medium',
        message: 'VPN or Proxy detected',
        detail: data.isVPN
          ? 'VPN connection detected. May indicate attempt to mask location.'
          : 'Proxy server detected. May indicate attempt to mask IP address.',
      });
    }
  } catch {
    console.warn('[FraudPrevention] Location cluster check API unavailable');
  }

  return flags;
}

// ==================== 7-DAY HOLD SYSTEM ====================

/**
 * Calculate the hold status for a referral bonus.
 * Bonus is locked for HOLD_PERIOD_DAYS (7) after qualifying.
 */
export function calculateHoldStatus(
  qualifyingDate: Date, // Date when the referral qualified (10 deliveries completed)
  now: Date = new Date()
): {
  isOnHold: boolean;
  daysRemaining: number;
  holdEndDate: Date;
  canWithdraw: boolean;
} {
  const holdEndDate = new Date(qualifyingDate);
  holdEndDate.setDate(holdEndDate.getDate() + HOLD_PERIOD_DAYS);

  const msRemaining = holdEndDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

  return {
    isOnHold: now < holdEndDate,
    daysRemaining,
    holdEndDate,
    canWithdraw: now >= holdEndDate,
  };
}

/**
 * Check if a referral bonus transaction is still in its hold period.
 */
export function isReferralBonusOnHold(
  transactionTimestamp: number,
  qualifyingDate?: number
): {
  onHold: boolean;
  daysRemaining: number;
  message: string;
} {
  // If we have a qualifying date, use it; otherwise the transaction date
  const referenceDate = qualifyingDate || transactionTimestamp;
  const holdStatus = calculateHoldStatus(new Date(referenceDate));

  if (!holdStatus.isOnHold) {
    return {
      onHold: false,
      daysRemaining: 0,
      message: 'Bonus is available for withdrawal',
    };
  }

  return {
    onHold: true,
    daysRemaining: holdStatus.daysRemaining,
    message: `Referral bonus on hold for ${holdStatus.daysRemaining} more day${holdStatus.daysRemaining !== 1 ? 's' : ''} (fraud prevention)`,
  };
}

// ==================== REFERRAL ELIGIBILITY ====================

/**
 * Check full referral eligibility for both referrer and referee.
 * All conditions must be met before any bonus is paid.
 */
export function checkReferralEligibility(params: {
  referrerId: string;
  refereeId: string;
  refereeDeliveriesCompleted: number;
  refereeKycVerified: boolean;
  refereeBankLinked: boolean;
  referralCreatedAt: number;
  existingFlags: FraudFlag[];
}): ReferralEligibility {
  const {
    referrerId,
    refereeId,
    refereeDeliveriesCompleted,
    refereeKycVerified,
    refereeBankLinked,
    referralCreatedAt,
    existingFlags,
  } = params;

  const flags: string[] = [];
  let referrerEligible = true;
  let refereeEligible = true;

  // 1. Minimum activity check - 10 deliveries required
  if (refereeDeliveriesCompleted < MIN_DELIVERIES_FOR_REFERRAL) {
    referrerEligible = false;
    refereeEligible = false;
    flags.push(
      `Referee must complete ${MIN_DELIVERIES_FOR_REFERRAL} deliveries (${refereeDeliveriesCompleted}/${MIN_DELIVERIES_FOR_REFERRAL} done)`
    );
  }

  // 2. KYC verification required
  if (!refereeKycVerified) {
    referrerEligible = false;
    refereeEligible = false;
    flags.push('Referee must complete KYC verification (Aadhaar + Selfie)');
  }

  // 3. Bank account linking required
  if (!refereeBankLinked) {
    referrerEligible = false;
    flags.push('Referee must link a bank account');
  }

  // 4. 7-day hold check
  const holdStatus = calculateHoldStatus(new Date(referralCreatedAt));
  if (holdStatus.isOnHold) {
    flags.push(`7-day hold: ${holdStatus.daysRemaining} day(s) remaining`);
    // Hold doesn't make them ineligible, it just delays payout
  }

  // 5. Fraud flags check
  const criticalFlags = existingFlags.filter(f => f.severity === 'critical' || f.severity === 'high');
  if (criticalFlags.length > 0) {
    referrerEligible = false;
    refereeEligible = false;
    criticalFlags.forEach(f => flags.push(`FRAUD: ${f.message}`));
  }

  return {
    referrerEligible,
    refereeEligible,
    referrerBonusAmount: REFERRER_BONUS,
    refereeBonusAmount: REFEREE_BONUS,
    holdDaysRemaining: holdStatus.daysRemaining,
    deliveriesCompleted: refereeDeliveriesCompleted,
    deliveriesRequired: MIN_DELIVERIES_FOR_REFERRAL,
    kycVerified: refereeKycVerified,
    bankAccountLinked: refereeBankLinked,
    flags,
  };
}

// ==================== COMPREHENSIVE FRAUD CHECK ====================

/**
 * Run a comprehensive fraud check for a new account registration or referral.
 * Combines all fraud detection layers into a single risk assessment.
 */
export async function runFraudCheck(params: {
  riderId: string;
  phone: string;
  referralCode?: string;
}): Promise<FraudCheckResult> {
  const { riderId, phone } = params;
  const flags: FraudFlag[] = [];

  // 1. Device fingerprint check
  try {
    const fp = generateDeviceFingerprint();
    fp.deviceId = computeDeviceId(fp);
    const existingUser = await checkDeviceDuplicate(fp.deviceId, riderId);
    if (existingUser) {
      flags.push({
        type: 'duplicate_device',
        severity: 'critical',
        message: 'Device already registered',
        detail: `This device is already linked to account ${existingUser}. One device per account only.`,
      });
    }

    // Store device fingerprint
    await fetch('/api/fraud-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'register_device',
        riderId,
        deviceId: fp.deviceId,
        fingerprint: fp,
      }),
    });
  } catch {
    console.warn('[FraudPrevention] Device fingerprint check failed');
  }

  // 2. IP + Location cluster check
  try {
    const ip = await getCurrentIP();
    let location: GeolocationPosition | null = null;
    try {
      location = await getCurrentLocation();
    } catch {
      // User denied location permission - flag as low severity
      flags.push({
        type: 'location_cluster',
        severity: 'low',
        message: 'Location access denied',
        detail: 'Could not verify location. Some fraud checks are limited.',
      });
    }

    if (location) {
      const locationFlags = await checkLocationCluster(
        ip,
        location.coords.latitude,
        location.coords.longitude,
        riderId
      );
      flags.push(...locationFlags);
    }
  } catch {
    console.warn('[FraudPrevention] IP/Location check failed');
  }

  // Calculate risk score
  const riskScore = calculateRiskScore(flags);

  return {
    isClean: riskScore < RISK_THRESHOLD_REVIEW,
    riskScore,
    flags,
    recommendation: getRecommendation(riskScore),
  };
}

// ==================== RISK SCORING ====================

/**
 * Calculate a risk score (0-100) from fraud flags.
 * Higher score = more risky.
 */
export function calculateRiskScore(flags: FraudFlag[]): number {
  const severityWeights: Record<FraudFlag['severity'], number> = {
    low: 5,
    medium: 15,
    high: 30,
    critical: 50,
  };

  let score = 0;
  for (const flag of flags) {
    score += severityWeights[flag.severity];
  }
  return Math.min(100, score);
}

function getRecommendation(riskScore: number): FraudCheckResult['recommendation'] {
  if (riskScore >= RISK_THRESHOLD_REJECT) return 'reject';
  if (riskScore >= RISK_THRESHOLD_REVIEW) return 'review';
  return 'approve';
}

// ==================== HELPER FUNCTIONS ====================

function getEmptyFingerprint(): DeviceFingerprint {
  return {
    deviceId: '',
    userAgent: '',
    screenResolution: '',
    timezone: '',
    language: '',
    platform: '',
    cookieEnabled: false,
    doNotTrack: false,
    touchSupport: false,
    colorDepth: 0,
    pixelRatio: 1,
    fonts: [],
    canvasHash: '',
    webglHash: '',
    audioHash: '',
  };
}

/**
 * Simple string hashing (djb2 algorithm) for device ID generation.
 */
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  // Convert to hex and take first 16 chars
  return (hash >>> 0).toString(16).padStart(8, '0') +
    ((hash * 31) >>> 0).toString(16).padStart(8, '0');
}

/**
 * Detect available fonts (limited set for performance).
 */
function detectFonts(): string[] {
  if (typeof document === 'undefined') return [];

  const testFonts = [
    'Arial', 'Verdana', 'Helvetica', 'Times New Roman',
    'Georgia', 'Courier New', 'Comic Sans MS', 'Impact',
    'Trebuchet MS', 'Palatino', 'Lucida Console',
  ];

  const baseFonts = ['monospace'];
  const detected: string[] = [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return detected;

  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';

  for (const font of testFonts) {
    let found = false;
    for (const base of baseFonts) {
      ctx.font = `${testSize} ${base}`;
      const baseWidth = ctx.measureText(testString).width;
      ctx.font = `${testSize} '${font}', ${base}`;
      const testWidth = ctx.measureText(testString).width;
      if (baseWidth !== testWidth) {
        found = true;
        break;
      }
    }
    if (found) detected.push(font);
  }

  return detected;
}

/**
 * Generate canvas fingerprint hash.
 * Draws unique patterns that differ per device/browser.
 */
function generateCanvasHash(): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 50;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Draw unique patterns
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('GigRider-FP', 2, 15);
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.fillText('GigRider-FP', 4, 17);

  const dataUrl = canvas.toDataURL();
  return hashString(dataUrl);
}

/**
 * Generate WebGL fingerprint hash.
 * Uses GPU renderer info for device identification.
 */
function generateWebGLHash(): string {
  if (typeof document === 'undefined') return '';

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'no-webgl';

    const glContext = gl as WebGLRenderingContext;
    const debugInfo = glContext.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'no-debug-info';

    const vendor = glContext.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = glContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return hashString(`${vendor}||${renderer}`);
  } catch {
    return 'webgl-error';
  }
}

/**
 * Generate audio fingerprint hash.
 * Uses AudioContext characteristics for device identification.
 */
function generateAudioHash(): string {
  if (typeof window === 'undefined') return '';
  if (!window.AudioContext && !(window as unknown as { webkitAudioContext: unknown }).webkitAudioContext) return 'no-audio';

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const analyser = ctx.createAnalyser();
    const gain = ctx.createGain();
    const scriptProcessor = ctx.createScriptProcessor(4096, 1, 1);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);

    const info = `${ctx.sampleRate}|${oscillator.frequency.value}|${analyser.fftSize}|${scriptProcessor.bufferSize}`;
    ctx.close();
    return hashString(info);
  } catch {
    return 'audio-error';
  }
}
