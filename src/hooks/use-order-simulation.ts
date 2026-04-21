'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useGigRiderStore, generateOrder, generateStack, type Order } from '@/lib/store';

/**
 * Hook that simulates real-time incoming orders.
 * When rider is online, new orders appear every 8-20 seconds.
 * Also generates Smart Stack opportunities occasionally.
 */
export function useOrderSimulation() {
  const isOnline = useGigRiderStore(s => s.isOnline);
  const connectedPlatforms = useGigRiderStore(s => s.connectedPlatforms);
  const addIncomingOrder = useGigRiderStore(s => s.addIncomingOrder);
  const removeExpiredOrders = useGigRiderStore(s => s.removeExpiredOrders);
  const smartStack = useGigRiderStore(s => s.autoAcceptRules.smartStack);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleanupRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const simulate = useCallback(() => {
    if (!isOnline) return;

    const onlinePlatforms = connectedPlatforms
      .filter(p => p.isOnline)
      .map(p => p.id);

    if (onlinePlatforms.length === 0) return;

    // 20% chance of generating a stack when smart stack is on
    if (smartStack && Math.random() < 0.2) {
      const stack = generateStack(onlinePlatforms);
      if (stack) {
        stack.forEach(order => addIncomingOrder(order));
        return;
      }
    }

    // Regular single order
    const order = generateOrder(onlinePlatforms);
    if (order) {
      addIncomingOrder(order);
    }
  }, [isOnline, connectedPlatforms, smartStack, addIncomingOrder]);

  useEffect(() => {
    if (isOnline) {
      // Initial order after 3 seconds
      const initialTimeout = setTimeout(() => {
        simulate();
      }, 3000);

      // Recurring orders every 8-20 seconds
      const startInterval = () => {
        const delay = 8000 + Math.random() * 12000;
        intervalRef.current = setTimeout(() => {
          simulate();
          startInterval();
        }, delay) as unknown as ReturnType<typeof setTimeout>;
      };
      startInterval();

      // Cleanup expired orders every 5 seconds
      cleanupRef.current = setInterval(() => {
        removeExpiredOrders();
      }, 5000);

      return () => {
        clearTimeout(initialTimeout);
        if (intervalRef.current) clearTimeout(intervalRef.current);
        if (cleanupRef.current) clearInterval(cleanupRef.current);
      };
    } else {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      if (cleanupRef.current) clearInterval(cleanupRef.current);
    }
  }, [isOnline, simulate, removeExpiredOrders]);
}

/**
 * Hook that ticks the online timer every second.
 */
export function useOnlineTimer() {
  const isOnline = useGigRiderStore(s => s.isOnline);
  const tickOnlineTime = useGigRiderStore(s => s.tickOnlineTime);

  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(() => {
      tickOnlineTime();
    }, 1000);
    return () => clearInterval(interval);
  }, [isOnline, tickOnlineTime]);
}

/**
 * Hook that provides countdown timers for incoming orders.
 * Returns a map of orderId -> seconds remaining.
 * Uses useState to trigger re-renders every second.
 */
export function useOrderTimers(): Record<string, number> {
  const incomingOrders = useGigRiderStore(s => s.incomingOrders);
  const acceptedOrderIds = useGigRiderStore(s => s.acceptedOrderIds);
  const declinedOrderIds = useGigRiderStore(s => s.declinedOrderIds);
  const timersRef = useRef<Record<string, number>>({});
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      let changed = false;
      incomingOrders.forEach(order => {
        if (acceptedOrderIds.includes(order.id) || declinedOrderIds.includes(order.id)) return;
        if (timersRef.current[order.id] === undefined) {
          timersRef.current[order.id] = order.timer;
        } else if (timersRef.current[order.id] > 0) {
          timersRef.current[order.id] -= 1;
          changed = true;
        }
      });
      if (changed) {
        setTick(t => t + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [incomingOrders, acceptedOrderIds, declinedOrderIds]);

  return timersRef.current;
}

/**
 * Format seconds to HH:MM:SS or MM:SS
 */
export function formatOnlineTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
