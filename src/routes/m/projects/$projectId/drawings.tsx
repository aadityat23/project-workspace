import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, SlidersHorizontal, Check } from "lucide-react";
import { useState } from "react";

import { Chips, MobileHeader, Sheet, StateBlock } from "@/components/mobile/kit";
import { getDrawings, getProject, getProjectFiles } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/m/projects/$projectId/drawings")({
  head: ({ params }) => {
    const t = `Drawings · ${getProject(params.projectId)?.name ?? "Project"} — Mobile`;
    return {
      meta: [
        { title: t },
        { name: "description", content: "Drawing register with current revisions." },
        { property: "og:title", content: t },
        { property: "og:description", content: "Drawing register with current revisions." },
      ],
    };
  },
  component: MobileDrawings,
});

const SCOPES = ["Current", "All"] as const;

function MobileDrawings() {
  const { projectId } = Route.useParams();
  const drawings = getDrawings(projectId);
  const files = getProjectFiles(projectId);
  const [scope, setScope] = useState<(typeof SCOPES)[number]>("Current");
  const [disc, setDisc] = useState<string>("All");
  const [sheet, setSheet] = useState(false);
  const disciplines = ["All", ...new Set(drawings.map((d) => d.discipline))];
  const current = drawings.filter((d) => d.status === "Current").length;
  const shown = drawings.filter(
    (d) => (scope === "All" || d.status === "Current") && (disc === "All" || d.discipline === disc),
  );

  return (
    <div className="pb-6">
      <MobileHeader title="Drawings" eyebrow={getProject(projectId)?.name} back large />
      <div className="flex items-center justify-between border-b border-border bg-card pr-2">
        <Chips options={SCOPES} value={scope} onChange={setScope} />
        <button type="button" onClick={() => setSheet(true)} className="inline-flex h-11 items-center gap-1.5 px-2 text-[13px] font-medium">
          <SlidersHorizontal className="size-4" />
          {disc === "All" ? "Discipline" : disc.charAt(0) + disc.slice(1).toLowerCase()}
        </button>
      </div>
      <p className="px-4 pt-3 pb-2 font-mono text-[11px] tracking-[0.06em] text-muted-foreground">
        {drawings.length} DRAWINGS · {current} CURRENT REVISIONS · {shown.length} SHOWN
      </p>
      <div className="border-y border-border bg-card">
        {shown.length === 0 ? (
          <StateBlock kind="empty" title="No drawings match" body="Change the scope or discipline filter." />
        ) : (
          shown.map((d) => {
            const file = files.find((f) => f.name === d.fileName);
            const isCurrent = d.status === "Current";
            const body = (
              <>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[16px] font-semibold tracking-[0.02em]">{d.number}</span>
                    <span className={`rounded-[3px] px-1.5 py-0.5 font-mono text-[11px] ${isCurrent ? "bg-navy text-navy-foreground" : "border border-border text-muted-foreground line-through"}`}>
                      {d.revision}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-[14px]">{d.name}</span>
                  <span className="mt-1 flex items-center gap-2 text-[11.5px]">
                    <span className="font-semibold tracking-[0.08em] text-muted-foreground">{d.discipline}</span>
                    <span className={`font-semibold tracking-[0.08em] uppercase ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                      · {d.status}
                    </span>
                    <span className="text-muted-foreground">· Updated {formatDate(d.date)}</span>
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </>
            );
            const cls = `flex min-h-[76px] items-center gap-3 border-b border-l-[3px] border-b-border py-3 pr-4 pl-[13px] last:border-b-0 active:bg-surface ${
              isCurrent ? "border-l-accent" : "border-l-transparent"
            }`;
            return file ? (
              <Link key={d.id} to="/m/file/$fileId" params={{ fileId: file.id }} search={{}} className={cls}>
                {body}
              </Link>
            ) : (
              <div key={d.id} className={cls}>
                {body}
              </div>
            );
          })
        )}
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Discipline">
        {disciplines.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => {
              setDisc(d);
              setSheet(false);
            }}
            className="flex min-h-[52px] w-full items-center justify-between border-t border-border px-4 text-left text-[15px]"
          >
            {d === "All" ? "All disciplines" : d.charAt(0) + d.slice(1).toLowerCase()}
            {d === disc && <Check className="size-4 text-primary" />}
          </button>
        ))}
      </Sheet>
    </div>
  );
}
