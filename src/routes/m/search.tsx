import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Clock, FileText, Images, Layers, PenTool, Search, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Chips, MobileHeader, StateBlock } from "@/components/mobile/kit";
import { getDrawings, getFile, getProjectFiles, searchFiles } from "@/lib/api";
import type { SearchResult } from "@/lib/types";

export const Route = createFileRoute("/m/search")({
  head: () => ({
    meta: [
      { title: "Search — Milind Awasarmol & Associates Mobile" },
      { name: "description", content: "Search projects, documents, drawings and photos." },
      { property: "og:title", content: "Search — Milind Awasarmol & Associates Mobile" },
      { property: "og:description", content: "Search projects, documents, drawings and photos." },
    ],
  }),
  component: MobileSearch,
});

const FILTERS = ["All", "Projects", "Documents", "Drawings", "Photos"] as const;
type F = (typeof FILTERS)[number];
const GROUP: Record<Exclude<F, "All">, SearchResult["group"]> = {
  Projects: "PROJECTS",
  Documents: "DOCUMENTS",
  Drawings: "DRAWINGS",
  Photos: "PHOTOS",
};
const ICON: Record<SearchResult["group"], LucideIcon> = {
  PROJECTS: Layers,
  DOCUMENTS: FileText,
  DRAWINGS: PenTool,
  PHOTOS: Images,
};
const RECENT = ["STR-104", "foundation", "slab pour"];
const SUGGESTED = ["Structural drawings", "BOQ", "Site visit"];

function ResultLink({ r, children }: { r: SearchResult; children: React.ReactNode }) {
  const cls = "flex min-h-[60px] items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0 active:bg-surface";
  if (r.group === "DOCUMENTS" && getFile(r.id))
    return <Link to="/m/file/$fileId" params={{ fileId: r.id }} search={{}} className={cls}>{children}</Link>;
  if (r.group === "DRAWINGS") {
    const d = getDrawings(r.projectId).find((x) => x.id === r.id);
    const f = d && getProjectFiles(r.projectId).find((x) => x.name === d.fileName);
    if (f) return <Link to="/m/file/$fileId" params={{ fileId: f.id }} search={{}} className={cls}>{children}</Link>;
    return <Link to="/m/projects/$projectId/drawings" params={{ projectId: r.projectId }} className={cls}>{children}</Link>;
  }
  if (r.group === "PHOTOS")
    return <Link to="/m/projects/$projectId/photos" params={{ projectId: r.projectId }} className={cls}>{children}</Link>;
  return <Link to="/m/projects/$projectId" params={{ projectId: r.projectId }} className={cls}>{children}</Link>;
}

function MobileSearch() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<F>("All");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);
  const results = searchFiles(q);
  const counts = Object.fromEntries(
    FILTERS.map((f) => [f, f === "All" ? results.length : results.filter((r) => r.group === GROUP[f]).length]),
  ) as Record<F, number>;
  const shown = filter === "All" ? results : results.filter((r) => r.group === GROUP[filter]);
  const groups = (["PROJECTS", "DOCUMENTS", "DRAWINGS", "PHOTOS"] as const)
    .map((g) => [g, shown.filter((r) => r.group === g)] as const)
    .filter(([, l]) => l.length);

  return (
    <div className="pb-6">
      <MobileHeader title="Search project content" eyebrow="Search" large />
      <div className="border-b border-border bg-card px-4 pb-1">
        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground" />
          <input
            ref={input}
            type="search"
            enterKeyHint="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Files, drawing numbers, projects"
            className="field h-12 w-full pl-10 text-[16px]"
          />
          {q && (
            <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="absolute top-0 right-0 flex size-12 items-center justify-center">
              <X className="size-4 text-muted-foreground" />
            </button>
          )}
        </label>
        {q.trim() && <div className="-mx-4"><Chips options={FILTERS} value={filter} onChange={setFilter} counts={counts} /></div>}
        {!q.trim() && <div className="h-2" />}
      </div>

      {!q.trim() ? (
        <>
          {(
            [
              ["Recent searches", RECENT, Clock],
              ["Suggested", SUGGESTED, Search],
            ] as const
          ).map(([title, list, Icon]) => (
            <section key={title} className="pt-5">
              <h2 className="text-overline px-4 pb-2">{title}</h2>
              <div className="border-y border-border bg-card">
                {list.map((s) => (
                  <button key={s} type="button" onClick={() => setQ(s)} className="flex min-h-[48px] w-full items-center gap-3 border-b border-border px-4 text-left text-[14.5px] last:border-b-0 active:bg-surface">
                    <Icon className="size-4 text-muted-foreground" />
                    {s}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </>
      ) : shown.length === 0 ? (
        <StateBlock kind="empty" title="No results" body={`Nothing matches “${q}”. Try a drawing number or file name.`} />
      ) : (
        groups.map(([g, list]) => {
          const Icon = ICON[g];
          return (
            <section key={g} className="pt-5">
              <h2 className="text-overline px-4 pb-2">
                {g} · {list.length}
              </h2>
              <div className="border-y border-border bg-card">
                {list.map((r) => (
                  <ResultLink key={`${g}-${r.id}`} r={r}>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[4px] border border-border bg-surface">
                      <Icon className="size-4 text-primary" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[14.5px] font-medium ${g === "DOCUMENTS" || g === "DRAWINGS" ? "font-mono text-[13.5px]" : ""}`}>
                        {r.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">{r.subtitle}</span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </ResultLink>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
