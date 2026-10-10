"use client";

import { useSyncExternalStore } from "react";
import {
  BOOKING_CHANGE_EVENT,
  BOOKING_STORAGE_KEY,
  type Booking,
} from "@/lib/bookings";

const emptyBookings: Booking[] = [];
let cachedRaw: string | null | undefined;
let cachedBookings: Booking[] = emptyBookings;

function getBookingsSnapshot() {
  const raw = window.localStorage.getItem(BOOKING_STORAGE_KEY);
  if (raw === cachedRaw) return cachedBookings;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedBookings = Array.isArray(parsed) ? parsed : emptyBookings;
  } catch {
    cachedBookings = emptyBookings;
  }
  return cachedBookings;
}

function subscribeToBookings(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(BOOKING_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(BOOKING_CHANGE_EVENT, callback);
  };
}

function subscribeToHydration() {
  return () => undefined;
}

export function useBookings() {
  return useSyncExternalStore(subscribeToBookings, getBookingsSnapshot, () => emptyBookings);
}

export function useHydrated() {
  return useSyncExternalStore(subscribeToHydration, () => true, () => false);
}
