import { ChevronDown, Folder as FolderIcon, FolderOpen } from "lucide-react";
import { useState } from "react";

import type { Folder } from "@/lib/types";

export function FolderTree({
  folders,
  selectedId,
  onSelect,
}: {
  folders: Folder[];
  selectedId: string;
  onSelect: (folderId: string) => void;
}) {
  const root = folders.find((folder) => folder.parentId === null);
  const children = folders.filter((folder) => folder.parentId === root?.id);
  const [expanded, setExpanded] = useState(true);

  if (!root) return null;

  return (
    <nav aria-label="Folders" className="p-2">
      <button
        type="button"
        onClick={() => {
          setExpanded((open) => !open);
          onSelect(root.id);
        }}
        className={`text-label flex h-8 w-full items-center gap-1.5 rounded-[6px] px-2 transition-colors duration-150 ${
          selectedId === root.id ? "bg-surface text-foreground" : "hover:bg-surface"
        }`}
      >
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-150 ${
            expanded ? "" : "-rotate-90"
          }`}
          aria-hidden
        />
        {selectedId === root.id ? (
          <FolderOpen className="size-4 shrink-0 text-primary" aria-hidden />
        ) : (
          <FolderIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <span className="truncate">{root.name}</span>
      </button>

      {expanded ? (
        <ul className="mt-0.5 ml-4 border-l border-border pl-2">
          {children.map((folder) => {
            const active = folder.id === selectedId;
            return (
              <li key={folder.id}>
                <button
                  type="button"
                  onClick={() => onSelect(folder.id)}
                  className={`relative flex h-8 w-full items-center gap-2 rounded-[6px] px-2 text-[14px] transition-colors duration-150 ${
                    active
                      ? "bg-surface font-medium text-foreground"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  {active ? (
                    <span
                      aria-hidden
                      className="absolute top-1/2 -left-[9px] h-4 w-[2px] -translate-y-1/2 bg-accent"
                    />
                  ) : null}
                  <FolderIcon
                    className={`size-4 shrink-0 ${active ? "text-primary" : ""}`}
                    aria-hidden
                  />
                  <span className="truncate">{folder.name}</span>
                  <span className="text-meta ml-auto tabular text-muted-foreground">
                    {folder.fileCount}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </nav>
  );
}
