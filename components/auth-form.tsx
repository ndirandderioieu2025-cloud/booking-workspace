"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, LockKey, UserPlus } from "@phosphor-icons/react";
import { FormEvent, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

function safeNextPath(value?: string) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/my-bookings";
}

export function AuthForm({ initialMode, nextPath }: { initialMode: "sign-in" | "register"; nextPath?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const supabase = createClient();
  const destination = safeNextPath(nextPath);

  function changeMode(nextMode: "sign-in" | "register") {
    setMode(nextMode);
    setError("");
    setNotice("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!supabase) {
      setError("Supabase is not configured yet. Add the public project URL and publishable key to .env.local.");
      return;
    }
    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    if (mode === "register") {
      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("next", destination);
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callback.toString() },
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      if (!data.session) {
        setNotice("Account created. Check your email to confirm your address, then return to sign in.");
        return;
      }
    } else {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
        return;
      }
    }

    startTransition(() => {
      router.push(destination);
      router.refresh();
    });
  }

  return (
    <main className="min-h-[calc(100dvh-72px)] bg-[var(--surface)] py-9 sm:py-12">
      <div className="page-shell">
        <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_18px_60px_rgba(71,132,170,0.16)]">
          <div className="border-b border-[var(--line)] p-6 sm:p-8">
            <span className="grid size-12 place-items-center rounded-xl bg-[var(--surface-strong)] text-[#327eaf]">
              {mode === "sign-in" ? <LockKey size={25} weight="duotone" /> : <UserPlus size={25} weight="duotone" />}
            </span>
            <p className="mt-5 text-sm font-extrabold text-[#2d719f]">Secure Booking Workspace account</p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.045em]">{mode === "sign-in" ? "Welcome back" : "Create your account"}</h1>
            <p className="mt-3 leading-relaxed text-[var(--muted)]">
              {mode === "sign-in" ? "Sign in to reserve a workspace and access your personal booking history." : "Register with your email to save and manage reservations across devices."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-[var(--surface)] p-1" role="tablist" aria-label="Account access mode">
              <button type="button" role="tab" aria-selected={mode === "sign-in"} onClick={() => changeMode("sign-in")} className={`rounded-lg px-3 py-2.5 text-sm font-extrabold ${mode === "sign-in" ? "bg-white text-[var(--text)] shadow-sm" : "text-[var(--muted)]"}`}>Sign in</button>
              <button type="button" role="tab" aria-selected={mode === "register"} onClick={() => changeMode("register")} className={`rounded-lg px-3 py-2.5 text-sm font-extrabold ${mode === "register" ? "bg-white text-[var(--text)] shadow-sm" : "text-[var(--muted)]"}`}>Register</button>
            </div>

            <label className="mt-6 block text-xs font-extrabold text-[var(--muted)]">Email address
              <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="mt-1.5 w-full rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-bold outline-none focus:border-[#327eaf] focus:ring-2 focus:ring-[#A9D6F5]" placeholder="you@example.com" />
            </label>
            <label className="mt-4 block text-xs font-extrabold text-[var(--muted)]">Password
              <input type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required className="mt-1.5 w-full rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-bold outline-none focus:border-[#327eaf] focus:ring-2 focus:ring-[#A9D6F5]" placeholder="At least 8 characters" />
            </label>

            {error && <p role="alert" className="mt-5 rounded-xl bg-[#fff1f0] px-4 py-3 text-sm font-bold text-[#9b2c27]">{error}</p>}
            {notice && <p role="status" className="mt-5 flex items-start gap-2 rounded-xl bg-[#e9f7ef] px-4 py-3 text-sm font-bold text-[#17633a]"><CheckCircle size={18} className="mt-0.5 shrink-0" /> {notice}</p>}

            <button type="submit" disabled={pending} className="mt-6 w-full rounded-xl bg-[#246B9C] px-5 py-3.5 font-extrabold text-white shadow-[0_10px_24px_rgba(36,107,156,0.2)] hover:bg-[#1c567e] disabled:cursor-wait disabled:bg-[#8bb8d4]">
              {pending ? "Opening your account..." : mode === "sign-in" ? "Sign in securely" : "Create account"}
            </button>
            <p className="mt-4 text-center text-xs leading-relaxed text-[var(--muted)]">Passwords are handled only by Supabase Authentication. Booking Workspace never stores them.</p>
          </form>
        </div>
        <div className="mx-auto mt-6 max-w-lg"><Link href="/" className="inline-flex items-center gap-2 text-sm font-extrabold text-[#245f87] hover:underline"><ArrowLeft size={16} /> Return home</Link></div>
      </div>
    </main>
  );
}
