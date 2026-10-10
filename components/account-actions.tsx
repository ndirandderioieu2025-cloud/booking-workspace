"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignOut, UserCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function AccountActions({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    if (!supabase) {
      const timer = window.setTimeout(() => { if (active) setReady(true); }, 0);
      return () => {
        active = false;
        window.clearTimeout(timer);
      };
    }
    (supabase as SupabaseClient).auth.getUser().then(({ data }: Awaited<ReturnType<SupabaseClient["auth"]["getUser"]>>) => {
      if (active) {
        setEmail(data.user?.email ?? null);
        setReady(true);
      }
    });
    const { data } = (supabase as SupabaseClient).auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (active) setEmail(session?.user.email ?? null);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut({ scope: "local" });
    setEmail(null);
    onNavigate?.();
    router.push("/");
    router.refresh();
  }

  if (!ready) return <div className={`${mobile ? "h-11" : "h-10 w-40"} animate-pulse rounded-xl bg-[var(--surface)]`} />;

  if (email) {
    return (
      <div className={mobile ? "grid gap-2" : "flex items-center gap-2"}>
        <Link href="/my-bookings" onClick={onNavigate} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-[var(--line)] px-3.5 py-2.5 text-sm font-bold text-[var(--brand-deep)] hover:bg-[var(--surface)]">
          <UserCircle size={18} weight="duotone" /><span className="max-w-36 truncate">{email}</span>
        </Link>
        <button type="button" onClick={handleSignOut} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#246B9C] px-3.5 py-2.5 text-sm font-bold text-white hover:bg-[#1c567e]">
          <SignOut size={17} /> Sign out
        </button>
      </div>
    );
  }

  return (
    <div className={mobile ? "grid grid-cols-2 gap-2" : "flex items-center gap-2"}>
      <Link href="/sign-in" onClick={onNavigate} className="rounded-xl border border-[var(--line)] px-4 py-2.5 text-center text-sm font-bold text-[var(--brand-deep)] hover:bg-[var(--surface)]">Sign in</Link>
      <Link href="/sign-in?mode=register" onClick={onNavigate} className="rounded-xl bg-[#246B9C] px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-[#1c567e]">Register</Link>
    </div>
  );
}
