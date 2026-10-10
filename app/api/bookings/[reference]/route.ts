import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { firstReservationRow, reservationToBooking } from "@/lib/supabase/reservations";

type Params = Promise<{ reference: string }>;

async function getAuthenticatedClient() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return supabase;
}

export async function GET(_request: Request, { params }: { params: Params }) {
  const supabase = await getAuthenticatedClient();
  if (!supabase) return NextResponse.json({ error: "Sign in to open this booking." }, { status: 401 });
  const { reference } = await params;
  const { data, error } = await supabase.from("reservations").select("*").eq("reference", reference).maybeSingle();
  if (error) return NextResponse.json({ error: "The booking could not be loaded." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  const row = firstReservationRow(data);
  if (!row) return NextResponse.json({ error: "The booking was not returned by the database." }, { status: 500 });
  return NextResponse.json({ booking: reservationToBooking(row) });
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  const supabase = await getAuthenticatedClient();
  if (!supabase) return NextResponse.json({ error: "Sign in to cancel this booking." }, { status: 401 });
  const { reference } = await params;
  const { data, error } = await supabase.rpc("cancel_reservation", { p_reference: reference });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const row = firstReservationRow(data);
  if (!row) return NextResponse.json({ error: "The cancelled booking was not returned by the database." }, { status: 500 });
  return NextResponse.json({ booking: reservationToBooking(row) });
}
