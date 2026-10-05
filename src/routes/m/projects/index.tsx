import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Chips, MobileHeader, ProjectRecord, StateBlock } from "@/components/mobile/kit";
import { ProfileButton } from "@/components/mobile/ProfileButton";
import { getProjects } from "@/lib/api";

export const Route = createFileRoute("/m/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Milind Awasarmol & Associates Mobile" },
      { name: "description", content: "Project directory filtered by status." },
      { property: "og:title", content: "Projects — Milind Awasarmol & Associates Mobile" },
      { property: "og:description", content: "Project directory filtered by status." },
    ],
  }),
  component: MobileProjects,
});

const FILTERS = ["All", "Active", "On Hold", "Completed", "Planning"] as const;
type F = (typeof FILTERS)[number];

function MobileProjects() {
  const [filter, setFilter] = useState<F>("All");
  const all = getProjects();
  const counts = Object.fromEntries(
    FILTERS.map((f) => [f, f === "All" ? all.length : all.filter((p) => p.status === f).length]),
  ) as Record<F, number>;
  const list = filter === "All" ? all : all.filter((p) => p.status === filter);
  const lead = list.filter((p) => p.status === "Active");
  const rest = list.filter((p) => p.status !== "Active");

  return (
    <div className="pb-6">
      <MobileHeader title="Projects" eyebrow={`${all.length} projects`} large right={<ProfileButton />} />
      <div className="border-b border-border bg-card">
        <Chips options={FILTERS} value={filter} onChange={setFilter} counts={counts} />
      </div>
      {list.length === 0 ? (
        <StateBlock kind="empty" title={`No ${filter.toLowerCase()} projects`} body="Projects with this status will appear here." />
      ) : (
        <>
          {lead.length > 0 && (
            <div className="space-y-3 px-4 pt-4">
              {lead.map((p) => (
                <ProjectRecord key={p.id} project={p} large />
              ))}
            </div>
          )}
          {rest.length > 0 && (
            <section className="pt-5">
              <h2 className="text-overline px-4 pb-2">{filter === "All" ? "Other projects" : filter}</h2>
              <div className="border-y border-border bg-card">
                {rest.map((p) => (
                  <ProjectRecord key={p.id} project={p} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
