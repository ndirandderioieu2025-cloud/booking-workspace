import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign in | Booking Workspace",
  description: "Create or access your Booking Workspace account.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  return <AuthForm initialMode={firstValue(query.mode) === "register" ? "register" : "sign-in"} nextPath={firstValue(query.next)} />;
}
