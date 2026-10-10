"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Buildings, List, X } from "@phosphor-icons/react";
import { useState } from "react";
import { AccountActions } from "@/components/account-actions";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/workspaces", label: "Workspaces" },
  { href: "/my-bookings", label: "My Bookings" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:var(--background)]/95 backdrop-blur-lg">
      <div className="page-shell flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Booking Workspace home">
          <span className="grid size-9 place-items-center rounded-xl bg-[#6BAEDB] text-[#102f43] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
            <Buildings size={21} weight="fill" aria-hidden="true" />
          </span>
          <span className="text-[18px] font-extrabold tracking-[-0.04em] sm:text-[20px]">
            booking<span className="text-[#327eaf]">workspace</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  active
                    ? "bg-[var(--surface-strong)] text-[var(--text)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block"><AccountActions /></div>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-xl border border-[var(--line)] text-[var(--text)] md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <List size={23} />}
        </button>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" className="border-t border-[var(--line)] bg-[var(--background)] px-4 py-4 md:hidden">
          <div className="mx-auto grid max-w-xl gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 border-t border-[var(--line)] pt-4"><AccountActions mobile onNavigate={() => setMenuOpen(false)} /></div>
          </div>
        </nav>
      )}
    </header>
  );
}
