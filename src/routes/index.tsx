import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { ActivityList } from "@/components/activity/ActivityList";
import { FileKindIcon } from "@/components/files/FileTable";
import { ProjectStatusBadge, RevisionBadge } from "@/components/kit/Badges";
import { getActivity, getAllFiles, getProject, getProjectBriefingCounts, getProjects } from "@/lib/api";
import { formatDate, relativeDay } from "@/lib/format";
import { projectImage } from "@/lib/project-media";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Milind Awasarmol & Associates" },
      {
        name: "description",
        content: "Live projects, document updates and site activity across Milind Awasarmol & Associates.",
      },
      { property: "og:title", content: "Overview — Milind Awasarmol & Associates" },
      {
        property: "og:description",
        content: "Live projects, document updates and site activity across Milind Awasarmol & Associates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const projects = getProjects();
  const [lead, ...rest] = projects;
  const activity = getActivity().slice(0, 7);
  const allFiles = getAllFiles();
  const recentFiles = allFiles.slice(0, 8);

  const strip: [string, number][] = [
    ["Active projects", projects.filter((p) => p.status === "Active").length],
    ["On hold", projects.filter((p) => p.status === "On Hold").length],
    ["Files", projects.reduce((t, p) => t + p.fileCount, 0)],
    ["Processing", allFiles.filter((f) => f.status === "Processing").length],
  ];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-8 pt-7 pb-14">
      {/* Workspace identity + operational strip */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-5">
        <div>
          <p className="text-overline">Mumbai · Active operations</p>
          <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.015em]">
            Milind Awasarmol & Associates
            <span className="ml-3 font-normal text-muted-foreground">Project workspace</span>
          </h1>
        </div>
        <dl className="flex divide-x divide-border">
          {strip.map(([label, value]) => (
            <div key={label} className="px-6 last:pr-0">
              <dt className="text-[10.5px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                {label}
              </dt>
              <dd className="mt-1 font-mono text-[20px] leading-none font-medium tabular-nums">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Primary project area */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        {lead ? <LeadProject id={lead.id} /> : null}

        <section>
          <header className="flex h-9 items-center justify-between border-b border-foreground/80">
            <h2 className="text-[11px] font-semibold tracking-[0.12em] uppercase">Projects</h2>
            <Link to="/projects" className="text-[12.5px] text-primary hover:underline">
              Directory
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {rest.map((p) => (
              <li key={p.id}>
                <Link
                  to="/projects/$projectId"
                  params={{ projectId: p.id }}
                  className="group flex items-center gap-4 py-3 transition-colors hover:bg-surface"
                >
                  <img
                    src={projectImage(p.id)}
                    alt=""
                    loading="lazy"
                    width={1280}
                    height={800}
                    className="h-[60px] w-[92px] shrink-0 rounded-[4px] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="truncate text-[14px] font-semibold tracking-[0.02em] uppercase group-hover:text-primary">
                        {p.name}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
                      {p.location} · {p.category}
                    </p>
                    <div className="mt-1.5 flex items-center gap-4">
                      <ProjectStatusBadge status={p.status} />
                      <span className="text-code text-[11.5px] text-muted-foreground">{p.code}</span>
                      <span className="text-code text-[11.5px] text-muted-foreground">
                        {p.fileCount} files
                      </span>
                    </div>
                  </div>
                  <span className="text-code self-start pt-1 text-[11.5px] text-muted-foreground">
                    {formatDate(p.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Documents + activity */}
      <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <section>
          <header className="flex h-9 items-center justify-between border-b border-foreground/80">
            <h2 className="text-[11px] font-semibold tracking-[0.12em] uppercase">Recent documents</h2>
            <Link to="/files" className="text-[12.5px] text-primary hover:underline">
              All files
            </Link>
          </header>
          <ul className="grid grid-cols-1 border-l border-border sm:grid-cols-2">
            {recentFiles.map((file) => (
              <li key={file.id} className="border-r border-b border-border">
                <Link
                  to="/projects/$projectId/documents"
                  params={{ projectId: file.projectId }}
                  search={{ file: file.id }}
                  className="group flex gap-3 px-4 py-3.5 transition-colors hover:bg-surface"
                >
                  <span className="mt-0.5">
                    <FileKindIcon kind={file.kind} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold group-hover:text-primary">
                      {file.name.replace(/\.[a-z]+$/i, "")}
                    </p>
                    <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                      {getProject(file.projectId)?.name}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <RevisionBadge revision={file.revision} current={file.status !== "Superseded"} />
                      <span className="text-code text-[11px] text-muted-foreground">{file.kind}</span>
                      <span className="ml-auto text-[11.5px] text-muted-foreground">
                        {relativeDay(file.modifiedAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <header className="flex h-9 items-center justify-between border-b border-foreground/80">
            <h2 className="text-[11px] font-semibold tracking-[0.12em] uppercase">Recent activity</h2>
            <Link to="/activity" className="text-[12.5px] text-primary hover:underline">
              Full log
            </Link>
          </header>
          <ActivityList entries={activity} showProject />
        </section>
      </div>
    </div>
  );
}

function LeadProject({ id }: { id: string }) {
  const p = getProject(id)!;
  const c = getProjectBriefingCounts(id);
  return (
    <Link
      to="/projects/$projectId"
      params={{ projectId: p.id }}
      className="group grid overflow-hidden rounded-[6px] border border-border bg-card md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
    >
      <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[280px]">
        <img
          src={projectImage(p.id)}
          alt={`${p.name} site`}
          width={1280}
          height={800}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute top-3 left-3 bg-navy px-2 py-1 font-mono text-[11px] text-navy-foreground">
          {p.code}
        </span>
      </div>
      <div className="flex flex-col p-6">
        <div className="flex items-center justify-between">
          <p className="text-overline">Lead project</p>
          <ProjectStatusBadge status={p.status} />
        </div>
        <h2 className="mt-3 text-[22px] leading-tight font-semibold tracking-[0.03em] uppercase">
          {p.name}
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {p.location} · {p.category}
        </p>
        <p className="mt-4 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
          {p.briefing}
        </p>
        <dl className="mt-auto grid grid-cols-3 border-t border-border pt-4">
          {[
            ["Documents", c.documents],
            ["Drawings", c.drawings],
            ["Photos", c.photos],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-[10.5px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                {k}
              </dt>
              <dd className="mt-1 font-mono text-[20px] leading-none font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex items-center justify-between text-[12.5px]">
          <span className="text-muted-foreground">Updated {formatDate(p.updatedAt)}</span>
          <span className="flex items-center gap-1.5 font-medium text-primary">
            Open project <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
