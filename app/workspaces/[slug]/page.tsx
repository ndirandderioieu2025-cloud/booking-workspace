import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  MapPin,
  Plug,
  ShieldCheck,
  Star,
  Users,
  WifiHigh,
} from "@phosphor-icons/react/dist/ssr";
import { BookingPanel } from "@/components/booking-panel";
import { getPersistedWorkspace } from "@/lib/supabase/workspaces";
import {
  formatPrice,
  paymentMethodLabels,
  priceUnitLabels,
  workspaces,
  workspaceTypeLabels,
} from "@/lib/workspaces";

type PageParams = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toQueryString(values: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else if (value) params.set(key, value);
  });
  return params.toString();
}

export function generateStaticParams() {
  return workspaces.map((workspace) => ({ slug: workspace.slug }));
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { slug } = await params;
  const workspace = await getPersistedWorkspace(slug);
  if (!workspace) return { title: "Workspace not found | Booking Workspace" };
  return {
    title: `${workspace.name} | Booking Workspace`,
    description: `${workspace.description} Fictional demonstration listing in ${workspace.neighborhood}, Madrid.`,
  };
}

export default async function WorkspaceDetailPage({ params, searchParams }: { params: PageParams; searchParams: SearchParams }) {
  const [{ slug }, selected] = await Promise.all([params, searchParams]);
  const workspace = await getPersistedWorkspace(slug);
  if (!workspace) notFound();

  const queryString = toQueryString(selected);
  const date = firstValue(selected.date);
  const time = firstValue(selected.time);
  const duration = Math.max(1, Number(firstValue(selected.duration)) || 1);
  const people = Math.max(1, Number(firstValue(selected.people)) || 1);

  return (
    <main className="min-h-[calc(100dvh-72px)] bg-[var(--surface)] pb-16">
      <div className="page-shell py-7 sm:py-9">
        <Link
          href={`/workspaces${queryString ? `?${queryString}` : ""}`}
          className="inline-flex items-center gap-2 text-sm font-extrabold text-[#245f87] hover:underline"
        >
          <ArrowLeft size={17} weight="bold" /> Back to search results
        </Link>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_16px_50px_rgba(71,132,170,0.12)]">
          <div className="relative min-h-[320px] sm:min-h-[450px] lg:min-h-[540px]">
            <Image
              src={workspace.image}
              alt={`${workspace.name}, fictional demonstration workspace in Madrid`}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#102f43]/90 via-[#102f43]/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-9">
              <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                <span className="rounded-lg bg-white/95 px-2.5 py-1.5 text-[#245f87]">{workspaceTypeLabels[workspace.type]}</span>
                <span className="rounded-lg bg-[#102f43]/70 px-2.5 py-1.5 backdrop-blur-sm">Sample listing</span>
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] sm:text-5xl">{workspace.name}</h1>
              <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-white/90 sm:text-base">
                <MapPin size={18} weight="fill" /> {workspace.neighborhood}, Madrid
              </p>
            </div>
          </div>
        </section>

        <div className="mt-7 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_350px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--line)] bg-white p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold text-[#2d719f]">About this workspace</p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.035em]">A practical place for focused time</h2>
                </div>
                <div className="shrink-0 rounded-xl bg-[var(--surface-strong)] px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-black"><Star size={18} weight="fill" className="text-[#327eaf]" /> {workspace.sampleScore}</div>
                  <p className="mt-0.5 text-[11px] font-bold text-[var(--muted)]">Demo score, not reviews</p>
                </div>
              </div>
              <p className="mt-5 max-w-3xl leading-relaxed text-[var(--muted)]">{workspace.description}</p>
              <div className="mt-6 rounded-xl bg-[var(--surface)] p-4 text-sm leading-relaxed text-[var(--muted)]">
                <strong className="text-[var(--text)]">Fictional address:</strong> {workspace.address}. This venue and address are sample data created for the university prototype.
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--line)] bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-black tracking-[-0.035em]">Facilities and amenities</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {workspace.facilities.map((facility) => (
                  <div key={facility} className="flex items-center gap-3 rounded-xl bg-[var(--surface)] px-4 py-3 text-sm font-bold">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white text-[#2d719f] ring-1 ring-[var(--line)]"><Check size={15} weight="bold" /></span>
                    {facility}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-[var(--muted)]">
                {workspace.amenities.wifi && <span className="flex items-center gap-2"><WifiHigh size={18} className="text-[#327eaf]" /> Wi-Fi available</span>}
                {workspace.amenities.outlets && <span className="flex items-center gap-2"><Plug size={18} className="text-[#327eaf]" /> Power outlets</span>}
                <span className="flex items-center gap-2"><Users size={18} className="text-[#327eaf]" /> Maximum {workspace.capacity} people</span>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--line)] bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-black tracking-[-0.035em]">Practical information</h2>
              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Opening hours</dt>
                  <dd className="mt-1.5 font-bold">{workspace.openingHours.open} to {workspace.openingHours.close}</dd>
                </div>
                <div>
                  <dt className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Hourly price</dt>
                  <dd className="mt-1.5 font-bold">{formatPrice(workspace.pricePerHour)} {priceUnitLabels[workspace.priceUnit]}</dd>
                </div>
                <div>
                  <dt className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Payment options</dt>
                  <dd className="mt-1.5 font-bold">{workspace.paymentMethods.map((method) => paymentMethodLabels[method]).join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Cancellation</dt>
                  <dd className="mt-1.5 font-bold">{workspace.cancellation}</dd>
                </div>
              </dl>
              {workspace.purchaseCondition && (
                <div className="mt-6 rounded-xl border border-[#abd3eb] bg-[#edf8fe] p-4 text-sm font-semibold text-[#36586f]">
                  <strong className="text-[#17364b]">Venue condition:</strong> {workspace.purchaseCondition}
                </div>
              )}
            </section>
          </div>

          <aside className="order-first lg:order-none lg:sticky lg:top-24">
            <BookingPanel
              workspace={workspace}
              queryString={queryString}
              initialDate={date}
              initialTime={time}
              initialDuration={duration}
              initialPeople={people}
            />

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#327eaf]" weight="duotone" />
              <p><strong className="text-[var(--text)]">University prototype.</strong> No real venue partnership or customer reviews are claimed.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
