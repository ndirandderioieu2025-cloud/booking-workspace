"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarBlank,
  Check,
  CheckCircle,
  Clock,
  MapPin,
  ShieldCheck,
  Users,
} from "@phosphor-icons/react";
import { BookingProgress } from "@/components/booking-progress";
import { useEffect, useState } from "react";
import {
  formatBookingDate,
  getEndTime,
  paymentStatusLabel,
  type Booking,
} from "@/lib/bookings";
import { useBookings, useHydrated } from "@/lib/use-bookings";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatPrice, getWorkspace } from "@/lib/workspaces";

export function BookingConfirmation({ reference }: { reference: string }) {
  const bookings = useBookings();
  const hydrated = useHydrated();
  const databaseMode = isSupabaseConfigured();
  const [databaseBooking, setDatabaseBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(databaseMode);
  const [databaseError, setDatabaseError] = useState("");
  const localBooking = bookings.find((item) => item.reference === reference) ?? null;
  const booking = databaseBooking ?? localBooking;
  const ready = hydrated && !loading;

  useEffect(() => {
    if (!databaseMode) return;
    const controller = new AbortController();
    fetch(`/api/bookings/${encodeURIComponent(reference)}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json() as { booking?: Booking; error?: string };
        if (!response.ok) throw new Error(result.error ?? "Confirmation could not be loaded.");
        setDatabaseBooking(result.booking ?? null);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setDatabaseError(error instanceof Error ? error.message : "Confirmation could not be loaded.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [databaseMode, reference]);

  if (!ready) {
    return (
      <main className="min-h-[calc(100dvh-72px)] bg-[var(--surface)] py-10">
        <div className="page-shell animate-pulse"><div className="mx-auto h-[620px] max-w-3xl rounded-2xl bg-white" /></div>
      </main>
    );
  }

  const workspace = booking ? getWorkspace(booking.workspaceSlug) : undefined;
  if (!booking || !workspace) {
    return (
      <main className="min-h-[calc(100dvh-72px)] bg-[var(--surface)] py-12">
        <div className="page-shell">
          <div className="mx-auto max-w-xl rounded-2xl border border-[var(--line)] bg-white p-8 text-center shadow-[var(--shadow)]">
            <h1 className="text-3xl font-black tracking-[-0.04em]">Confirmation not found</h1>
            <p className="mt-3 text-[var(--muted)]">{databaseError || "This booking may belong to another account or no longer be available."}</p>
            <Link href="/my-bookings" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#246B9C] px-5 py-3 font-extrabold text-white">Open My Bookings <ArrowRight size={18} /></Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-72px)] bg-[var(--surface)] py-7 sm:py-10">
      <div className="page-shell">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_18px_60px_rgba(71,132,170,0.16)]">
          <div className="border-b border-[var(--line)] p-6 sm:p-8">
            <BookingProgress current={3} />
            <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#e9f7ef] text-[#17633a]"><CheckCircle size={34} weight="fill" /></span>
              <div>
                <h1 className="text-3xl font-black tracking-[-0.045em] sm:text-4xl">Your workspace is booked!</h1>
                <p className="mt-2 text-[var(--muted)]">{databaseBooking ? "Your reservation has been confirmed and saved to your secure account." : "Your local demonstration reservation has been confirmed in this browser."}</p>
                <p className="mt-4 text-sm text-[var(--muted)]">Booking reference</p>
                <p className="mt-1 break-all text-xl font-black tracking-[0.04em] text-[#245f87]">{booking.reference}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[190px_1fr]">
            <div className="relative min-h-48 overflow-hidden rounded-2xl">
              <Image src={workspace.image} alt={`${workspace.name}, fictional demonstration workspace`} fill sizes="190px" className="object-cover" priority />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-[-0.035em]">{workspace.name}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-[#2d719f]"><MapPin size={16} weight="fill" /> {workspace.neighborhood}, Madrid</p>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-2"><CalendarBlank size={18} className="mt-0.5 text-[#327eaf]" /><span><small className="block text-[var(--muted)]">Date</small><strong>{formatBookingDate(booking.date)}</strong></span></div>
                <div className="flex items-start gap-2"><Clock size={18} className="mt-0.5 text-[#327eaf]" /><span><small className="block text-[var(--muted)]">Time</small><strong>{booking.startTime} to {getEndTime(booking.startTime, booking.duration)}</strong></span></div>
                <div className="flex items-start gap-2"><Users size={18} className="mt-0.5 text-[#327eaf]" /><span><small className="block text-[var(--muted)]">People</small><strong>{booking.people}</strong></span></div>
                <div className="flex items-start gap-2"><Check size={18} className="mt-0.5 text-[#327eaf]" /><span><small className="block text-[var(--muted)]">Workspace option</small><strong>{booking.optionLabel}</strong></span></div>
              </div>
            </div>
          </div>

          <div className="mx-6 mb-6 rounded-2xl bg-[var(--surface)] p-5 sm:mx-8 sm:mb-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><p className="text-xs font-bold text-[var(--muted)]">Total price</p><p className="mt-1 text-2xl font-black">{formatPrice(booking.totalPrice)}</p></div>
              <div><p className="text-xs font-bold text-[var(--muted)]">Payment status</p><p className="mt-1 font-extrabold">{paymentStatusLabel(booking.paymentStatus)}</p></div>
            </div>
            <p className="mt-4 border-t border-[var(--line)] pt-4 text-sm text-[var(--muted)]"><strong className="text-[var(--text)]">Cancellation:</strong> {workspace.cancellation}</p>
          </div>

          <div className="border-t border-[var(--line)] p-6 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-8">
            <div className="flex items-start gap-2.5 text-xs leading-relaxed text-[var(--muted)]"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#327eaf]" /><p>{databaseBooking ? "Saved to your Supabase account. Any online payment status is simulated, and no real venue or payment provider is contacted." : "Local demonstration mode. This booking is not sent to a real venue or payment provider."}</p></div>
            <Link href="/my-bookings" className="mt-5 inline-flex w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#246B9C] px-5 py-3 font-extrabold text-white hover:bg-[#1c567e] sm:mt-0 sm:w-auto">View My Bookings <ArrowRight size={18} weight="bold" /></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
