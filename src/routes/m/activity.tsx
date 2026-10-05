import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { MobileActivity } from "@/components/mobile/MobileActivity";
import { Chips, MobileHeader, StateBlock } from "@/components/mobile/kit";
import { getActivity, getProjects } from "@/lib/api";

type Search = { project?: string | undefined };

export const Route = createFileRoute("/m/activity")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    project: typeof s["project"] === "string" ? s["project"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Activity — Milind Awasarmol & Associates Mobile" },
      { name: "description", content: "Operational timeline of uploads, revisions and site photos." },
      { property: "og:title", content: "Activity — Milind Awasarmol & Associates Mobile" },
      { property: "og:description", content: "Operational timeline across projects." },
    ],
  }),
  component: MobileActivityPage,
});

function MobileActivityPage() {
  const { project } = Route.useSearch();
  const navigate = useNavigate();
  const projects = getProjects();
  const names = ["All projects", ...projects.map((p) => p.name)];
  const current = projects.find((p) => p.id === project);
  const items = getActivity(current?.id);

  return (
    <div className="pb-6">
      <MobileHeader title="Activity" eyebrow="Timeline" back large />
      <div className="border-b border-border bg-card">
        <Chips
          options={names}
          value={current?.name ?? "All projects"}
          onChange={(n) =>
            void navigate({ to: "/m/activity", search: { project: projects.find((p) => p.name === n)?.id }, replace: true })
          }
        />
      </div>
      {items.length ? (
        <MobileActivity items={items} showProject={!current} />
      ) : (
        <StateBlock kind="empty" title="No activity yet" body="Uploads, revisions and photos for this project will appear here." />
      )}
    </div>
  );
}
