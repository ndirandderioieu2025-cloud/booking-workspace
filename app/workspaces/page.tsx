import { Suspense } from "react";
import { WorkspaceExplorer } from "@/components/workspace-explorer";
import { getPersistedWorkspaces } from "@/lib/supabase/workspaces";

function ResultsLoading() {
  return (
    <main className="min-h-[calc(100dvh-72px)] bg-[var(--surface)] py-10">
      <div className="page-shell animate-pulse">
        <div className="h-10 w-72 rounded-xl bg-[var(--surface-strong)]" />
        <div className="mt-6 h-28 rounded-2xl bg-white" />
        <div className="mt-8 grid gap-7 lg:grid-cols-[260px_1fr]">
          <div className="hidden h-[520px] rounded-2xl bg-white lg:block" />
          <div className="space-y-4">
            {[1, 2, 3].map((item) => <div key={item} className="h-64 rounded-2xl bg-white" />)}
          </div>
        </div>
      </div>
    </main>
  );
}

export default async function WorkspacesPage() {
  const workspaces = await getPersistedWorkspaces();
  return (
    <Suspense fallback={<ResultsLoading />}>
      <WorkspaceExplorer initialWorkspaces={workspaces} />
    </Suspense>
  );
}
