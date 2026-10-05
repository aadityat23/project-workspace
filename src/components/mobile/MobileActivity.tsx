import { FilePlus2, FolderPlus, Camera, GitBranch, Trash2, UserPlus, type LucideIcon } from "lucide-react";

import { formatDate, formatTime, dayGroup } from "@/lib/format";
import type { Activity } from "@/lib/types";

const icons: Record<Activity["kind"], LucideIcon> = {
  upload: FilePlus2,
  folder: FolderPlus,
  revision: GitBranch,
  photo: Camera,
  member: UserPlus,
  delete: Trash2,
};

function groupLabel(iso: string) {
  const g = dayGroup(iso);
  return g === "Earlier" ? formatDate(iso) : g;
}

export function MobileActivity({ items, showProject = true }: { items: Activity[]; showProject?: boolean }) {
  const groups: [string, Activity[]][] = [];
  for (const a of items) {
    const label = groupLabel(a.at);
    const last = groups[groups.length - 1];
    if (last && last[0] === label) last[1].push(a);
    else groups.push([label, [a]]);
  }
  return (
    <div>
      {groups.map(([label, list]) => (
        <section key={label}>
          <h3 className="sticky top-0 z-10 border-b border-border bg-background px-4 py-1.5 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
            {label}
          </h3>
          <ol className="relative bg-card">
            <span aria-hidden className="absolute top-0 bottom-0 left-[31px] w-px bg-border" />
            {list.map((a) => {
              const Icon = icons[a.kind];
              return (
                <li key={a.id} className="relative flex gap-3 border-b border-border px-4 py-3 last:border-b-0">
                  <span className="relative z-[1] flex size-[30px] shrink-0 items-center justify-center rounded-full border border-border bg-card">
                    <Icon className={`size-3.5 ${a.kind === "delete" ? "text-danger" : "text-primary"}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{a.target}</p>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                      <span className="text-foreground">{a.actor}</span> {a.action}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {showProject && a.projectName ? `${a.projectName} · ` : ""}
                      {formatTime(a.at)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
