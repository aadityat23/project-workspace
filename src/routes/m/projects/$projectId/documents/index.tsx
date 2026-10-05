import { Link, createFileRoute } from "@tanstack/react-router";
import { Folder, Search, X } from "lucide-react";
import { useState } from "react";

import { FileRow, MSection, MobileHeader, NavRow, StateBlock, navRowClass } from "@/components/mobile/kit";
import { getFolders, getProject, getProjectFiles } from "@/lib/api";

export const Route = createFileRoute("/m/projects/$projectId/documents/")({
  head: ({ params }) => {
    const t = `Documents · ${getProject(params.projectId)?.name ?? "Project"} — Mobile`;
    return {
      meta: [
        { title: t },
        { name: "description", content: "Project folders and recent files." },
        { property: "og:title", content: t },
        { property: "og:description", content: "Project folders and recent files." },
      ],
    };
  },
  component: MobileDocuments,
});

function MobileDocuments() {
  const { projectId } = Route.useParams();
  const project = getProject(projectId);
  const [q, setQ] = useState("");
  const folders = getFolders(projectId).filter((f) => f.parentId !== null);
  const files = getProjectFiles(projectId);
  const query = q.trim().toLowerCase();
  const matches = query ? files.filter((f) => f.name.toLowerCase().includes(query)) : [];
  const recent = [...files].sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt)).slice(0, 5);

  return (
    <div className="pb-6">
      <MobileHeader title="Documents" eyebrow={project?.name} back large />
      <div className="border-b border-border bg-card px-4 pb-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search files in this project"
            className="field h-11 w-full pl-9 text-[15px]"
          />
          {q && (
            <button type="button" aria-label="Clear" onClick={() => setQ("")} className="absolute top-0 right-0 flex size-11 items-center justify-center">
              <X className="size-4 text-muted-foreground" />
            </button>
          )}
        </label>
      </div>

      {query ? (
        <MSection title={`${matches.length} results`}>
          {matches.length ? (
            matches.map((f) => <FileRow key={f.id} file={f} />)
          ) : (
            <StateBlock kind="empty" title="No matching files" body={`Nothing in ${project?.name} matches “${q}”.`} />
          )}
        </MSection>
      ) : (
        <>
          <MSection title="Folders">
            {folders.map((f) => (
              <Link
                key={f.id}
                to="/m/projects/$projectId/documents/$folderId"
                params={{ projectId, folderId: f.id }}
                className={navRowClass}
              >
                <NavRow icon={Folder} label={f.name} meta={f.fileCount} />
              </Link>
            ))}
          </MSection>
          <MSection title="Recent files">
            {recent.length ? (
              recent.map((f) => <FileRow key={f.id} file={f} />)
            ) : (
              <StateBlock kind="empty" title="No files yet" body="Files uploaded from the web workspace appear here." />
            )}
          </MSection>
        </>
      )}
    </div>
  );
}
