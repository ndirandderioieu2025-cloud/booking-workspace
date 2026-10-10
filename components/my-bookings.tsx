"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarBlank,
  CalendarCheck,
  CheckCircle,
  Clock,
  Info,
  MapPin,
  Prohibit,
  Trash,
  Users,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import {
  cancelBooking,
  canCancelBooking,
  formatBookingDate,
  getEndTime,
  isPastBooking,
  paymentStatusLabel,
  type Booking,
} from "@/lib/bookings";
import { useBookings, useHydrated } from "@/lib/use-bookings";
import { formatPrice, getWorkspace } from "@/lib/workspaces";

function BookingCard({ booking, onCancel, priority = false }: { booking: Booking; onCancel: (reference: string) => void; priority?: boolean }) {
  const workspace = getWorkspace(booking.workspaceSlug);
  if (!workspace) return null;
  const cancelled = booking.status === "cancelled";
  const past = isPastBooking(booking);
  const cancellable = canCancelBooking(booking);

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_8px_28px_rgba(71,132,170,0.08)]">
      <div className="grid md:grid-cols-[220px_1fr]">
        <div className="relative min-h-52">
          <Image src={workspace.image} alt={`${workspace.name}, fictional demonstration workspace`} fill sizes="(max-width: 768px) 100vw, 220px" className="object-cover" priority={priority} />
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black tracking-[-0.03em]">{workspace.name}</h3>
                <span className={`rounded-lg px-2 py-1 text-[11px] font-extrabold ${cancelled ? "bg-[#fff1f0] text-[#9b2c27]" : past ? "bg-[var(--surface)] text-[var(--muted)]" : "bg-[#e9f7ef] text-[#17633a]"}`}>
                  {cancelled ? "Cancelled" : past ? "Completed" : "Confirmed"}
                </span>
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
              <Link href={`/workspaces/${workspace.slug}`} className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] px-3.5 py-2 text-sm font-extrabold text-[#245f87] hover:bg-[var(--surface)]">Workspace <ArrowRight size={15} /></Link>
              {!cancelled && !past && (
                <button type="button" onClick={() => onCancel(booking.reference)} disabled={!cancellable} title={!cancellable ? workspace.cancellation : undefined} className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2a5a0] px-3.5 py-2 text-sm font-extrabold text-[#9b2c27] hover:bg-[#fff1f0] disabled:cursor-not-allowed disabled:opacity-50"><Trash size={16} /> Cancel</button>
              )}
            </div>
          </div>

          <details className="mt-4 rounded-xl bg-[var(--surface)] p-3.5 text-sm">
            <summary className="cursor-pointer font-extrabold text-[#245f87]">View booking details</summary>
            <dl className="mt-3 grid gap-2 text-[var(--muted)] sm:grid-cols-2">
              <div><dt className="text-xs">Workspace option</dt><dd className="font-bold text-[var(--text)]">{booking.optionLabel}</dd></div>
              <div><dt className="text-xs">Payment status</dt><dd className="font-bold text-[var(--text)]">{paymentStatusLabel(booking.paymentStatus)}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs">Cancellation policy</dt><dd className="font-bold text-[var(--text)]">{workspace.cancellation}</dd></div>
            </dl>
          </details>
        </div>
      </div>
    </article>
  );
}

export function MyBookings() {
  const bookings = useBookings();
  const ready = useHydrated();
  const [view, setView] = useState<"upcoming" | "history">("upcoming");
  const [message, setMessage] = useState("");

  const groups = useMemo(() => ({
    upcoming: bookings.filter((booking) => booking.status === "confirmed" && !isPastBooking(booking)),
    history: bookings.filter((booking) => booking.status === "cancelled" || isPastBooking(booking)),
  }), [bookings]);
  const visible = groups[view];

  function handleCancel(reference: string) {
    if (!window.confirm("Cancel this reservation? The reserved capacity will be released immediately.")) return;
    const result = cancelBooking(reference);
    if (!result.booking) {
      setMessage(result.error ?? "The reservation could not be cancelled.");
      return;
    }
    setMessage(`Reservation ${reference} was cancelled. Its capacity is available again.`);
  }

  return (
    <main className="min-h-[calc(100dvh-72px)] bg-[var(--surface)] py-8 sm:py-12">
      <div className="page-shell">
        <div className="max-w-2xl">
          <p className="text-sm font-extrabold text-[#2d719f]">Local fallback mode</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">My Bookings</h1>
          <p className="mt-3 text-[var(--muted)]">Supabase is not configured in this environment, so these demonstration reservations remain in this browser. Add the Stage 4 environment variables to enable secure accounts and shared bookings.</p>
        </div>

        <div className="mt-7 flex w-fit gap-1 rounded-xl border border-[var(--line)] bg-white p-1" role="tablist" aria-label="Booking groups">
          <button type="button" role="tab" aria-selected={view === "upcoming"} onClick={() => setView("upcoming")} className={`rounded-lg px-4 py-2 text-sm font-extrabold ${view === "upcoming" ? "bg-[var(--surface-strong)] text-[var(--text)]" : "text-[var(--muted)]"}`}>Upcoming ({groups.upcoming.length})</button>
          <button type="button" role="tab" aria-selected={view === "history"} onClick={() => setView("history")} className={`rounded-lg px-4 py-2 text-sm font-extrabold ${view === "history" ? "bg-[var(--surface-strong)] text-[var(--text)]" : "text-[var(--muted)]"}`}>Past and cancelled ({groups.history.length})</button>
        </div>

        {message && <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-bold text-[#245f87]" role="status"><CheckCircle size={19} className="mt-0.5 shrink-0" /> {message}</div>}

        {!ready ? (
          <div className="mt-6 space-y-4 animate-pulse">{[1, 2].map((item) => <div key={item} className="h-64 rounded-2xl bg-white" />)}</div>
        ) : visible.length > 0 ? (
          <div className="mt-6 space-y-4">{visible.map((booking, index) => <BookingCard key={booking.reference} booking={booking} onCancel={handleCancel} priority={index === 0} />)}</div>
        ) : (
          <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-8 text-center shadow-[0_8px_28px_rgba(71,132,170,0.08)] sm:p-12">
            <span className="mx-auto grid size-14 place-items-center rounded-xl bg-[var(--surface-strong)] text-[#327eaf]">{view === "upcoming" ? <CalendarCheck size={29} weight="duotone" /> : <Prohibit size={29} weight="duotone" />}</span>
            <h2 className="mt-5 text-2xl font-black tracking-[-0.035em]">{view === "upcoming" ? "No upcoming bookings" : "No past or cancelled bookings"}</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[var(--muted)]">{view === "upcoming" ? "Choose a workspace and confirm a demonstration reservation to see it here." : "Completed and cancelled reservations will be kept here in local demonstration mode."}</p>
            {view === "upcoming" && <Link href="/workspaces" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#246B9C] px-5 py-3 font-extrabold text-white hover:bg-[#1c567e]">Find a workspace <ArrowRight size={18} weight="bold" /></Link>}
          </div>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 text-sm leading-relaxed text-[var(--muted)]">
          <Info size={20} className="mt-0.5 shrink-0 text-[#327eaf]" />
          <p>These fallback bookings stay in local browser data. Once Supabase is configured, they remain visible separately and can be imported safely into a signed-in account.</p>
        </div>
      </div>
    </main>
  );
}
