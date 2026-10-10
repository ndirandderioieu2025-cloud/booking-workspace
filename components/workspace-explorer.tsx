"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  FadersHorizontal,
  MapPin,
  Plug,
  Star,
  Users,
  WifiHigh,
} from "@phosphor-icons/react";
import { useMemo } from "react";
import { SearchPanel } from "@/components/search-panel";
import {
  calculateTotal,
  formatPrice,
  isWorkspaceAvailable,
  normalizeSearch,
  priceUnitLabels,
  workspaces as localWorkspaces,
  workspaceTypeLabels,
  type Workspace,
  type WorkspaceType,
} from "@/lib/workspaces";

const filterKeys = ["type", "minPrice", "maxPrice", "wifi", "outlets", "quiet", "capacity", "access", "price", "sort"];

function asPositiveNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function FilterControls({
  prefix,
  selectedTypes,
  onParamChange,
  searchParams,
}: {
  prefix: string;
  selectedTypes: WorkspaceType[];
  onParamChange: (key: string, value?: string) => void;
  searchParams: URLSearchParams;
}) {
  function toggleType(type: WorkspaceType) {
    const next = selectedTypes.includes(type) ? selectedTypes.filter((item) => item !== type) : [...selectedTypes, type];
    onParamChange("type", next.length ? next.join(",") : undefined);
  }

  const checkboxClass = "size-4 rounded border-[#8bbbd8] accent-[#246B9C]";
  const sectionClass = "border-b border-[var(--line)] py-5 last:border-0";

  return (
    <div>
      <fieldset className={sectionClass}>
        <legend className="text-sm font-extrabold">Workspace type</legend>
        <div className="mt-3 space-y-2.5">
          {(Object.entries(workspaceTypeLabels) as [WorkspaceType, string][]).map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--muted)]">
              <input type="checkbox" checked={selectedTypes.includes(value)} onChange={() => toggleType(value)} className={checkboxClass} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={sectionClass}>
        <legend className="text-sm font-extrabold">Hourly price</legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="text-xs font-bold text-[var(--muted)]">
            Minimum
            <select
              id={`${prefix}-min-price`}
              value={searchParams.get("minPrice") ?? "0"}
              onChange={(event) => onParamChange("minPrice", event.target.value === "0" ? undefined : event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-white px-2.5 py-2 text-sm font-semibold text-[var(--text)]"
            >
              {[0, 2, 4, 6, 8].map((price) => <option key={price} value={price}>€{price}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-[var(--muted)]">
            Maximum
            <select
              id={`${prefix}-max-price`}
              value={searchParams.get("maxPrice") ?? "15"}
              onChange={(event) => onParamChange("maxPrice", event.target.value === "15" ? undefined : event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-white px-2.5 py-2 text-sm font-semibold text-[var(--text)]"
            >
              {[2, 4, 6, 8, 10, 15].map((price) => <option key={price} value={price}>€{price}</option>)}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className={sectionClass}>
        <legend className="text-sm font-extrabold">Free or paid</legend>
        <div className="mt-3 space-y-2.5">
          {[
            ["all", "All spaces"],
            ["free", "Free spaces"],
            ["paid", "Paid spaces"],
          ].map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--muted)]">
              <input
                type="radio"
                name={`${prefix}-access`}
                checked={(searchParams.get("access") ?? (searchParams.get("price") === "free" ? "free" : "all")) === value}
                onChange={() => onParamChange("access", value === "all" ? undefined : value)}
                className="size-4 accent-[#246B9C]"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={sectionClass}>
        <legend className="text-sm font-extrabold">Facilities</legend>
        <div className="mt-3 space-y-2.5">
          {[
            ["wifi", "Wi-Fi"],
            ["outlets", "Power outlets"],
            ["quiet", "Quiet environment"],
          ].map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                checked={searchParams.get(value) === "1"}
                onChange={(event) => onParamChange(value, event.target.checked ? "1" : undefined)}
                className={checkboxClass}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className={sectionClass}>
        <label htmlFor={`${prefix}-capacity`} className="text-sm font-extrabold">Minimum capacity</label>
        <select
          id={`${prefix}-capacity`}
          value={searchParams.get("capacity") ?? "0"}
          onChange={(event) => onParamChange("capacity", event.target.value === "0" ? undefined : event.target.value)}
          className="mt-3 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm font-semibold"
        >
          <option value="0">Any capacity</option>
          {[2, 4, 6, 8, 10, 20].map((count) => <option key={count} value={count}>{count}+ people</option>)}
        </select>
      </div>
    </div>
  );
}

function WorkspaceCard({ workspace, query, duration, people }: { workspace: Workspace; query: string; duration: number; people: number }) {
  const total = calculateTotal(workspace, duration, people);
  const detailHref = `/workspaces/${workspace.slug}${query ? `?${query}` : ""}`;

  return (
    <Link
      href={detailHref}
      className="group grid overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] shadow-[0_8px_26px_rgba(71,132,170,0.08)] hover:-translate-y-0.5 hover:border-[#83bfe4] hover:shadow-[0_18px_42px_rgba(71,132,170,0.16)] md:grid-cols-[250px_1fr]"
    >
      <div className="relative min-h-[220px] overflow-hidden md:min-h-full">
        <Image
          src={workspace.image}
          alt={`${workspace.name}, fictional demonstration workspace in Madrid`}
          fill
          sizes="(max-width: 768px) 100vw, 250px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
        />
        <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-extrabold text-[#245f87] shadow-sm">
          {workspaceTypeLabels[workspace.type]}
        </span>
      </div>

      <article className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-[-0.035em] text-[var(--text)] group-hover:text-[#1d5f8d] sm:text-2xl">{workspace.name}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#2d719f]">
                <MapPin size={16} weight="fill" /> {workspace.neighborhood}, Madrid
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-lg bg-[var(--surface-strong)] px-2.5 py-1.5 text-sm font-extrabold">
              <Star size={15} weight="fill" className="text-[#327eaf]" /> {workspace.sampleScore}
            </span>
          </div>

          <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{workspace.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {workspace.amenities.wifi && <span className="flex items-center gap-1.5 rounded-lg bg-[var(--surface)] px-2.5 py-1.5 text-xs font-bold"><WifiHigh size={15} /> Wi-Fi</span>}
            {workspace.amenities.outlets && <span className="flex items-center gap-1.5 rounded-lg bg-[var(--surface)] px-2.5 py-1.5 text-xs font-bold"><Plug size={15} /> Outlets</span>}
            {workspace.amenities.quiet && <span className="flex items-center gap-1.5 rounded-lg bg-[var(--surface)] px-2.5 py-1.5 text-xs font-bold"><Check size={15} /> Quiet</span>}
            <span className="flex items-center gap-1.5 rounded-lg bg-[var(--surface)] px-2.5 py-1.5 text-xs font-bold"><Users size={15} /> Up to {workspace.capacity}</span>
          </div>
          {workspace.purchaseCondition && <p className="mt-4 text-xs font-semibold text-[#5b6f7c]">{workspace.purchaseCondition}</p>}
        </div>

        <div className="flex min-w-[154px] flex-col justify-end border-t border-[var(--line)] pt-4 text-left lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0 lg:text-right">
          <span className="text-xs font-semibold text-[var(--muted)]">Hourly price</span>
          <strong className="mt-1 text-2xl font-black tracking-[-0.035em]">{formatPrice(workspace.pricePerHour)}</strong>
          <span className="text-xs text-[var(--muted)]">{priceUnitLabels[workspace.priceUnit]}</span>
          <span className="mt-3 text-sm font-extrabold text-[#245f87]">{formatPrice(total)} total</span>
          <span className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#246B9C] px-4 py-2.5 text-sm font-extrabold text-white">
            View details <ArrowRight size={16} weight="bold" />
          </span>
        </div>
      </article>
    </Link>
  );
}

export function WorkspaceExplorer({ initialWorkspaces = localWorkspaces }: { initialWorkspaces?: Workspace[] }) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const queryString = currentSearchParams.toString();
  const params = useMemo(() => new URLSearchParams(queryString), [queryString]);
  const selectedTypes = useMemo(
    () => (params.get("type")?.split(",").filter(Boolean) ?? []) as WorkspaceType[],
    [params],
  );
  const duration = asPositiveNumber(params.get("duration"), 1);
  const people = asPositiveNumber(params.get("people"), 1);

  function updateParam(key: string, value?: string) {
    const next = new URLSearchParams(queryString);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "access") next.delete("price");
    router.replace(`/workspaces${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
  }

  function clearFilters() {
    const next = new URLSearchParams(queryString);
    filterKeys.forEach((key) => next.delete(key));
    router.replace(`/workspaces${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
  }

  const results = useMemo(() => {
    const search = normalizeSearch(params.get("q") ?? params.get("city") ?? "");
    const minPrice = Number(params.get("minPrice") ?? 0);
    const maxPrice = Number(params.get("maxPrice") ?? 15);
    const minimumCapacity = Number(params.get("capacity") ?? 0);
    const access = params.get("access") ?? (params.get("price") === "free" ? "free" : "all");
    const date = params.get("date") ?? undefined;
    const time = params.get("time") ?? undefined;

    const filtered = initialWorkspaces.filter((workspace) => {
      const searchable = normalizeSearch(`${workspace.name} ${workspace.neighborhood} ${workspace.city} ${workspaceTypeLabels[workspace.type]}`);
      if (search && !searchable.includes(search)) return false;
      if (selectedTypes.length && !selectedTypes.includes(workspace.type)) return false;
      if (workspace.pricePerHour < minPrice || workspace.pricePerHour > maxPrice) return false;
      if (access === "free" && workspace.pricePerHour !== 0) return false;
      if (access === "paid" && workspace.pricePerHour === 0) return false;
      if (params.get("wifi") === "1" && !workspace.amenities.wifi) return false;
      if (params.get("outlets") === "1" && !workspace.amenities.outlets) return false;
      if (params.get("quiet") === "1" && !workspace.amenities.quiet) return false;
      if (workspace.capacity < minimumCapacity) return false;
      return isWorkspaceAvailable(workspace, { date, time, duration, people });
    });

    const sort = params.get("sort") ?? "recommended";
    return [...filtered].sort((a, b) => {
      if (sort === "price" || sort === "price-asc") return a.pricePerHour - b.pricePerHour;
      if (sort === "price-desc") return b.pricePerHour - a.pricePerHour;
      if (sort === "rating") return b.sampleScore - a.sampleScore;
      return a.recommendedRank - b.recommendedRank;
    });
  }, [params, selectedTypes, duration, people, initialWorkspaces]);

  const destination = params.get("q") ?? params.get("city") ?? "Madrid";
  const activeFilterCount = filterKeys.filter((key) => params.has(key)).length;

  return (
    <main className="min-h-[calc(100dvh-72px)] bg-[var(--surface)] pb-16">
      <section className="border-b border-[var(--line)] bg-white py-7 sm:py-9">
        <div className="page-shell">
          <p className="mb-3 text-sm font-bold text-[#2d719f]">Madrid workspace search</p>
          <h1 className="text-3xl font-black tracking-[-0.045em] sm:text-4xl">Find a space that fits your day</h1>
          <div className="mt-6">
            <SearchPanel
              key={queryString}
              compact
              showHelper
              initialValues={{
                destination,
                date: params.get("date") ?? undefined,
                time: params.get("time") ?? undefined,
                duration: params.get("duration") ?? undefined,
                people: params.get("people") ?? undefined,
              }}
            />
          </div>
        </div>
      </section>

      <div className="page-shell pt-7">
        <details className="mb-5 rounded-2xl border border-[var(--line)] bg-white p-4 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between font-extrabold">
            <span className="flex items-center gap-2"><FadersHorizontal size={20} /> Filters</span>
            {activeFilterCount > 0 && <span className="rounded-lg bg-[var(--surface-strong)] px-2 py-1 text-xs text-[#245f87]">{activeFilterCount} active</span>}
          </summary>
          <FilterControls prefix="mobile" selectedTypes={selectedTypes} onParamChange={updateParam} searchParams={params} />
          {activeFilterCount > 0 && <button onClick={clearFilters} className="mt-3 text-sm font-extrabold text-[#245f87] hover:underline">Clear all filters</button>}
        </details>

        <div className="grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_8px_30px_rgba(71,132,170,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-black"><FadersHorizontal size={20} /> Filters</h2>
                {activeFilterCount > 0 && <button onClick={clearFilters} className="text-xs font-extrabold text-[#245f87] hover:underline">Clear all</button>}
              </div>
              <FilterControls prefix="desktop" selectedTypes={selectedTypes} onParamChange={updateParam} searchParams={params} />
            </div>
          </aside>

          <section aria-live="polite">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--muted)]">Fictional demonstration listings</p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.035em]">{results.length} {results.length === 1 ? "workspace" : "workspaces"} available</h2>
              </div>
              <label className="flex items-center gap-2 text-sm font-bold text-[var(--muted)]">
                Sort by
                <select
                  value={params.get("sort") ?? "recommended"}
                  onChange={(event) => updateParam("sort", event.target.value === "recommended" ? undefined : event.target.value)}
                  className="rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 font-bold text-[var(--text)]"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price, low to high</option>
                  <option value="price-desc">Price, high to low</option>
                  <option value="rating">Demo score</option>
                </select>
              </label>
            </div>

            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((workspace) => (
                  <WorkspaceCard key={workspace.slug} workspace={workspace} query={queryString} duration={duration} people={people} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[var(--line)] bg-white p-8 text-center shadow-[0_8px_30px_rgba(71,132,170,0.08)] sm:p-12">
                <div className="mx-auto grid size-12 place-items-center rounded-xl bg-[var(--surface-strong)] text-[#2d719f]"><FadersHorizontal size={24} /></div>
                <h2 className="mt-5 text-2xl font-black tracking-[-0.035em]">No exact match yet</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">Try a different start time, fewer people or broader filters. Your main search details will stay in place.</p>
                <button onClick={clearFilters} className="mt-6 rounded-xl bg-[#246B9C] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#1c567e]">Clear filters</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
