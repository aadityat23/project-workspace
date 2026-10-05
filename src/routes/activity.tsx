import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ActivityList } from "@/components/activity/ActivityList";
import { SelectInput } from "@/components/kit/SearchInput";
import { getActivity, getProjects } from "@/lib/api";
import type { Activity } from "@/lib/types";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity — Milind Awasarmol & Associates" },
      {
        name: "description",
        content:
          "Chronological log of uploads, drawing revisions, folder changes and access updates across projects.",
      },
      { property: "og:title", content: "Activity — Milind Awasarmol & Associates" },
      {
        property: "og:description",
        content: "Chronological log of uploads, revisions and folder changes across projects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ActivityScreen,
});

const kinds: [Activity["kind"] | "all", string][] = [
  ["all", "All events"],
  ["upload", "Uploads"],
  ["revision", "Revisions"],
  ["photo", "Photos"],
  ["folder", "Folders"],
  ["member", "Access"],
  ["delete", "Deletions"],
];

function ActivityScreen() {
  const [project, setProject] = useState("All projects");
  const [kind, setKind] = useState<Activity["kind"] | "all">("all");
  const projects = getProjects();
  const all = getActivity();
  const entries = all.filter(
    (e) =>
      (project === "All projects" || e.projectName === project) && (kind === "all" || e.kind === kind),
  );

  return (
    <div className="mx-auto w-full max-w-[1440px] px-8 pt-7 pb-14">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-5">
        <div>
          <p className="text-overline">Audit trail · all projects</p>
          <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.015em]">
            Activity
            <span className="ml-3 font-normal text-muted-foreground">{all.length} events recorded</span>
          </h1>
        </div>
        <SelectInput
          value={project}
          onChange={setProject}
          ariaLabel="Filter by project"
          options={["All projects", ...projects.map((p) => p.name)]}
        />
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside>
          <h2 className="text-overline border-b border-border pb-2">Event type</h2>
          <ul>
            {kinds.map(([k, label]) => {
              const n = k === "all" ? all.length : all.filter((e) => e.kind === k).length;
              return (
                <li key={k}>
                  <button
                    type="button"
                    onClick={() => setKind(k)}
                    className={`flex w-full items-center justify-between border-l-2 py-1.5 pr-1 pl-3 text-[13px] ${
                      kind === k
                        ? "border-accent font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                    <span className="font-mono text-[11px]">{n}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
        <section className="max-w-[900px] min-w-0">
          <header className="flex h-9 items-center justify-between border-b border-foreground/80">
            <h2 className="text-[11px] font-semibold tracking-[0.12em] uppercase">Timeline</h2>
            <span className="font-mono text-[11.5px] text-muted-foreground">{entries.length} shown</span>
          </header>
          {entries.length ? (
            <ActivityList entries={entries} showProject />
          ) : (
            <p className="py-10 text-[13px] text-muted-foreground">No events match these filters.</p>
          )}
        </section>
      </div>
    </div>
  );
}
