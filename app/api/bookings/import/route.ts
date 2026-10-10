import { NextResponse, type NextRequest } from "next/server";
import type { Booking } from "@/lib/bookings";
import { createClient } from "@/lib/supabase/server";
import { firstReservationRow } from "@/lib/supabase/reservations";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return NextResponse.json({ error: "Sign in before importing local bookings." }, { status: 401 });

  const body = await request.json().catch(() => null) as { bookings?: Booking[] } | null;
  if (!Array.isArray(body?.bookings) || body.bookings.length > 50) return NextResponse.json({ error: "Choose up to 50 valid local bookings." }, { status: 400 });

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];
  for (const booking of body.bookings) {
    if (!booking || booking.status !== "confirmed" || typeof booking.reference !== "string") {
      skipped += 1;
      continue;
    }
    const { data, error } = await supabase.rpc("create_reservation", {
      p_workspace_slug: booking.workspaceSlug,
      p_booking_date: booking.date,
      p_start_time: booking.startTime,
      p_duration_hours: booking.duration,
      p_people: booking.people,
      p_option_id: booking.optionId,
      p_option_label: booking.optionLabel,
      p_payment_method: booking.paymentMethod,
      p_legacy_reference: booking.reference,
    });
    if (firstReservationRow(data)) imported += 1;
    else if (error?.message.includes("already imported")) skipped += 1;
    else if (error) errors.push(`${booking.reference}: ${error.message}`);
  }

  return NextResponse.json({ imported, skipped, errors });
}
