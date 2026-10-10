"use client";

import {
  CalendarBlank,
  Check,
  Clock,
  CreditCard,
  Info,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { BookingProgress } from "@/components/booking-progress";
import {
  checkAvailability,
  getAvailableTimeSlots,
  getEndTime,
  getTodayString,
  getWorkspaceOptions,
  loadBookings,
} from "@/lib/bookings";
import { useBookings } from "@/lib/use-bookings";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { calculateTotal, formatPrice, priceUnitLabels, type Workspace } from "@/lib/workspaces";

function tomorrowString() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return getTodayString(date);
}

export function BookingPanel({
  workspace,
  queryString,
  initialDate,
  initialTime,
  initialDuration,
  initialPeople,
}: {
  workspace: Workspace;
  queryString: string;
  initialDate?: string;
  initialTime?: string;
  initialDuration: number;
  initialPeople: number;
}) {
  const router = useRouter();
  const options = useMemo(() => getWorkspaceOptions(workspace), [workspace]);
  const [date, setDate] = useState(initialDate ?? tomorrowString);
  const [time, setTime] = useState(initialTime ?? "");
  const [duration, setDuration] = useState(Math.min(8, Math.max(1, initialDuration)));
  const [people, setPeople] = useState(Math.max(1, initialPeople));
  const [optionId, setOptionId] = useState(options[0].id);
  const bookings = useBookings();
  const [submitError, setSubmitError] = useState("");
  const [databaseResult, setDatabaseResult] = useState<{ key: string; slots: string[]; error: string }>({ key: "", slots: [], error: "" });
  const [isPending, startTransition] = useTransition();

  const localSlots = useMemo(
    () => getAvailableTimeSlots(workspace, { date, duration, people }, bookings),
    [workspace, date, duration, people, bookings],
  );
  const databaseMode = isSupabaseConfigured();
  const requestKey = `${workspace.slug}:${date}:${duration}:${people}`;
  const databaseSlots = databaseResult.key === requestKey ? databaseResult.slots : null;
  const checkingDatabase = databaseMode && databaseSlots === null;
  const slots = databaseMode ? (databaseSlots ?? []) : localSlots;

  useEffect(() => {
    if (!databaseMode) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ workspace: workspace.slug, date, duration: String(duration), people: String(people) });
    fetch(`/api/availability?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json() as { slots?: string[]; error?: string };
        if (!response.ok) throw new Error(result.error ?? "Availability could not be checked.");
        setDatabaseResult({ key: requestKey, slots: result.slots ?? [], error: "" });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setDatabaseResult({ key: requestKey, slots: [], error: error instanceof Error ? error.message : "Availability could not be checked." });
      });
    return () => controller.abort();
  }, [databaseMode, workspace.slug, date, duration, people, requestKey]);

  const selectedTime = time || slots[0] || "";

  const localAvailability = useMemo(() => checkAvailability(workspace, { date, startTime: selectedTime, duration, people }, bookings), [workspace, date, selectedTime, duration, people, bookings]);
  const availability = databaseMode
    ? checkingDatabase
      ? { available: false, message: "Checking shared availability..." }
      : { available: Boolean(selectedTime && slots.includes(selectedTime)), message: databaseResult.key === requestKey && databaseResult.error ? databaseResult.error : selectedTime && slots.includes(selectedTime) ? "Available in the shared booking database." : "No shared capacity is available for this selection." }
    : localAvailability;
  const total = calculateTotal(workspace, duration, people);
  const quantityLabel = workspace.priceUnit === "room" ? "1 private room" : `${people} ${workspace.priceUnit === "desk" ? (people === 1 ? "desk" : "desks") : (people === 1 ? "person" : "people")}`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const latest = databaseMode ? availability : checkAvailability(workspace, { date, startTime: selectedTime, duration, people }, loadBookings());
    if (!latest.available) {
      setSubmitError(latest.message);
      return;
    }

    setSubmitError("");
    const params = new URLSearchParams(queryString);
    params.set("date", date);
    params.set("time", selectedTime);
    params.set("duration", String(duration));
    params.set("people", String(people));
    params.set("option", optionId);
    startTransition(() => router.push(`/booking/${workspace.slug}?${params.toString()}`));
  }

  const fieldClass = "mt-1.5 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm font-bold text-[var(--text)] outline-none focus:border-[#327eaf] focus:ring-2 focus:ring-[#A9D6F5]";

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_16px_44px_rgba(71,132,170,0.14)] sm:p-6" noValidate>
      <BookingProgress current={1} />

      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-[var(--muted)]">Book from</p>
          <p className="mt-1 text-3xl font-black tracking-[-0.04em]">{formatPrice(workspace.pricePerHour)}</p>
          <p className="text-xs text-[var(--muted)]">{priceUnitLabels[workspace.priceUnit]} per hour</p>
        </div>
        <CalendarBlank size={29} className="text-[#327eaf]" weight="duotone" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <label className="text-xs font-extrabold text-[var(--muted)]">
          Booking date
          <input type="date" min={getTodayString()} value={date} onChange={(event) => { setDate(event.target.value); setSubmitError(""); }} className={fieldClass} required />
        </label>

        <label className="text-xs font-extrabold text-[var(--muted)]">
          Duration
          <select value={duration} onChange={(event) => { setDuration(Number(event.target.value)); setSubmitError(""); }} className={fieldClass}>
            {Array.from({ length: 8 }, (_, index) => index + 1).map((hours) => <option key={hours} value={hours}>{hours} {hours === 1 ? "hour" : "hours"}</option>)}
          </select>
        </label>

        <label className="text-xs font-extrabold text-[var(--muted)]">
          Number of people
          <select value={people} onChange={(event) => { setPeople(Number(event.target.value)); setSubmitError(""); }} className={fieldClass}>
            {people > workspace.capacity && <option value={people}>{people} exceeds capacity</option>}
            {Array.from({ length: workspace.capacity }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count}</option>)}
          </select>
        </label>

        <label className="text-xs font-extrabold text-[var(--muted)]">
          Starting time
          <select value={selectedTime} onChange={(event) => { setTime(event.target.value); setSubmitError(""); }} className={fieldClass} disabled={slots.length === 0 || checkingDatabase}>
            {checkingDatabase && <option value="">Checking availability...</option>}
            {!checkingDatabase && slots.length === 0 && <option value="">No available times</option>}
            {selectedTime && !slots.includes(selectedTime) && <option value={selectedTime}>{selectedTime} unavailable</option>}
            {slots.map((slot) => <option key={slot} value={slot}>{slot} to {getEndTime(slot, duration)}</option>)}
          </select>
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="text-xs font-extrabold text-[var(--muted)]">Workspace option</legend>
        <div className="mt-2 space-y-2">
          {options.map((option) => (
            <label key={option.id} className={`block cursor-pointer rounded-xl border p-3 ${optionId === option.id ? "border-[#6BAEDB] bg-[#edf8fe]" : "border-[var(--line)] bg-white"}`}>
              <span className="flex items-start gap-2.5">
                <input type="radio" name="workspace-option" value={option.id} checked={optionId === option.id} onChange={() => setOptionId(option.id)} className="mt-0.5 size-4 accent-[#246B9C]" />
                <span>
                  <span className="block text-sm font-extrabold">{option.label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-[var(--muted)]">{option.description}</span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={`mt-5 flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-sm font-bold ${availability.available ? "bg-[#e9f7ef] text-[#17633a]" : "bg-[#fff1f0] text-[#9b2c27]"}`} aria-live="polite">
        {availability.available ? <Check size={18} weight="bold" className="mt-0.5 shrink-0" /> : <Clock size={18} weight="bold" className="mt-0.5 shrink-0" />}
        <span>{availability.message}</span>
      </div>

      <div className="mt-5 rounded-xl bg-[var(--surface)] p-4">
        <div className="flex justify-between gap-4 text-sm text-[var(--muted)]">
          <span>{formatPrice(workspace.pricePerHour)} x {duration} {duration === 1 ? "hour" : "hours"}</span>
          <strong className="text-[var(--text)]">{workspace.priceUnit === "room" ? formatPrice(total) : formatPrice(workspace.pricePerHour * duration)}</strong>
        </div>
        <div className="mt-2 flex justify-between gap-4 text-sm text-[var(--muted)]">
          <span>Quantity</span>
          <strong className="text-[var(--text)]">{quantityLabel}</strong>
        </div>
        <div className="mt-4 flex items-end justify-between gap-4 border-t border-[var(--line)] pt-4">
          <div><strong>Total</strong><p className="text-xs text-[var(--muted)]">No hidden fees</p></div>
          <strong className="text-2xl font-black">{formatPrice(total)}</strong>
        </div>
      </div>

      {workspace.purchaseCondition && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#abd3eb] bg-[#edf8fe] p-3.5 text-xs font-semibold leading-relaxed text-[#36586f]">
          <Info size={18} className="mt-0.5 shrink-0 text-[#327eaf]" />
          <span><strong className="text-[#17364b]">Purchase condition:</strong> {workspace.purchaseCondition}</span>
        </div>
      )}

      {submitError && <p role="alert" className="mt-4 text-sm font-bold text-[#9b2c27]">{submitError}</p>}

      <button
        type="submit"
        disabled={!availability.available || isPending || checkingDatabase}
        className="mt-5 flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#246B9C] px-5 py-3.5 font-extrabold text-white shadow-[0_10px_24px_rgba(36,107,156,0.2)] hover:bg-[#1c567e] disabled:cursor-not-allowed disabled:bg-[#8bb8d4]"
      >
        <CreditCard size={19} weight="bold" /> {isPending ? "Opening summary..." : "Review reservation"}
      </button>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-[var(--muted)]">{databaseMode ? "Live availability from the shared Supabase database. Capacity is checked again at confirmation." : "Local demonstration mode until Supabase environment variables are configured."}</p>
    </form>
  );
}
