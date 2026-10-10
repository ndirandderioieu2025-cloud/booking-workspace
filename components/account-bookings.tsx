"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarBlank, CalendarCheck, CheckCircle, Clock, CloudArrowUp, Info, MapPin, Prohibit, Trash, Users } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cancelBooking, canCancelBooking, formatBookingDate, getEndTime, isPastBooking, paymentStatusLabel, type Booking } from "@/lib/bookings";
import { MyBookings as LocalBookingsDashboard } from "@/components/my-bookings";
import { useBookings, useHydrated } from "@/lib/use-bookings";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatPrice, getWorkspace, paymentMethodLabels } from "@/lib/workspaces";

function BookingCard({ booking, source, onCancel, priority = false }: { booking: Booking; source: "account" | "local"; onCancel: (booking: Booking) => void; priority?: boolean }) {
  const workspace = getWorkspace(booking.workspaceSlug);
  if (!workspace) return null;
  const cancelled = booking.status === "cancelled";
  const past = isPastBooking(booking);
  const cancellable = canCancelBooking(booking);

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_8px_28px_rgba(71,132,170,0.08)]">
      <div className="grid md:grid-cols-[210px_1fr]">
        <div className="relative min-h-48"><Image src={workspace.image} alt={`${workspace.name}, fictional demonstration workspace`} fill sizes="(max-width: 768px) 100vw, 210px" className="object-cover" priority={priority} /></div>
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black tracking-[-0.03em]">{workspace.name}</h3>
                <span className={`rounded-lg px-2 py-1 text-[11px] font-extrabold ${cancelled ? "bg-[#fff1f0] text-[#9b2c27]" : past ? "bg-[var(--surface)] text-[var(--muted)]" : "bg-[#e9f7ef] text-[#17633a]"}`}>{cancelled ? "Cancelled" : past ? "Completed" : "Confirmed"}</span>
                {source === "local" && <span className="rounded-lg bg-[#fff8e7] px-2 py-1 text-[11px] font-extrabold text-[#805b18]">Local only</span>}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-[#2d719f]"><MapPin size={16} weight="fill" /> {workspace.neighborhood}, Madrid</p>
            </div>
            <div className="sm:text-right"><p className="text-xs font-bold text-[var(--muted)]">Total</p><p className="text-xl font-black">{formatPrice(booking.totalPrice)}</p></div>
          </div>

          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            <div className="flex items-start gap-2"><CalendarBlank size={17} className="mt-0.5 text-[#327eaf]" /><span><small className="block text-[var(--muted)]">Date</small><strong>{formatBookingDate(booking.date)}</strong></span></div>
            <div className="flex items-start gap-2"><Clock size={17} className="mt-0.5 text-[#327eaf]" /><span><small className="block text-[var(--muted)]">Time</small><strong>{booking.startTime} to {getEndTime(booking.startTime, booking.duration)}</strong></span></div>
            <div className="flex items-start gap-2"><Users size={17} className="mt-0.5 text-[#327eaf]" /><span><small className="block text-[var(--muted)]">People</small><strong>{booking.people}</strong></span></div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
            <div><p className="text-xs text-[var(--muted)]">Reference</p><p className="text-sm font-black tracking-[0.03em] text-[#245f87]">{booking.reference}</p></div>
            <div className="flex flex-wrap gap-2">
              {source === "account" && <Link href={`/booking/confirmation/${booking.reference}`} className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] px-3.5 py-2 text-sm font-extrabold text-[#245f87] hover:bg-[var(--surface)]">Details <ArrowRight size={15} /></Link>}
              {!cancelled && !past && <button type="button" onClick={() => onCancel(booking)} disabled={!cancellable} title={!cancellable ? workspace.cancellation : undefined} className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2a5a0] px-3.5 py-2 text-sm font-extrabold text-[#9b2c27] hover:bg-[#fff1f0] disabled:cursor-not-allowed disabled:opacity-50"><Trash size={16} /> Cancel</button>}
            </div>
          </div>

          <details className="mt-4 rounded-xl bg-[var(--surface)] p-3.5 text-sm">
            <summary className="cursor-pointer font-extrabold text-[#245f87]">View booking details</summary>
            <dl className="mt-3 grid gap-2 text-[var(--muted)] sm:grid-cols-2">
              <div><dt className="text-xs">Workspace option</dt><dd className="font-bold text-[var(--text)]">{booking.optionLabel}</dd></div>
              <div><dt className="text-xs">Payment method</dt><dd className="font-bold text-[var(--text)]">{paymentMethodLabels[booking.paymentMethod]}</dd></div>
              <div><dt className="text-xs">Payment status</dt><dd className="font-bold text-[var(--text)]">{paymentStatusLabel(booking.paymentStatus)}</dd></div>
              <div><dt className="text-xs">Cancellation</dt><dd className="font-bold text-[var(--text)]">{workspace.cancellation}</dd></div>
            </dl>
          </details>
        </div>
      </div>
    </article>
  );
}

export function AccountBookings() {
  const localBookings = useBookings();
  const hydrated = useHydrated();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [status, setStatus] = useState<"loading" | "signed-in" | "signed-out" | "error">("loading");
  const [view, setView] = useState<"upcoming" | "history">("upcoming");
  const [message, setMessage] = useState("");

  const loadAccountBookings = useCallback(async () => {
    const response = await fetch("/api/bookings", { cache: "no-store" });
    const result = await response.json() as { bookings?: Booking[]; error?: string };
    if (response.status === 401) {
      setStatus("signed-out");
      return;
    }
    if (!response.ok) {
      setStatus("error");
      setMessage(result.error ?? "Your bookings could not be loaded.");
      return;
    }
    setBookings(result.bookings ?? []);
    setStatus("signed-in");
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAccountBookings(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAccountBookings]);

  const groups = useMemo(() => ({
    upcoming: bookings.filter((booking) => booking.status === "confirmed" && !isPastBooking(booking)),
    history: bookings.filter((booking) => booking.status === "cancelled" || isPastBooking(booking)),
  }), [bookings]);
  const visible = groups[view];

  async function handleAccountCancel(booking: Booking) {
    if (!window.confirm("Cancel this reservation? The reserved capacity will be released immediately.")) return;
    const response = await fetch(`/api/bookings/${encodeURIComponent(booking.reference)}`, { method: "DELETE" });
    const result = await response.json() as { booking?: Booking; error?: string };
    if (!response.ok || !result.booking) {
      setMessage(result.error ?? "The reservation could not be cancelled.");
      return;
    }
    setBookings((current) => current.map((item) => item.reference === booking.reference ? result.booking as Booking : item));
    setMessage(`Reservation ${booking.reference} was cancelled. Its capacity is available again.`);
  }

  function handleLocalCancel(booking: Booking) {
    if (!window.confirm("Cancel this local reservation?")) return;
    const result = cancelBooking(booking.reference);
    setMessage(result.booking ? `Local reservation ${booking.reference} was cancelled.` : result.error ?? "The local reservation could not be cancelled.");
  }

  async function importLocalBookings() {
    setMessage("Importing eligible local reservations...");
    const response = await fetch("/api/bookings/import", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ bookings: localBookings }) });
    const result = await response.json() as { imported?: number; skipped?: number; errors?: string[]; error?: string };
    if (!response.ok) {
      setMessage(result.error ?? "Local bookings could not be imported.");
      return;
    }
    await loadAccountBookings();
    const details = result.errors?.length ? ` ${result.errors.length} could not be imported because they are no longer valid or available.` : "";
    setMessage(`${result.imported ?? 0} local booking(s) imported; ${result.skipped ?? 0} skipped as cancelled or already imported.${details}`);
  }

  if (!isSupabaseConfigured()) return <LocalBookingsDashboard />;

  return (
    <main className="min-h-[calc(100dvh-72px)] bg-[var(--surface)] py-8 sm:py-12">
      <div className="page-shell">
        <div className="max-w-2xl">
          <p className="text-sm font-extrabold text-[#2d719f]">Secure account reservations</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">My Bookings</h1>
          <p className="mt-3 text-[var(--muted)]">View upcoming and previous reservations stored in your account. Only you can open or change them.</p>
        </div>

        {message && <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-bold text-[#245f87]" role="status"><CheckCircle size={19} className="mt-0.5 shrink-0" /> {message}</div>}

        {status === "signed-out" ? (
          <div className="mt-7 rounded-2xl border border-[var(--line)] bg-white p-8 text-center shadow-[0_8px_28px_rgba(71,132,170,0.08)] sm:p-12">
            <CalendarCheck size={34} className="mx-auto text-[#327eaf]" weight="duotone" />
            <h2 className="mt-4 text-2xl font-black tracking-[-0.035em]">Sign in to see your bookings</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--muted)]">Your booking history is private and linked to your Supabase account.</p>
            <Link href="/sign-in?next=%2Fmy-bookings" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#246B9C] px-5 py-3 font-extrabold text-white">Sign in <ArrowRight size={18} /></Link>
          </div>
        ) : (
          <>
            <div className="mt-7 flex w-fit gap-1 rounded-xl border border-[var(--line)] bg-white p-1" role="tablist" aria-label="Booking groups">
              <button type="button" role="tab" aria-selected={view === "upcoming"} onClick={() => setView("upcoming")} className={`rounded-lg px-4 py-2 text-sm font-extrabold ${view === "upcoming" ? "bg-[var(--surface-strong)] text-[var(--text)]" : "text-[var(--muted)]"}`}>Upcoming ({groups.upcoming.length})</button>
              <button type="button" role="tab" aria-selected={view === "history"} onClick={() => setView("history")} className={`rounded-lg px-4 py-2 text-sm font-extrabold ${view === "history" ? "bg-[var(--surface-strong)] text-[var(--text)]" : "text-[var(--muted)]"}`}>Past and cancelled ({groups.history.length})</button>
            </div>

            {status === "loading" || !hydrated ? (
              <div className="mt-6 space-y-4 animate-pulse"><div className="h-64 rounded-2xl bg-white" /><div className="h-64 rounded-2xl bg-white" /></div>
            ) : visible.length ? (
              <div className="mt-6 space-y-4">{visible.map((booking, index) => <BookingCard key={booking.reference} booking={booking} source="account" onCancel={handleAccountCancel} priority={index === 0} />)}</div>
            ) : (
              <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-8 text-center sm:p-12">
                {view === "upcoming" ? <CalendarCheck size={31} className="mx-auto text-[#327eaf]" /> : <Prohibit size={31} className="mx-auto text-[#327eaf]" />}
                <h2 className="mt-4 text-2xl font-black">{view === "upcoming" ? "No upcoming bookings" : "No past or cancelled bookings"}</h2>
                {view === "upcoming" && <Link href="/workspaces" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#246B9C] px-5 py-3 font-extrabold text-white">Find a workspace <ArrowRight size={18} /></Link>}
              </div>
            )}
          </>
        )}

        {hydrated && localBookings.length > 0 && (
          <section className="mt-10 border-t border-[var(--line)] pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-sm font-extrabold text-[#805b18]">Previous browser data</p><h2 className="mt-1 text-2xl font-black tracking-[-0.035em]">Local demonstration bookings</h2><p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">These have not been deleted. They remain separate until you choose to import eligible confirmed reservations.</p></div>
              {status === "signed-in" && <button type="button" onClick={importLocalBookings} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#6BAEDB] bg-white px-4 py-2.5 text-sm font-extrabold text-[#245f87] hover:bg-[var(--surface)]"><CloudArrowUp size={18} /> Import to my account</button>}
            </div>
            <div className="mt-5 space-y-4">{localBookings.map((booking) => <BookingCard key={`local-${booking.reference}`} booking={booking} source="local" onCancel={handleLocalCancel} />)}</div>
          </section>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 text-sm leading-relaxed text-[var(--muted)]"><Info size={20} className="mt-0.5 shrink-0 text-[#327eaf]" /><p>Account bookings are protected by Row Level Security. Local bookings are never removed automatically, and repeated imports are ignored by their original reference.</p></div>
      </div>
    </main>
  );
}
