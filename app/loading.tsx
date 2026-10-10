export default function Loading() {
  return (
    <main className="min-h-[calc(100dvh-72px)] bg-[var(--surface)] py-12" aria-label="Loading page">
      <div className="page-shell animate-pulse">
        <div className="h-8 w-52 rounded-xl bg-[var(--surface-strong)]" />
        <div className="mt-8 h-72 rounded-2xl bg-[var(--surface-strong)]" />
      </div>
    </main>
  );
}
