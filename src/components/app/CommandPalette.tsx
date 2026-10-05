import { useNavigate } from "@tanstack/react-router";
import { CornerDownLeft, Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

import { useDialogFocus } from "@/components/kit/useDialogFocus";

import { getProjects, searchFiles } from "@/lib/api";

const navigationCommands = [
  { title: "Overview", href: "/", group: "NAVIGATION" },
  { title: "Projects", href: "/projects", group: "NAVIGATION" },
  { title: "All Files", href: "/files", group: "NAVIGATION" },
  { title: "Search projects and documents", href: "/search", group: "NAVIGATION" },
  { title: "AI Assistant", href: "/assistant", group: "NAVIGATION" },
  { title: "Team", href: "/team", group: "NAVIGATION" },
  { title: "Activity", href: "/activity", group: "NAVIGATION" },
  { title: "Settings", href: "/settings", group: "NAVIGATION" },
  { title: "Trash", href: "/trash", group: "NAVIGATION" },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const nav = navigationCommands
      .filter((item) => item.title.toLowerCase().includes(q))
      .map((item) => ({ ...item, subtitle: "Go to screen" }));
    const matched = getProjects().filter(
      (project) => !q || `${project.name} ${project.code}`.toLowerCase().includes(q),
    );
    const projects = matched.slice(0, 4).flatMap((project) => {
      const open = {
        title: `Open ${project.name}`,
        subtitle: `${project.code} · ${project.location}`,
        href: `/projects/${project.id}`,
        group: "PROJECTS",
      };
      if (!q) return [open];
      return [
        open,
        ...(["documents", "drawings", "photos"] as const).map((tab) => ({
          title: `${project.name} — ${tab[0]!.toUpperCase()}${tab.slice(1)}`,
          subtitle: `Open ${tab} register`,
          href: `/projects/${project.id}/${tab}`,
          group: "PROJECTS",
        })),
      ];
    });
    const results = q
      ? searchFiles(query)
          .filter((result) => result.group !== "PROJECTS")
          .slice(0, 6)
          .map((result) => ({
            title: result.title,
            subtitle: result.subtitle,
            href: result.href,
            group: result.group,
          }))
      : [];
    return [...nav, ...projects, ...results];
  }, [query]);

  const ref = useDialogFocus<HTMLDivElement>(open, onClose);

  if (!open) return null;

  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  const go = (href: string) => {
    onClose();
    void navigate({ to: href });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6 pt-[12vh]">
      <button
        type="button"
        aria-label="Close command palette"
        onClick={onClose}
        className="fixed inset-0 bg-navy/35"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="overlay-panel relative flex max-h-[60vh] w-full max-w-[560px] flex-col overflow-hidden"
      >
        <div className="flex h-12 items-center gap-2 border-b border-border px-4">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && items[0]) go(items[0].href);
            }}
            placeholder="Search or jump to…"
            aria-label="Search or jump to"
            className="text-body h-full flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
          <kbd className="badge badge-mono">ESC</kbd>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {items.length === 0 ? (
            <p className="text-meta px-4 py-6 text-center text-muted-foreground">
              No matches for “{query}”.
            </p>
          ) : (
            Object.entries(grouped).map(([group, groupItems]) => (
              <div key={group} className="mb-1">
                <p className="text-overline px-4 pt-2 pb-1">{group}</p>
                {groupItems.map((item) => (
                  <button
                    key={`${group}-${item.title}-${item.href}`}
                    type="button"
                    onClick={() => go(item.href)}
                    className="group flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-surface"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="text-body block truncate">{item.title}</span>
                      <span className="text-meta block truncate text-muted-foreground">
                        {item.subtitle}
                      </span>
                    </span>
                    <CornerDownLeft className="size-4 text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
