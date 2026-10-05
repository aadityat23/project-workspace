import { Link, useNavigate } from "@tanstack/react-router";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ProjectStatusBadge } from "@/components/kit/Badges";
import { DeleteProjectDialog } from "@/components/project/DeleteProjectDialog";
import { getProjectBriefingCounts } from "@/lib/api";
import { projectImage } from "@/lib/project-media";
import type { Project } from "@/lib/types";

const tabs = [
  { label: "Overview", path: "" },
  { label: "Documents", path: "/documents" },
  { label: "Drawings", path: "/drawings" },
  { label: "Photos", path: "/photos" },
  { label: "Team", path: "/team" },
  { label: "Activity", path: "/activity" },
];

export function ProjectHeader({ project, pathname }: { project: Project; pathname: string }) {
  const base = `/projects/${project.id}`;
  const counts = getProjectBriefingCounts(project.id);
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  return (
    <div className="border-b border-border bg-card">
      <div className="px-8 pt-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-4">
            <img
              src={projectImage(project.id)}
              alt=""
              width={1280}
              height={800}
              className="h-[56px] w-[84px] rounded-[4px] object-cover"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[19px] font-semibold tracking-[0.04em] uppercase">
                  {project.name}
                </h1>
                <ProjectStatusBadge status={project.status} />
              </div>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                {project.location}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                <span className="font-mono text-foreground">{project.code}</span>
                <span className="mx-1.5 text-border-strong">/</span>
                {project.category}
              </p>
            </div>
          </div>

          <dl className="ml-auto hidden items-center divide-x divide-border md:flex">
            {[
              ["Documents", String(counts.documents)],
              ["Drawings", String(counts.drawings)],
              ["Photos", String(counts.photos)],
            ].map(([k, v]) => (
              <div key={k} className="px-5 first:pl-0 last:pr-0">
                <dt className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  {k}
                </dt>
                <dd className="mt-1 font-mono text-[20px] leading-none font-medium">{v}</dd>
              </div>
            ))}
          </dl>

          <div ref={menuRef} className="relative ml-auto md:ml-0">
            <button
              type="button"
              aria-label="Project actions"
              aria-haspopup="menu"
              aria-expanded={menu}
              onClick={() => setMenu((v) => !v)}
              className="btn btn-ghost size-8 px-0"
            >
              <MoreHorizontal className="size-4" />
            </button>
            {menu ? (
              <div role="menu" className="overlay-panel absolute top-full right-0 z-30 mt-1 w-48 py-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenu(false);
                    setConfirmOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-danger hover:bg-surface"
                >
                  <Trash2 className="size-4" /> Delete project
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <nav aria-label="Project sections" className="-mb-px mt-4 flex gap-6 overflow-x-auto">
          {tabs.map((tab) => {
            const to = `${base}${tab.path}`;
            const active = tab.path === "" ? pathname === base : pathname.startsWith(to);
            return (
              <Link
                key={tab.label}
                to={to as "/projects/$projectId"}
                params={{ projectId: project.id }}
                className={`border-b-2 py-2.5 text-[13.5px] font-medium whitespace-nowrap transition-colors duration-150 ${
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <DeleteProjectDialog
        project={project}
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onDeleted={() => {
          setConfirmOpen(false);
          void navigate({ to: "/projects", replace: true });
        }}
      />
    </div>
  );
}
