import { getWorkspace, workspaces, type PaymentMethod, type Workspace } from "@/lib/workspaces";

export const BOOKING_STORAGE_KEY = "booking-workspace-demo-bookings-v1";
export const BOOKING_CHANGE_EVENT = "booking-workspace-bookings-changed";

export type BookingStatus = "confirmed" | "cancelled";
export type PaymentStatus = "paid-simulated" | "pay-at-venue" | "not-required";

export type Booking = {
  reference: string;
  workspaceSlug: string;
  date: string;
  startTime: string;
  duration: number;
  people: number;
  optionId: string;
  optionLabel: string;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  createdAt: string;
  cancelledAt?: string;
};

export type ReservationLike = Pick<Booking, "workspaceSlug" | "date" | "startTime" | "duration" | "people" | "status"> & {
  reference: string;
};

export type BookingSelection = {
  date: string;
  startTime: string;
  duration: number;
  people: number;
};

export type AvailabilityResult = {
  available: boolean;
  code: "available" | "invalid" | "past" | "closed" | "outside-hours" | "capacity" | "overlap";
  message: string;
  remainingCapacity: number;
};

export type WorkspaceOption = {
  id: string;
  label: string;
  description: string;
};

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayString(now = new Date()) {
  return localDateString(now);
}

export function getDemoReservationDate(now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() + 2);
  return localDateString(date);
}

export function getWorkspaceOptions(workspace: Workspace): WorkspaceOption[] {
  if (workspace.type === "cafe") {
    return [
      { id: "shared-table", label: "Shared table seat", description: "A reserved seat at a communal work table." },
      { id: "window-seat", label: "Window seat", description: "A bright individual seat, subject to availability." },
    ];
  }
  if (workspace.type === "study") {
    return [
      { id: "quiet-desk", label: "Quiet study desk", description: "An individual desk in the quiet study area." },
      { id: "shared-study-table", label: "Shared study table", description: "A seat at a larger collaborative table." },
    ];
  }
  if (workspace.type === "coworking") {
    return [
      { id: "shared-desk", label: "Shared coworking desk", description: "One equipped desk per person in the shared area." },
      { id: "quiet-zone-desk", label: "Quiet-zone desk", description: "A desk in the lower-noise work zone." },
    ];
  }
  return [{ id: "private-room", label: "Private meeting room", description: `The entire room for up to ${workspace.capacity} people.` }];
}

export function getSeedReservations(now = new Date()): ReservationLike[] {
  const date = getDemoReservationDate(now);
  return workspaces.map((workspace, index) => ({
    reference: `DEMO-${String(index + 1).padStart(2, "0")}`,
    workspaceSlug: workspace.slug,
    date,
    startTime: index % 2 === 0 ? "12:00" : "14:00",
    duration: 2,
    people: workspace.type === "meeting-room" ? Math.min(3, workspace.capacity) : Math.min(2, workspace.capacity),
    status: "confirmed",
  }));
}

export function minutesFromTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return Number.NaN;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return Number.NaN;
  return hours * 60 + minutes;
}

