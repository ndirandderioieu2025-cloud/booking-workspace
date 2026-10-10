import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ mode: "local", slots: null });

  const slug = request.nextUrl.searchParams.get("workspace");
  const date = request.nextUrl.searchParams.get("date");
  const duration = Number(request.nextUrl.searchParams.get("duration"));
  const people = Number(request.nextUrl.searchParams.get("people"));
  if (!slug || !date || !Number.isInteger(duration) || duration < 1 || duration > 8 || !Number.isInteger(people) || people < 1) {
    return NextResponse.json({ error: "Invalid availability request." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("get_workspace_available_slots", {
    p_workspace_slug: slug,
    p_booking_date: date,
    p_duration_hours: duration,
    p_people: people,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ mode: "database", slots: (data as Array<{ start_time: string; available: boolean }>).filter((slot) => slot.available).map((slot) => slot.start_time.slice(0, 5)) });
}
