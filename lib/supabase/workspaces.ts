import type { Workspace } from "@/lib/workspaces";
import { getWorkspace, workspaces as localWorkspaces } from "@/lib/workspaces";
import { createClient } from "@/lib/supabase/server";

type WorkspaceRow = {
  slug: string; name: string; workspace_type: Workspace["type"]; neighborhood: string; city: string;
  address: string; image_path: string; description: string; price_per_hour: number | string;
  price_unit: Workspace["priceUnit"]; capacity: number; sample_score: number | string; recommended_rank: number;
  open_time: string; close_time: string; open_days: number[]; amenities: Workspace["amenities"];
  facilities: string[]; payment_methods: Workspace["paymentMethods"]; purchase_condition: string | null;
  cancellation_policy: string;
};

function mapWorkspace(row: WorkspaceRow): Workspace {
  return {
    slug: row.slug,
    name: row.name,
    type: row.workspace_type,
    neighborhood: row.neighborhood,
    city: "Madrid",
    address: row.address,
    image: row.image_path,
    description: row.description,
    pricePerHour: Number(row.price_per_hour),
    priceUnit: row.price_unit,
    capacity: row.capacity,
    sampleScore: Number(row.sample_score),
    recommendedRank: row.recommended_rank,
    openingHours: { open: row.open_time.slice(0, 5), close: row.close_time.slice(0, 5) },
    openDays: row.open_days,
    amenities: row.amenities,
    facilities: row.facilities,
    paymentMethods: row.payment_methods,
    purchaseCondition: row.purchase_condition ?? undefined,
    cancellation: row.cancellation_policy,
  };
}

export async function getPersistedWorkspaces() {
  const supabase = await createClient();
  if (!supabase) return localWorkspaces;
  const { data, error } = await supabase.from("workspaces").select("*").eq("is_active", true).order("recommended_rank");
  if (error) return localWorkspaces;
  return (data as WorkspaceRow[]).map(mapWorkspace);
}

export async function getPersistedWorkspace(slug: string) {
  const supabase = await createClient();
  if (!supabase) return getWorkspace(slug);
  const { data, error } = await supabase.from("workspaces").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
  if (error) return getWorkspace(slug);
  return data ? mapWorkspace(data as WorkspaceRow) : undefined;
}
