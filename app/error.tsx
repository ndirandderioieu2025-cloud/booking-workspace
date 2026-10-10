"use client";

import { WarningCircle } from "@phosphor-icons/react";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-[calc(100dvh-72px)] place-items-center bg-[var(--surface)] px-4">
      <div className="max-w-lg rounded-2xl border border-[var(--line)] bg-[var(--card)] p-8 text-center shadow-[var(--shadow)]">
        <WarningCircle size={38} className="mx-auto text-[#b42318]" weight="duotone" />
        <h1 className="mt-5 text-2xl font-black">We could not load this page</h1>
        <p className="mt-3 text-[var(--muted)]">Please try again. Your search details have not been changed.</p>
        <button type="button" onClick={reset} className="mt-6 rounded-xl bg-[#246B9C] px-5 py-3 font-extrabold text-white hover:bg-[#1c567e]">
          Try again
        </button>
      </div>
    </main>
  );
}
