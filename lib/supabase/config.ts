export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(url && key && !url.includes("your-project-ref") && !key.includes("your-publishable"));
}

export function getSupabaseConfig() {
  if (!isSupabaseConfigured()) return null;
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
  };
}
