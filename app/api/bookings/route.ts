import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { firstReservationRow, reservationToBooking, type ReservationRow } from "@/lib/supabase/reservations";

const validPaymentMethods = new Set(["free", "pay-online", "pay-at-venue"]);

async function authenticatedClient() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null, configurationError: true };
  const { data, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : data.user, configurationError: false };
}

export async function GET() {
  const { supabase, user, configurationError } = await authenticatedClient();
  if (configurationError) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  if (!supabase || !user) return NextResponse.json({ error: "Sign in to view your bookings." }, { status: 401 });

  const { data, error } = await supabase.from("reservations").select("*").order("booking_date", { ascending: false }).order("start_time", { ascending: false });
  if (error) return NextResponse.json({ error: "Your bookings could not be loaded." }, { status: 500 });
  return NextResponse.json({ bookings: (data as ReservationRow[]).map(reservationToBooking) });
}

export async function POST(request: NextRequest) {
  const { supabase, user, configurationError } = await authenticatedClient();
  if (configurationError) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  if (!supabase || !user) return NextResponse.json({ error: "Sign in before confirming your reservation." }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body.workspaceSlug !== "string" || typeof body.date !== "string" || typeof body.startTime !== "string" || typeof body.optionId !== "string" || typeof body.optionLabel !== "string" || typeof body.paymentMethod !== "string") {
    return NextResponse.json({ error: "The reservation details are incomplete." }, { status: 400 });
  }
  const duration = Number(body.duration);
  const people = Number(body.people);
  if (!Number.isInteger(duration) || duration < 1 || duration > 8 || !Number.isInteger(people) || people < 1 || !validPaymentMethods.has(body.paymentMethod)) {
    return NextResponse.json({ error: "The reservation details are invalid." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("create_reservation", {
    p_workspace_slug: body.workspaceSlug,
    p_booking_date: body.date,
    p_start_time: body.startTime,
    p_duration_hours: duration,
    p_people: people,
    p_option_id: body.optionId,
    p_option_label: body.optionLabel,
    p_payment_method: body.paymentMethod,
  });
  if (error) {
    const conflict = /available|capacity|reserved/i.test(error.message);
    return NextResponse.json({ error: error.message }, { status: conflict ? 409 : 400 });
  }
  const row = firstReservationRow(data);
  if (!row) return NextResponse.json({ error: "The reservation was not returned by the database." }, { status: 500 });
  return NextResponse.json({ booking: reservationToBooking(row) }, { status: 201 });
}