export function timeFromMinutes(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function getEndTime(startTime: string, duration: number) {
  return timeFromMinutes(minutesFromTime(startTime) + duration * 60);
}

function bookingStartDate(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function reservationsForWorkspace(
  workspace: Workspace,
  bookings: ReservationLike[],
  now: Date,
) {
  return [...getSeedReservations(now), ...bookings].filter(
    (booking) => booking.workspaceSlug === workspace.slug && booking.status === "confirmed",
  );
}

export function checkAvailability(
  workspace: Workspace,
  selection: BookingSelection,
  bookings: ReservationLike[] = [],
  now = new Date(),
): AvailabilityResult {
  const { date, startTime, duration, people } = selection;
  const start = minutesFromTime(startTime);
  const open = minutesFromTime(workspace.openingHours.open);
  const close = minutesFromTime(workspace.openingHours.close);
  const end = start + duration * 60;
  const selectedDate = new Date(`${date}T12:00:00`);
  const selectedStart = bookingStartDate(date, startTime);

  if (!date || !startTime || Number.isNaN(start) || Number.isNaN(selectedDate.getTime()) || Number.isNaN(selectedStart.getTime()) || duration < 1 || duration > 8 || people < 1) {
    return { available: false, code: "invalid", message: "Choose a valid date, time, duration and group size.", remainingCapacity: 0 };
  }
  if (selectedStart.getTime() <= now.getTime()) {
    return { available: false, code: "past", message: "Bookings must start in the future.", remainingCapacity: 0 };
  }
  if (!workspace.openDays.includes(selectedDate.getDay())) {
    return { available: false, code: "closed", message: "This workspace is closed on the selected day.", remainingCapacity: 0 };
  }
  if (start < open || end > close) {
    return {
      available: false,
      code: "outside-hours",
      message: `Choose a time between ${workspace.openingHours.open} and ${workspace.openingHours.close}.`,
      remainingCapacity: 0,
    };
  }
  if (people > workspace.capacity) {
    return {
      available: false,
      code: "capacity",
      message: `This workspace can host a maximum of ${workspace.capacity} people.`,
      remainingCapacity: workspace.capacity,
    };
  }

  const overlapping = reservationsForWorkspace(workspace, bookings, now).filter((booking) => {
    if (booking.date !== date) return false;
    const reservationStart = minutesFromTime(booking.startTime);
    const reservationEnd = reservationStart + booking.duration * 60;
    return start < reservationEnd && end > reservationStart;
  });

  if (workspace.type === "meeting-room" && overlapping.length > 0) {
    return {
      available: false,
      code: "overlap",
      message: "This private room is already reserved during part of the selected time.",
      remainingCapacity: 0,
    };
  }

  const eventPoints = overlapping.flatMap((booking) => {
    const reservationStart = Math.max(start, minutesFromTime(booking.startTime));
    const reservationEnd = Math.min(end, minutesFromTime(booking.startTime) + booking.duration * 60);
    return [
      { time: reservationStart, change: booking.people },
      { time: reservationEnd, change: -booking.people },
    ];
  });
  eventPoints.sort((a, b) => a.time - b.time || a.change - b.change);

  let occupied = 0;
  let maximumOccupied = 0;
  for (const event of eventPoints) {
    occupied += event.change;
    maximumOccupied = Math.max(maximumOccupied, occupied);
  }
  const remainingCapacity = Math.max(0, workspace.capacity - maximumOccupied);
  if (people > remainingCapacity) {
    return {
      available: false,
      code: "capacity",
      message: `Only ${remainingCapacity} ${remainingCapacity === 1 ? "place is" : "places are"} available during this time.`,
      remainingCapacity,
    };
  }

  return {
    available: true,
    code: "available",
    message: workspace.type === "meeting-room" ? "The private room is available." : `${remainingCapacity} places remain available for this time.`,
    remainingCapacity,
  };
}

export function getAvailableTimeSlots(
  workspace: Workspace,
  selection: Omit<BookingSelection, "startTime">,
  bookings: ReservationLike[] = [],
  now = new Date(),
) {
  const open = minutesFromTime(workspace.openingHours.open);
  const close = minutesFromTime(workspace.openingHours.close);
  const slots: string[] = [];
  for (let start = open; start + selection.duration * 60 <= close; start += 30) {
    const startTime = timeFromMinutes(start);
    if (checkAvailability(workspace, { ...selection, startTime }, bookings, now).available) slots.push(startTime);
  }
  return slots;
}

export function loadBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(BOOKING_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeBookings(bookings: Booking[]) {
  window.localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings));
  window.dispatchEvent(new CustomEvent(BOOKING_CHANGE_EVENT));
}

function generateReference(date: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(values);
  else values.forEach((_, index) => { values[index] = Math.floor(Math.random() * 256); });
  const suffix = Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
  return `BW-${date.replaceAll("-", "").slice(2)}-${suffix}`;
}

export function paymentStatusFor(method: PaymentMethod): PaymentStatus {
  if (method === "pay-online") return "paid-simulated";
  if (method === "pay-at-venue") return "pay-at-venue";
  return "not-required";
}

export function paymentStatusLabel(status: PaymentStatus) {
  if (status === "paid-simulated") return "Paid online (simulation)";
  if (status === "pay-at-venue") return "Pay at workspace";
  return "No payment required";
}

export function confirmBooking(
  input: Omit<Booking, "reference" | "status" | "createdAt" | "paymentStatus">,
  now = new Date(),
) {
  if (typeof window === "undefined") return { booking: null, error: "Booking storage is only available in the browser." };
  const workspace = getWorkspace(input.workspaceSlug);
  if (!workspace) return { booking: null, error: "Workspace not found." };
  if (!workspace.paymentMethods.includes(input.paymentMethod)) return { booking: null, error: "This payment method is not supported." };

  const current = loadBookings();
  const availability = checkAvailability(workspace, {
    date: input.date,
    startTime: input.startTime,
    duration: input.duration,
    people: input.people,
  }, current, now);
  if (!availability.available) return { booking: null, error: availability.message };

  let reference = generateReference(input.date);
  while (current.some((booking) => booking.reference === reference)) reference = generateReference(input.date);

  const booking: Booking = {
    ...input,
    reference,
    paymentStatus: paymentStatusFor(input.paymentMethod),
    status: "confirmed",
    createdAt: now.toISOString(),
  };
  writeBookings([booking, ...current]);
  return { booking, error: null };
}

function cancellationHours(policy: string) {
  const match = /up to (\d+) hours?/i.exec(policy);
  return match ? Number(match[1]) : 0;
}

export function canCancelBooking(booking: Booking, now = new Date()) {
  if (booking.status !== "confirmed") return false;
  const workspace = getWorkspace(booking.workspaceSlug);
  if (!workspace) return false;
  const start = bookingStartDate(booking.date, booking.startTime);
  return now.getTime() < start.getTime() - cancellationHours(workspace.cancellation) * 60 * 60 * 1000;
}

export function cancelBooking(reference: string, now = new Date()) {
  if (typeof window === "undefined") return { booking: null, error: "Booking storage is only available in the browser." };
  const current = loadBookings();
  const booking = current.find((item) => item.reference === reference);
  if (!booking) return { booking: null, error: "Booking not found." };
  if (!canCancelBooking(booking, now)) return { booking: null, error: "This reservation can no longer be cancelled under the workspace policy." };

  const cancelled: Booking = { ...booking, status: "cancelled", cancelledAt: now.toISOString() };
  writeBookings(current.map((item) => item.reference === reference ? cancelled : item));
  return { booking: cancelled, error: null };
}

export function getBooking(reference: string) {
  return loadBookings().find((booking) => booking.reference === reference);
}

export function formatBookingDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function isPastBooking(booking: Booking, now = new Date()) {
  const end = bookingStartDate(booking.date, getEndTime(booking.startTime, booking.duration));
  return end.getTime() < now.getTime();
}
