import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Buildings,
  Coffee,
  CurrencyEur,
  Desk,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkle,
  Star,
  Student,
  UsersThree,
  WifiHigh,
} from "@phosphor-icons/react/dist/ssr";
import heroImage from "@/public/images/hero-workspace.jpg";
import studyImage from "@/public/images/quiet-study.jpg";
import meetingImage from "@/public/images/meeting-room.jpg";
import { SearchPanel } from "@/components/search-panel";

type SpaceCardProps = {
  image: StaticImageData;
  name: string;
  area: string;
  meta: string;
  price: string;
  rating: string;
  large?: boolean;
};

function SpaceCard({ image, name, area, meta, price, rating, large = false }: SpaceCardProps) {
  return (
    <article className={`group relative overflow-hidden rounded-2xl bg-[var(--card)] ring-1 ring-[var(--line)] ${large ? "md:row-span-2" : ""}`}>
      <div className={`relative overflow-hidden ${large ? "h-[310px] md:h-full md:min-h-[520px]" : "h-[230px]"}`}>
        <Image
          src={image}
          alt={`${name}, a fictional sample workspace in Madrid`}
          fill
          sizes={large ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 100vw, 38vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#102f43]/90 to-transparent" />
        <Link
          href="/sign-in"
          aria-label={`Sign in to save ${name} to favourites`}
          className="absolute right-4 top-4 grid size-10 place-items-center rounded-xl bg-white/95 text-[#243B53] shadow-md hover:bg-white"
        >
          <Heart size={20} weight="bold" />
        </Link>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-white/90">
            <span className="flex items-center gap-1"><MapPin size={15} weight="fill" />{area}</span>
            <span className="flex items-center gap-1"><Star size={15} weight="fill" />{rating}</span>
          </div>
          <h3 className={`${large ? "text-2xl sm:text-3xl" : "text-xl"} font-extrabold tracking-[-0.035em]`}>{name}</h3>
          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="text-sm text-white/85">{meta}</p>
            <p className="shrink-0 text-right text-sm text-white/85"><strong className="text-lg text-white">{price}</strong> / hour</p>
          </div>
        </div>
      </div>
    </article>
  );
}

const categories = [
  { label: "Free work-friendly cafés", icon: Coffee, href: "/workspaces?type=cafe&price=free", note: "Reserve for €0" },
  { label: "Quiet study spaces", icon: Student, href: "/workspaces?type=study", note: "From €2 per person" },
  { label: "Coworking spaces", icon: Desk, href: "/workspaces?type=coworking", note: "Desks by the hour" },
  { label: "Meeting rooms", icon: UsersThree, href: "/workspaces?type=meeting-room", note: "From €8 per room" },
];

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden bg-[var(--surface)]">
        <div className="page-shell grid items-center gap-8 py-8 md:min-h-[540px] md:grid-cols-2 md:py-10 lg:gap-10">
          <div className="relative z-10 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-xs font-bold text-[var(--muted)] shadow-sm">
              <ShieldCheck size={17} className="text-[#327eaf]" weight="fill" />
              Unofficial student concept
            </div>
            <h1 className="text-balance text-[clamp(2.45rem,4.2vw,3.4rem)] font-black leading-[0.98] tracking-[-0.06em] text-[var(--text)]">
              <span className="lg:block">Your perfect workspace,</span>{" "}
              <span className="lg:block">just a booking away.</span>
            </h1>
            <p className="mt-6 max-w-[55ch] text-lg leading-relaxed text-[var(--muted)]">
              Discover cafés, coworking spaces and inspiring places to work, study or collaborate by the hour.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-5 text-sm font-semibold text-[var(--muted)]">
              <span className="flex items-center gap-2"><CurrencyEur size={19} className="text-[#327eaf]" />Clear hourly prices</span>
              <span className="flex items-center gap-2"><WifiHigh size={19} className="text-[#327eaf]" />Work-ready amenities</span>
            </div>
          </div>

          <div className="relative min-h-[230px] overflow-hidden rounded-2xl shadow-[0_28px_80px_rgba(56,120,160,0.22)] ring-1 ring-[var(--line)] sm:min-h-[360px] md:min-h-[460px]">
            <Image
              src={heroImage}
              alt="Students and remote workers in a bright fictional Madrid workspace café"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-5 pb-12 sm:-mt-8">
        <div className="page-shell">
          <SearchPanel />
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Search by city, neighbourhood or a specific workspace name. Sample listings are fictional demonstration data.
          </p>
        </div>
      </section>

      <section id="spaces" className="page-shell py-14 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black tracking-[-0.045em] sm:text-4xl">Popular workspaces in Madrid</h2>
          <p className="mt-3 text-[var(--muted)]">A first look at flexible spaces designed around your time, budget and way of working.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-[1.35fr_0.85fr] md:grid-rows-2">
          <SpaceCard image={heroImage} name="Luz de Barrio Café" area="Malasaña" meta="Café workspace · Pay at venue" price="€2.50" rating="4.7" large />
          <SpaceCard image={studyImage} name="Nido Study Club" area="Moncloa" meta="Quiet desk · Per person" price="€3" rating="4.8" />
          <SpaceCard image={meetingImage} name="Sala Cibeles" area="Centro" meta="Meeting room · Up to 6 people" price="€12" rating="4.6" />
        </div>
        <div className="mt-7 flex justify-start">
          <Link href="/workspaces" className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-5 py-3 font-bold text-[var(--brand-deep)] hover:bg-[var(--surface)]">
            Browse workspaces <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
      </section>

      <section className="bg-[var(--surface)] py-16 sm:py-20">
        <div className="page-shell">
          <h2 className="max-w-xl text-3xl font-black tracking-[-0.045em] sm:text-4xl">Choose the space that fits the day</h2>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">From a free café table to a private room for the whole team.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.label}
                  href={category.href}
                  className={`group rounded-2xl border p-5 ${
                    index === 0
                      ? "border-[#8cc4e8] bg-[#dff1fc] text-[#17364b]"
                      : "border-[var(--line)] bg-[var(--card)] text-[var(--text)]"
                  } hover:-translate-y-1 hover:border-[#6BAEDB] hover:shadow-[0_14px_35px_rgba(71,132,170,0.12)]`}
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-[var(--background)] text-[#327eaf] ring-1 ring-[var(--line)]">
                    <Icon size={23} weight="duotone" />
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold tracking-[-0.025em]">{category.label}</h3>
                  <p className={`mt-1 text-sm ${index === 0 ? "text-[#36586f]" : "text-[var(--muted)]"}`}>{category.note}</p>
                  <ArrowRight size={18} className="mt-5 transition-transform group-hover:translate-x-1" weight="bold" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-shell py-16 sm:py-24">
        <div className="grid items-stretch gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-2xl bg-[#246B9C] p-7 text-white sm:p-10">
            <CurrencyEur size={34} weight="duotone" />
            <h2 className="mt-12 text-3xl font-black tracking-[-0.045em] sm:text-4xl">Affordable places to work</h2>
            <p className="mt-4 max-w-md leading-relaxed text-[#e4f3fc]">Start with free café reservations, €2 study seats and coworking desks from €4 per hour.</p>
            <Link href="/workspaces?sort=price" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-extrabold text-[#1d5f8d] hover:bg-[#eef8fd]">
              Find a budget space <ArrowRight size={18} weight="bold" />
            </Link>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <Coffee size={28} className="text-[#327eaf]" weight="duotone" />
              <h2 className="text-2xl font-black tracking-[-0.035em]">Free work-friendly cafés</h2>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">Reserve at €0. Any food or drink requirement is shown before you book.</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {["Patio Norte Café", "Mesa Clara Lavapiés"].map((name, index) => (
                <article key={name} className="rounded-2xl bg-[var(--surface)] p-5 ring-1 ring-[var(--line)]">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-[var(--background)] text-[#327eaf] ring-1 ring-[var(--line)]">
                      {index === 0 ? <Sparkle size={20} weight="duotone" /> : <Coffee size={20} weight="duotone" />}
                    </span>
                    <strong className="text-xl">€0</strong>
                  </div>
                  <h3 className="mt-6 text-lg font-extrabold">{name}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">{index === 0 ? "Chamberí · Drink purchase required" : "Lavapiés · No minimum purchase"}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--surface)] py-16 sm:py-20">
        <div className="page-shell grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-3">
              <Buildings size={30} className="text-[#327eaf]" weight="duotone" />
              <h2 className="text-3xl font-black tracking-[-0.045em] sm:text-4xl">Recommended spaces in Madrid</h2>
            </div>
            <p className="mt-3 max-w-2xl text-[var(--muted)]">Compare clear sample prices and amenities before choosing where your next productive hour happens.</p>
          </div>
          <Link href="/workspaces?city=madrid" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#246B9C] px-5 py-3 font-extrabold text-white hover:bg-[#1c567e]">
            See Madrid spaces <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
      </section>

      <footer className="bg-[var(--background)] py-10">
        <div className="page-shell grid gap-6 border-b border-[var(--line)] pb-8 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <div className="flex items-center gap-2 font-extrabold tracking-[-0.035em]">
              <Buildings size={22} className="text-[#327eaf]" weight="fill" />
              bookingworkspace
            </div>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">An unofficial university concept exploring how Booking.com could make flexible workspaces easier to discover and reserve.</p>
          </div>
          <p className="text-sm text-[var(--muted)]">Team member names will be added here.</p>
        </div>
        <div className="page-shell flex flex-col gap-2 pt-6 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>Fictional listings and illustrative prices for academic demonstration only.</p>
          <p>Not affiliated with or endorsed by Booking.com.</p>
        </div>
      </footer>
    </main>
  );
}
