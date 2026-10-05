import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Camera, FileText, History, Ruler, SearchIcon } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { searchFiles } from "@/lib/api";
import type { SearchResult } from "@/lib/types";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — Milind Awasarmol & Associates" },
      {
        name: "description",
        content:
          "Search across projects, documents, drawings and site photos in the Milind Awasarmol & Associates workspace.",
      },
      { property: "og:title", content: "Search — Milind Awasarmol & Associates" },
      {
        property: "og:description",
        content: "Search across projects, documents, drawings and site photos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SearchScreen,
});

type Group = SearchResult["group"];
const groupOrder: Group[] = ["PROJECTS", "DOCUMENTS", "DRAWINGS", "PHOTOS"];
const groupMeta: Record<Group, { label: string; icon: ReactNode }> = {
  PROJECTS: { label: "Projects", icon: <Building2 className="size-4" /> },
  DOCUMENTS: { label: "Documents", icon: <FileText className="size-4" /> },
  DRAWINGS: { label: "Drawings", icon: <Ruler className="size-4" /> },
  PHOTOS: { label: "Photos", icon: <Camera className="size-4" /> },
};

const recent = ["STR-104", "Raft foundation", "Aaditya Residency", "Podium slab"];
const suggested = ["R03", "Electrical layout", "Shirdi Plaza", "BOQ", "Site visit"];

function SearchScreen() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Group | "ALL">("ALL");
  const results = useMemo(() => searchFiles(query), [query]);
  const counts = Object.fromEntries(
    groupOrder.map((g) => [g, results.filter((r) => r.group === g).length]),
  ) as Record<Group, number>;
  const grouped = groupOrder
    .filter((g) => scope === "ALL" || scope === g)
    .map((g) => [g, results.filter((r) => r.group === g)] as const)
    .filter(([, items]) => items.length > 0);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-8 pt-7 pb-14">
      <div className="border-b border-border pb-6">
        <p className="text-overline">Search project content</p>
        <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.015em]">
          Search
          <span className="ml-3 font-normal text-muted-foreground">
            Projects, documents, drawings and photos
          </span>
        </h1>
        <label className="mt-5 flex h-12 max-w-[820px] items-center gap-3 rounded-[6px] border border-border-strong bg-card px-4 focus-within:border-primary">
          <SearchIcon className="size-5 text-muted-foreground" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Drawing number, file name, project or site visit"
            aria-label="Search project content"
            className="h-full flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
          {query ? (
            <button type="button" className="btn btn-ghost" onClick={() => setQuery("")}>
              Clear
            </button>
          ) : null}
        </label>
        {query.trim() ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {(["ALL", ...groupOrder] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setScope(g)}
                className={`flex items-center gap-2 rounded-[4px] border px-2.5 py-1 text-[12.5px] ${
                  scope === g
                    ? "border-navy bg-navy text-navy-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {g === "ALL" ? "All results" : groupMeta[g].label}
                <span className="font-mono text-[11px] opacity-70">
                  {g === "ALL" ? results.length : counts[g]}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {!query.trim() ? (
        <div className="mt-6 grid max-w-[820px] gap-8 sm:grid-cols-2">
          <QueryList title="Recent searches" icon={<History className="size-3.5" />} items={recent} onPick={setQuery} />
          <QueryList title="Suggested queries" icon={<SearchIcon className="size-3.5" />} items={suggested} onPick={setQuery} />
        </div>
      ) : results.length === 0 ? (
        <div className="mt-10 max-w-[520px]">
          <p className="text-[15px] font-medium">No results for “{query}”</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Check the spelling, or search by drawing number such as STR-104 or a project name.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {grouped.map(([group, items]) => (
            <section key={group}>
              <header className="flex h-9 items-center justify-between border-b border-foreground/80">
                <h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] uppercase">
                  {groupMeta[group].label}
                </h2>
                <span className="font-mono text-[11.5px] text-muted-foreground">{items.length}</span>
              </header>
              <ul className="divide-y divide-border">
                {items.map((r) => {
                  const [first, ...meta] = r.subtitle.split(" · ");
                  return (
                    <li key={`${r.group}-${r.id}`}>
                      <Link
                        to={r.href}
                        className="group grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-4 py-2.5 hover:bg-surface"
                      >
                        <span className="flex size-8 items-center justify-center rounded-[4px] border border-border bg-surface text-muted-foreground">
                          {groupMeta[group].icon}
                        </span>
                        <span className="min-w-0">
                          <span className={`block truncate text-[14px] font-semibold group-hover:text-primary ${group === "DRAWINGS" ? "font-mono text-[13px]" : ""}`}>
                            <Highlight text={r.title} q={query} />
                          </span>
                          <span className="block truncate text-[12.5px] text-muted-foreground">{first}</span>
                        </span>
                        <span className="flex flex-wrap justify-end gap-1.5">
                          {meta.map((m) => (
                            <span key={m} className="badge">
                              {m}
                            </span>
                          ))}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Highlight({ text, q }: { text: string; q: string }) {
  const i = text.toLowerCase().indexOf(q.trim().toLowerCase());
  if (i < 0 || !q.trim()) return <>{text}</>;
  const n = q.trim().length;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-accent/30 text-foreground">{text.slice(i, i + n)}</mark>
      {text.slice(i + n)}
    </>
  );
}

function QueryList({
  title,
  icon,
  items,
  onPick,
}: {
  title: string;
  icon: ReactNode;
  items: string[];
  onPick: (v: string) => void;
}) {
  return (
    <section>
      <h2 className="text-overline border-b border-border pb-2">{title}</h2>
      <ul>
        {items.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => onPick(q)}
              className="flex w-full items-center gap-2.5 border-b border-border py-2 text-left text-[13.5px] hover:text-primary"
            >
              <span className="text-muted-foreground">{icon}</span>
              {q}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
