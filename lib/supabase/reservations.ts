import type { Booking } from "@/lib/bookings";

export type ReservationRow = {
  reference: string;
  workspace_slug: string;
  booking_date: string;
  start_time: string;
  duration_hours: number;
  people: number;
  option_id: string;
  option_label: string;
  total_price: number | string;
  payment_method: Booking["paymentMethod"];
  payment_status: Booking["paymentStatus"];
  booking_status: Booking["status"];
  created_at: string;
  cancelled_at: string | null;
};

export function reservationToBooking(row: ReservationRow): Booking {
  return {
    reference: row.reference,
    workspaceSlug: row.workspace_slug,
    date: row.booking_date,
    startTime: row.start_time.slice(0, 5),
    duration: row.duration_hours,
    people: row.people,
    optionId: row.option_id,
    optionLabel: row.option_label,
    totalPrice: Number(row.total_price),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    status: row.booking_status,
    createdAt: row.created_at,
    cancelledAt: row.cancelled_at ?? undefined,
  };
}

export function firstReservationRow(data: unknown) {
  const row = Array.isArray(data) ? data[0] : data;
  return row as ReservationRow | undefined;
}
