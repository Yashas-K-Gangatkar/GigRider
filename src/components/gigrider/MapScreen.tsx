'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGigRiderStore, PLATFORMS } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import {
  Navigation,
  MapPin,
  Crosshair,
  Zap,
  Package,
  ChevronRight,
  Loader2,
  Wifi,
  WifiOff,
} from 'lucide-react';

// Bangalore coordinates for default
const BANGALORE_CENTER: [number, number] = [12.9716, 77.5946];

// Simulated hot zones (high demand areas)
const HOT_ZONES = [
  { id: 'hz1', name: 'Koramangala', position: [12.9352, 77.6245] as [number, number], radius: 800, intensity: 0.6 },
  { id: 'hz2', name: 'Indiranagar', position: [12.9784, 77.6408] as [number, number], radius: 600, intensity: 0.8 },
  { id: 'hz3', name: 'HSR Layout', position: [12.9116, 77.6389] as [number, number], radius: 700, intensity: 0.5 },
  { id: 'hz4', name: 'Whitefield', position: [12.9698, 77.7500] as [number, number], radius: 900, intensity: 0.4 },
  { id: 'hz5', name: 'MG Road', position: [12.9756, 77.6070] as [number, number], radius: 500, intensity: 0.7 },
];

// Platform zone colors
const PLATFORM_ZONE_COLORS: Record<string, string> = {
  swiggy: '#B87333',
  zomato: '#943540',
  ubereats: '#2C7A5F',
  doordash: '#A84020',
};

interface MapScreenProps {
  onBack?: () => void;
}

