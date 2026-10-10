import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[calc(100dvh-72px)] place-items-center bg-[var(--surface)] px-4 text-center">
      <div>
        <p className="text-sm font-bold text-[var(--brand-deep)]">Page not found</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">This workspace has moved</h1>
        <p className="mt-3 text-[var(--muted)]">Return to the homepage and begin a new search.</p>
        <Link href="/" className="mt-7 inline-flex rounded-xl bg-[#246B9C] px-5 py-3 font-extrabold text-white hover:bg-[#1c567e]">
          Go to homepage
        </Link>
      </div>
    </main>
  );
}
