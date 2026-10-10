"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarBlank,
  Check,
  Clock,
  CreditCard,
  Info,
  MapPin,
  ShieldCheck,
  Users,
} from "@phosphor-icons/react";
import { FormEvent, useMemo, useState, useTransition } from "react";
import { BookingProgress } from "@/components/booking-progress";
import {
  checkAvailability,
  confirmBooking,
  formatBookingDate,
  getEndTime,
  getWorkspaceOptions,
} from "@/lib/bookings";
import { useBookings } from "@/lib/use-bookings";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  calculateTotal,
  formatPrice,
  paymentMethodLabels,
  priceUnitLabels,
  type PaymentMethod,
  type Workspace,
} from "@/lib/workspaces";

export function BookingSummary({
  workspace,
  queryString,
  selection,
}: {
  workspace: Workspace;
  queryString: string;
  selection: { date: string; startTime: string; duration: number; people: number; optionId: string };
}) {
  const router = useRouter();
  const options = useMemo(() => getWorkspaceOptions(workspace), [workspace]);
  const option = options.find((item) => item.id === selection.optionId) ?? options[0];
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(workspace.paymentMethods[0]);
  const [error, setError] = useState("");
  const bookings = useBookings();
  const [isPending, startTransition] = useTransition();
  const databaseMode = isSupabaseConfigured();
  const total = calculateTotal(workspace, selection.duration, selection.people);
  const initialAvailability = checkAvailability(workspace, selection, databaseMode ? [] : bookings);
  const quantity = workspace.priceUnit === "room" ? 1 : selection.people;

  async function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const payload = {
      workspaceSlug: workspace.slug,
      date: selection.date,
      startTime: selection.startTime,
      duration: selection.duration,
      people: selection.people,
      optionId: option.id,
      optionLabel: option.label,
      totalPrice: total,
      paymentMethod,
    };

    if (databaseMode) {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { booking?: { reference: string }; error?: string };
      if (response.status === 401) {
        const next = `${window.location.pathname}${window.location.search}`;
        startTransition(() => router.push(`/sign-in?next=${encodeURIComponent(next)}`));
        return;
      }
      if (!response.ok || !result.booking) {
        setError(result.error ?? "The reservation could not be confirmed.");
        return;
      }
      const reference = result.booking.reference;
      startTransition(() => router.push(`/booking/confirmation/${reference}`));
      return;
    }

    const result = confirmBooking(payload);
    if (!result.booking) {
      setError(result.error ?? "The reservation could not be confirmed.");
      return;
    }
    startTransition(() => router.push(`/booking/confirmation/${result.booking.reference}`));
  }

  return (
    <main className="min-h-[calc(100dvh-72px)] bg-[var(--surface)] pb-16">
      <div className="page-shell py-7 sm:py-10">
        <Link href={`/workspaces/${workspace.slug}${queryString ? `?${queryString}` : ""}`} className="inline-flex items-center gap-2 text-sm font-extrabold text-[#245f87] hover:underline">
          <ArrowLeft size={17} weight="bold" /> Change reservation details
        </Link>

        <div className="mt-6 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_12px_38px_rgba(71,132,170,0.1)]">
            <div className="border-b border-[var(--line)] p-6 sm:p-8">
              <BookingProgress current={2} />
              <h1 className="mt-7 text-3xl font-black tracking-[-0.045em] sm:text-4xl">Review your reservation</h1>
              <p className="mt-2 max-w-2xl text-[var(--muted)]">Check the details and choose one of the payment options supported by this workspace.</p>
            </div>

            <form onSubmit={handleConfirm} className="p-6 sm:p-8">
              <h2 className="text-xl font-black tracking-[-0.03em]">Payment method</h2>
              <div className="mt-4 space-y-3">
                {workspace.paymentMethods.map((method) => (
                  <label key={method} className={`block cursor-pointer rounded-xl border p-4 ${paymentMethod === method ? "border-[#6BAEDB] bg-[#edf8fe]" : "border-[var(--line)]"}`}>
                    <span className="flex items-start gap-3">
                      <input type="radio" name="payment-method" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="mt-1 size-4 accent-[#246B9C]" />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 font-extrabold"><CreditCard size={18} className="text-[#327eaf]" /> {paymentMethodLabels[method]}</span>
                        {method === "pay-online" && <span className="mt-1 block text-sm leading-relaxed text-[var(--muted)]">Pay Online uses a safe simulation for this university prototype. No card details are requested or stored.</span>}
                        {method === "pay-at-venue" && <span className="mt-1 block text-sm font-semibold text-[var(--muted)]">Reserve now, pay when you arrive.</span>}
                        {method === "free" && <span className="mt-1 block text-sm font-semibold text-[var(--muted)]">Free reservation — No online payment required.</span>}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              {workspace.purchaseCondition && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#abd3eb] bg-[#edf8fe] p-4 text-sm leading-relaxed text-[#36586f]">
                  <Info size={19} className="mt-0.5 shrink-0 text-[#327eaf]" />
                  <p><strong className="text-[#17364b]">Purchase condition:</strong> {workspace.purchaseCondition}</p>
                </div>
              )}

              <div className="mt-6 rounded-xl bg-[var(--surface)] p-4 text-sm">
                <div className="flex justify-between gap-4 text-[var(--muted)]"><span>{formatPrice(workspace.pricePerHour)} per hour x {selection.duration}</span><strong className="text-[var(--text)]">{formatPrice(workspace.pricePerHour * selection.duration)}</strong></div>
                {workspace.priceUnit !== "room" && <div className="mt-2 flex justify-between gap-4 text-[var(--muted)]"><span>People or desks</span><strong className="text-[var(--text)]">x {quantity}</strong></div>}
                <div className="mt-4 flex items-end justify-between gap-4 border-t border-[var(--line)] pt-4"><span><strong>Total price</strong><small className="block text-[var(--muted)]">Includes all displayed fees</small></span><strong className="text-2xl font-black">{formatPrice(total)}</strong></div>
              </div>

              {!initialAvailability.available && (
                <p role="alert" className="mt-5 rounded-xl bg-[#fff1f0] px-4 py-3 text-sm font-bold text-[#9b2c27]">{initialAvailability.message} Return to the workspace page to choose another time.</p>
              )}
              {error && <p role="alert" className="mt-5 rounded-xl bg-[#fff1f0] px-4 py-3 text-sm font-bold text-[#9b2c27]">{error}</p>}

              <button type="submit" disabled={!initialAvailability.available || isPending} className="mt-6 flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#246B9C] px-5 py-3.5 font-extrabold text-white shadow-[0_10px_24px_rgba(36,107,156,0.2)] hover:bg-[#1c567e] disabled:cursor-not-allowed disabled:bg-[#8bb8d4]">
                <Check size={19} weight="bold" /> {isPending ? "Confirming..." : total === 0 ? "Confirm free reservation" : "Confirm reservation"}
              </button>
              <p className="mt-3 text-center text-xs text-[var(--muted)]">Availability is checked again immediately before confirmation.</p>
            </form>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_12px_38px_rgba(71,132,170,0.1)]">
              <div className="relative h-48">
                <Image src={workspace.image} alt={`${workspace.name}, fictional demonstration workspace`} fill sizes="(max-width: 1024px) 100vw, 380px" className="object-cover" priority />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-black tracking-[-0.03em]">{workspace.name}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-[#2d719f]"><MapPin size={16} weight="fill" /> {workspace.neighborhood}, Madrid</p>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-4"><span className="flex items-center gap-2 text-[var(--muted)]"><CalendarBlank size={17} /> Date</span><strong className="text-right">{formatBookingDate(selection.date)}</strong></div>
                  <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-[var(--muted)]"><Clock size={17} /> Time</span><strong>{selection.startTime} to {getEndTime(selection.startTime, selection.duration)}</strong></div>
                  <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-[var(--muted)]"><Users size={17} /> Guests</span><strong>{selection.people}</strong></div>
                  <div className="flex items-start justify-between gap-4"><span className="text-[var(--muted)]">Option</span><strong className="max-w-[190px] text-right">{option.label}</strong></div>
                  <div className="flex items-start justify-between gap-4"><span className="text-[var(--muted)]">Rate</span><strong className="text-right">{formatPrice(workspace.pricePerHour)} {priceUnitLabels[workspace.priceUnit]}</strong></div>
                </div>
                <p className="mt-5 border-t border-[var(--line)] pt-4 text-xs leading-relaxed text-[var(--muted)]"><strong className="text-[var(--text)]">Cancellation:</strong> {workspace.cancellation}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#327eaf]" weight="duotone" />
              <p><strong className="text-[var(--text)]">{databaseMode ? "Secure account booking." : "Local demonstration mode."}</strong> {databaseMode ? "The database rechecks price, availability and capacity atomically before saving." : "Supabase is not configured, so this reservation stays in the current browser."}</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
