import {
  FilePlus2,
  FolderPlus,
  GitCompareArrows,
  Image,
  Trash2,
  UserPlus,
} from "lucide-react";

import { formatDate, formatTime } from "@/lib/format";
import type { Activity } from "@/lib/types";

const icons = {
  upload: FilePlus2,
  folder: FolderPlus,
  revision: GitCompareArrows,
  photo: Image,
  member: UserPlus,
  delete: Trash2,
} as const;

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const y = new Date();
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return formatDate(iso);
}

/* Operational timeline: date rail, vertical spine, target emphasised. */
export function ActivityList({
  entries,
  showProject = false,
}: {
  entries: Activity[];
  showProject?: boolean;
}) {
  if (entries.length === 0) {
    return <p className="py-8 text-[13px] text-muted-foreground">No activity recorded.</p>;
  }

  const groups: [string, Activity[]][] = [];
  for (const e of entries) {
    const label = dayLabel(e.at);
    const last = groups[groups.length - 1];
    if (last && last[0] === label) last[1].push(e);
    else groups.push([label, [e]]);
  }

  return (
    <div>
      {groups.map(([label, items]) => (
        <div key={label} className="pt-4">
          <p className="mb-1 text-[10.5px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            {label}
          </p>
          <ol className="relative">
            <span aria-hidden className="absolute top-3 bottom-3 left-[11px] w-px bg-border" />
            {items.map((entry) => {
              const Icon = icons[entry.kind];
              return (
                <li key={entry.id} className="relative flex gap-3 py-2">
                  <span className="relative z-[1] mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                    <Icon className="size-3" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-foreground">{entry.target}</p>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                      <span className="text-foreground">{entry.actor}</span> {entry.action}
                      {showProject && entry.projectName ? ` · ${entry.projectName}` : ""}
                    </p>
                  </div>
                  <span className="text-code pt-0.5 text-[11.5px] text-muted-foreground">
                    {formatTime(entry.at)}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
