"use client";

import {
  CalendarBlank,
  Clock,
  HourglassMedium,
  MagnifyingGlass,
  MapPin,
  Users,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";

function getLocalDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export type SearchValues = {
  destination: string;
  date: string;
  time: string;
  duration: string;
  people: string;
};

export function SearchPanel({
  initialValues,
  compact = false,
  showHelper = false,
}: {
  initialValues?: Partial<SearchValues>;
  compact?: boolean;
  showHelper?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [destination, setDestination] = useState(initialValues?.destination ?? "");
  const [date, setDate] = useState(() => initialValues?.date ?? getLocalDate(1));
  const [time, setTime] = useState(initialValues?.time ?? "10:00");
  const [duration, setDuration] = useState(initialValues?.duration ?? "2");
  const [people, setPeople] = useState(initialValues?.people ?? "1");
  const [error, setError] = useState("");
  const minDate = useMemo(() => getLocalDate(), []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!destination.trim()) {
      setError("Enter a city, neighbourhood or workspace name.");
      return;
    }
    if (!date) {
      setError("Choose a date for your visit.");
      return;
    }

    setError("");
    const query = new URLSearchParams({
      q: destination.trim(),
      date,
      time,
      duration,
      people,
    });
    startTransition(() => router.push(`/workspaces?${query.toString()}`));
  }

  const fieldClass =
    "w-full min-w-0 bg-transparent text-[15px] font-semibold text-[var(--text)] outline-none placeholder:text-[#60798b]";

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl bg-[var(--card)] p-3 ring-1 ring-[var(--line)] ${compact ? "shadow-[0_12px_36px_rgba(71,132,170,0.12)]" : "shadow-[var(--shadow)]"}`}
      noValidate
    >
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(240px,2fr)_1.2fr_1fr_1fr_0.8fr_auto]">
        <label className="flex min-h-[76px] items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 focus-within:border-[#327eaf] focus-within:ring-2 focus-within:ring-[#A9D6F5] sm:col-span-2 lg:col-span-1">
          <MapPin size={21} className="shrink-0 text-[#327eaf]" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-[var(--muted)]">Destination or workspace</span>
            <input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className={fieldClass}
              placeholder="Try Madrid or a venue name"
              aria-describedby={error ? "search-error" : undefined}
            />
          </span>
        </label>

        <label className="flex min-h-[76px] items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 focus-within:border-[#327eaf] focus-within:ring-2 focus-within:ring-[#A9D6F5]">
          <CalendarBlank size={21} className="shrink-0 text-[#327eaf]" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-[var(--muted)]">Date</span>
            <input type="date" min={minDate} value={date} onChange={(event) => setDate(event.target.value)} className={fieldClass} />
          </span>
        </label>

        <label className="flex min-h-[76px] items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 focus-within:border-[#327eaf] focus-within:ring-2 focus-within:ring-[#A9D6F5]">
          <Clock size={21} className="shrink-0 text-[#327eaf]" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-[var(--muted)]">Start time</span>
            <input type="time" value={time} onChange={(event) => setTime(event.target.value)} className={fieldClass} />
          </span>
        </label>

        <label className="flex min-h-[76px] items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 focus-within:border-[#327eaf] focus-within:ring-2 focus-within:ring-[#A9D6F5]">
          <HourglassMedium size={21} className="shrink-0 text-[#327eaf]" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-[var(--muted)]">Duration</span>
            <select value={duration} onChange={(event) => setDuration(event.target.value)} className={fieldClass}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
                <option key={hours} value={hours}>
                  {hours} {hours === 1 ? "hour" : "hours"}
                </option>
              ))}
            </select>
          </span>
        </label>

        <label className="flex min-h-[76px] items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 focus-within:border-[#327eaf] focus-within:ring-2 focus-within:ring-[#A9D6F5]">
          <Users size={21} className="shrink-0 text-[#327eaf]" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-[var(--muted)]">People</span>
            <select value={people} onChange={(event) => setPeople(event.target.value)} className={fieldClass}>
              {[1, 2, 3, 4, 5, 6, 8, 10].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </span>
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="flex min-h-[76px] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#246B9C] px-6 font-extrabold text-white shadow-[0_10px_24px_rgba(36,107,156,0.22)] hover:bg-[#1c567e] disabled:cursor-wait disabled:opacity-70 sm:col-span-2 lg:col-span-1"
        >
          <MagnifyingGlass size={20} weight="bold" aria-hidden="true" />
          {isPending ? "Searching" : "Search"}
        </button>
      </div>
      {error && (
        <p id="search-error" role="alert" className="px-2 pt-3 text-sm font-semibold text-[#b42318]">
          {error}
        </p>
      )}
      {showHelper && !error && (
        <p className="px-2 pt-3 text-xs text-[var(--muted)]">Change any search detail and select Search to refresh availability.</p>
      )}
    </form>
  );
}
