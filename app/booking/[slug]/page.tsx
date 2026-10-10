import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingSummary } from "@/components/booking-summary";
import { getWorkspace, workspaces } from "@/lib/workspaces";
import { getPersistedWorkspace } from "@/lib/supabase/workspaces";

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
  const workspace = getWorkspace((await params).slug);
  return { title: workspace ? `Review ${workspace.name} | Booking Workspace` : "Review reservation | Booking Workspace" };
}

export default async function BookingSummaryPage({ params, searchParams }: { params: PageParams; searchParams: SearchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const workspace = await getPersistedWorkspace(slug);
  if (!workspace) notFound();

  return (
    <BookingSummary
      workspace={workspace}
      queryString={toQueryString(query)}
      selection={{
        date: firstValue(query.date) ?? "",
        startTime: firstValue(query.time) ?? "",
        duration: Math.min(8, Math.max(1, Number(firstValue(query.duration)) || 1)),
        people: Math.max(1, Number(firstValue(query.people)) || 1),
        optionId: firstValue(query.option) ?? "",
      }}
    />
  );
}