function MapContent({ onBack }: MapScreenProps) {
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [riderPosition, setRiderPosition] = useState<[number, number]>(BANGALORE_CENTER);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const watchRef = useRef<number | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const activeDelivery = useGigRiderStore((s) => s.activeDelivery);
  const connectedPlatforms = useGigRiderStore((s) => s.connectedPlatforms);
  const isOnline = useGigRiderStore((s) => s.isOnline);

  // Simulated pickup/dropoff locations for active delivery
  const deliveryLocations = activeDelivery
    ? {
        pickup: {
          position: [riderPosition[0] + 0.008, riderPosition[1] - 0.005] as [number, number],
          label: activeDelivery.restaurant,
        },
        dropoff: {
          position: [riderPosition[0] - 0.006, riderPosition[1] + 0.01] as [number, number],
          label: activeDelivery.customer,
        },
      }
    : null;

  // Load Leaflet on mount (client only)
  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      try {
        const L = (await import('leaflet')).default;
        const rl = await import('react-leaflet');

        if (cancelled) return;

        // Create custom icons
        const riderIcon = L.divIcon({
          html: '<div style="width:20px;height:20px;background:#1B2A4A;border:3px solid #C9A96E;border-radius:50%;box-shadow:0 2px 8px rgba(27,42,74,0.4);"></div>',
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const pickupIcon = L.divIcon({
          html: '<div style="width:24px;height:24px;background:#2C4A3E;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(44,74,62,0.4);"><span style="color:white;font-size:10px;font-weight:bold;">P</span></div>',
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const dropoffIcon = L.divIcon({
          html: '<div style="width:24px;height:24px;background:#C9A96E;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(201,169,110,0.4);"><span style="color:white;font-size:10px;font-weight:bold;">D</span></div>',
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const hotZoneIcon = L.divIcon({
          html: '<div style="width:16px;height:16px;background:#722F37;border:2px solid #C9A96E;border-radius:50%;"></div>',
          className: '',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        // Build the map
        const container = document.getElementById('gigrider-map');
        if (!container || cancelled) return;

        const map = L.map(container, {
          center: riderPosition,
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        });
        mapInstanceRef.current = map;

        // Add CartoDB Positron tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OSM &copy; CARTO',
        }).addTo(map);

        // Rider position marker
        const riderMarker = L.marker(riderPosition, { icon: riderIcon }).addTo(map);
        riderMarker.bindPopup('<strong style="font-family:var(--font-lora),serif">Your Position</strong>');

        // Hot zones
        HOT_ZONES.forEach((zone) => {
          L.circle(zone.position, {
            radius: zone.radius,
            color: '#722F37',
            fillColor: '#722F37',
            fillOpacity: zone.intensity * 0.2,
            weight: 1,
            opacity: 0.5,
          }).addTo(map).bindPopup(`<div style="font-family:var(--font-lora),serif"><strong>${zone.name}</strong><br><span style="color:#722F37">High Demand Zone</span></div>`);

          L.marker(zone.position, { icon: hotZoneIcon }).addTo(map).bindPopup(`<div style="font-family:var(--font-lora),serif"><strong>${zone.name}</strong><br>Surge: ${Math.round(zone.intensity * 100)}%</div>`);
        });

        // Platform zones
        connectedPlatforms.filter(p => p.isOnline).forEach((platform, index) => {
          const config = PLATFORMS[platform.id];
          const color = PLATFORM_ZONE_COLORS[platform.id] || '#7A7168';
          const offset = index * 0.003;
          L.circle([riderPosition[0] + offset, riderPosition[1] - offset], {
            radius: 1500 + index * 300,
            color: color,
            fillColor: color,
            fillOpacity: 0.06,
            weight: 1.5,
            opacity: 0.3,
            dashArray: '5 5',
          }).addTo(map).bindPopup(`<div style="font-family:var(--font-lora),serif"><strong style="color:${color}">${config?.displayName || platform.id}</strong><br>Service Zone</div>`);
        });

        // Delivery markers (will be added/updated separately)
        let pickupMarker: L.Marker | null = null;
        let dropoffMarker: L.Marker | null = null;

        function updateDeliveryMarkers() {
          // Remove old markers
          if (pickupMarker) { map.removeLayer(pickupMarker); pickupMarker = null; }
          if (dropoffMarker) { map.removeLayer(dropoffMarker); dropoffMarker = null; }

          const ad = useGigRiderStore.getState().activeDelivery;
          const rp = useGigRiderStore.getState().settings; // not used but need current pos

          if (ad) {
            const currentPos = riderPosition;
            const pickupPos: [number, number] = [currentPos[0] + 0.008, currentPos[1] - 0.005];
            const dropoffPos: [number, number] = [currentPos[0] - 0.006, currentPos[1] + 0.01];

            pickupMarker = L.marker(pickupPos, { icon: pickupIcon }).addTo(map);
            pickupMarker.bindPopup(`<div style="font-family:var(--font-lora),serif"><strong>Pickup</strong><br>${ad.restaurant}</div>`);

            dropoffMarker = L.marker(dropoffPos, { icon: dropoffIcon }).addTo(map);
            dropoffMarker.bindPopup(`<div style="font-family:var(--font-lora),serif"><strong>Drop-off</strong><br>${ad.customer}</div>`);
          }
        }

        // Initial delivery markers
        updateDeliveryMarkers();

        // Subscribe to store changes for delivery updates
        const unsub = useGigRiderStore.subscribe(() => {
          updateDeliveryMarkers();
        });

        // Update rider position periodically
        const positionInterval = setInterval(() => {
          const newPos = useGigRiderStore.getState().isOnline
            ? riderPosition
            : riderPosition;
          // Rider marker position will be updated by geolocation watch
        }, 5000);

        setLeafletLoaded(true);

        // Store cleanup references
        (window as Record<string, unknown>).__gigriderMapCleanup = () => {
          unsub();
          clearInterval(positionInterval);
          map.remove();
        };
      } catch (err) {
        console.error('Failed to load map:', err);
        setIsLocating(false);
      }
    }

    loadMap();

    return () => {
      cancelled = true;
      const cleanup = (window as Record<string, unknown>).__gigriderMapCleanup as (() => void) | undefined;
      if (cleanup) cleanup();
    };
  }, []);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPos: [number, number] = [position.coords.latitude, position.coords.longitude];
        setRiderPosition(newPos);
        setIsLocating(false);
        // Update map center if map exists
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(newPos, 14);
        }
      },
      () => {
        setLocationError('Using default location');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    // Watch position for real-time tracking (update every 5 seconds)
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newPos: [number, number] = [position.coords.latitude, position.coords.longitude];
        setRiderPosition(newPos);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    watchRef.current = watchId;

    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, []);

  // Navigate via Google Maps
  const handleNavigate = useCallback(() => {
    if (!deliveryLocations) return;
    const origin = `${riderPosition[0]},${riderPosition[1]}`;
    const destination = `${deliveryLocations.dropoff.position[0]},${deliveryLocations.dropoff.position[1]}`;
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
      '_blank'
    );
  }, [deliveryLocations, riderPosition]);

  const handleRecenter = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(riderPosition, 14);
    }
  }, [riderPosition]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1000] max-w-lg mx-auto">
        <div className="m-3 flex items-center gap-2">
          {onBack && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-[#D5CBBF] flex items-center justify-center shadow-md"
            >
              <ChevronRight className="w-5 h-5 text-[#1B2A4A] rotate-180" />
            </motion.button>
          )}
          <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-xl border border-[#D5CBBF] px-3 py-2 shadow-md">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C9A96E]" />
              <span
                className="text-sm font-semibold text-[#1B2A4A]"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                Live Map
              </span>
              {isOnline ? (
                <Badge className="bg-[#2C4A3E]/10 text-[#2C4A3E] border-[#2C4A3E]/20 text-[9px] ml-auto">
                  <Wifi className="w-2.5 h-2.5 mr-0.5" />
                  LIVE
                </Badge>
              ) : (
                <Badge className="bg-[#7A7168]/10 text-[#7A7168] border-[#7A7168]/20 text-[9px] ml-auto">
                  <WifiOff className="w-2.5 h-2.5 mr-0.5" />
                  OFFLINE
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative" style={{ minHeight: '60vh' }}>
        {isLocating && !leafletLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#FAF7F2]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#C9A96E] animate-spin" />
              <p className="text-sm text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                Getting your location...
              </p>
            </div>
          </div>
        ) : null}
        <div id="gigrider-map" className="absolute inset-0" />

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-[1000]">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-[#D5CBBF] p-3 shadow-lg max-w-[200px]">
            <p
              className="text-[10px] font-semibold text-[#1B2A4A] mb-2 tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Map Legend
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1B2A4A] border border-[#C9A96E]" />
                <span className="text-[10px] text-[#2C2C2C]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                  Your Position
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#2C4A3E] border border-white" />
                <span className="text-[10px] text-[#2C2C2C]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                  Pickup Point
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#C9A96E] border border-white" />
                <span className="text-[10px] text-[#2C2C2C]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                  Drop-off Point
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#722F37] border border-[#C9A96E]" />
                <span className="text-[10px] text-[#2C2C2C]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                  Hot Zone
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recenter button */}
        <button
          onClick={handleRecenter}
          className="absolute bottom-4 right-4 z-[1000] w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-[#D5CBBF] flex items-center justify-center shadow-lg"
        >
          <Crosshair className="w-5 h-5 text-[#1B2A4A]" />
        </button>
      </div>

      {/* Bottom panel */}
      <div className="bg-[#FAF7F2] border-t border-[#D5CBBF] px-4 py-3 pb-20">
        {/* Active Delivery Info */}
        {activeDelivery ? (
          <div className="bg-white rounded-xl border border-[#D5CBBF] p-4 card-elegant">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-[#C9A96E]/30"
                style={{ backgroundColor: PLATFORMS[activeDelivery.platform]?.color || '#7A7168' }}
              >
                {PLATFORMS[activeDelivery.platform]?.letter || '?'}
              </div>
              <span
                className="text-[10px] font-bold tracking-[0.12em] text-[#7A7168] uppercase"
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                {PLATFORMS[activeDelivery.platform]?.displayName || activeDelivery.platform}
              </span>
              <Badge className="bg-[#2C4A3E]/10 text-[#2C4A3E] border-[#2C4A3E]/20 text-[10px] ml-auto">
                <Package className="w-3 h-3 mr-1" />
                ACTIVE
              </Badge>
            </div>
            <div className="flex items-start gap-3 mb-3">
              <div className="flex flex-col items-center mt-0.5">
                <div className="w-2 h-2 rounded-full bg-[#2C4A3E]" />
                <div className="w-px h-4 bg-[#D5CBBF]" />
                <div className="w-2 h-2 rounded-full bg-[#C9A96E]" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                  {activeDelivery.restaurant}
                </p>
                <p className="text-xs text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                  {activeDelivery.customer}
                </p>
              </div>
              <p
                className="text-lg font-bold text-[#1B2A4A]"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                ₹{activeDelivery.earnings}
              </p>
            </div>
            <button
              onClick={handleNavigate}
              className="w-full py-2.5 bg-[#1B2A4A] rounded-lg text-sm font-semibold text-[#FAF7F2] flex items-center justify-center gap-2 active:scale-[0.97] transition-all duration-200 shadow-sm"
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              <Navigation className="w-4 h-4" />
              Navigate with Google Maps
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
              No active delivery
            </p>
            <p className="text-xs text-[#7A7168]/60 mt-1" style={{ fontFamily: 'var(--font-lora), serif' }}>
              Accept an order to see navigation details
            </p>
          </div>
        )}

        {/* Hot Zones summary */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {HOT_ZONES.filter(z => z.intensity >= 0.5).map((zone) => (
            <div
              key={zone.id}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#722F37]/10 border border-[#722F37]/15 shrink-0"
            >
              <Zap className="w-3 h-3 text-[#722F37]" />
              <span className="text-[10px] font-semibold text-[#722F37]" style={{ fontFamily: 'var(--font-lora), serif' }}>
                {zone.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Export with dynamic import to disable SSR
export default function MapScreen(props: MapScreenProps) {
  // The actual component is already client-only by nature
  // but we need to prevent SSR for the leaflet imports
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use microtask to avoid synchronous setState in effect
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#C9A96E] animate-spin" />
          <p className="text-sm text-[#7A7168]" style={{ fontFamily: 'var(--font-lora), serif' }}>
            Loading map...
          </p>
        </div>
      </div>
    );
  }

  return <MapContent {...props} />;
}
