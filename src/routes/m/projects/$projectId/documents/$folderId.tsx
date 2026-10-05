import { Link, createFileRoute } from "@tanstack/react-router";
import { FolderPlus, RotateCw } from "lucide-react";
import { useState } from "react";

import { FileRow, FileRowBody, IconButton, MobileHeader, StateBlock } from "@/components/mobile/kit";
import { getFolders, getProject, getProjectFiles, retryProcessing } from "@/lib/api";
import { notify } from "@/lib/notify";
import type { ProjectFile } from "@/lib/types";

export const Route = createFileRoute("/m/projects/$projectId/documents/$folderId")({
  head: ({ params }) => {
    const folder = getFolders(params.projectId).find((f) => f.id === params.folderId);
    const t = `${folder?.name ?? "Folder"} · ${getProject(params.projectId)?.name ?? ""} — Mobile`;
    return {
      meta: [
        { title: t },
        { name: "description", content: "Files in this project folder." },
        { property: "og:title", content: t },
        { property: "og:description", content: "Files in this project folder." },
      ],
    };
  },
  component: MobileFolder,
});

function MobileFolder() {
  const { projectId, folderId } = Route.useParams();
  const folder = getFolders(projectId).find((f) => f.id === folderId);
  const [overrides, setOverrides] = useState<Record<string, ProjectFile>>({});
  const files = getProjectFiles(projectId, folderId).map((f) => overrides[f.id] ?? f);

  return (
    <div className="pb-6">
      <MobileHeader
        title={folder?.name ?? "Folder"}
        eyebrow={getProject(projectId)?.name}
        back
        large
        right={<IconButton label="New folder" icon={FolderPlus} onClick={() => notify.prototype("New folder")} />}
      />
      <p className="px-4 pt-3 pb-2 font-mono text-[11px] tracking-[0.06em] text-muted-foreground">
        {files.length} FILES · NEWEST FIRST
      </p>
      <div className="border-y border-border bg-card">
        {files.length === 0 ? (
          <StateBlock
            kind="empty"
            title="This folder is empty"
            body="Upload files from the web workspace, or capture site photos from Photos."
            action={
              <Link to="/m/projects/$projectId/documents" params={{ projectId }} className="btn btn-secondary h-11">
                Back to folders
              </Link>
            }
          />
        ) : (
          [...files]
            .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
            .map((f) =>
              f.status === "Failed" ? (
                <div key={f.id} className="border-b border-border last:border-b-0">
                  <div className="flex min-h-[64px] items-center gap-3 px-4 py-2.5">
                    <FileRowBody file={f} />
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-danger/20 bg-danger/5 px-4 py-2">
                    <p className="text-[12.5px] text-danger">Processing failed. The text layer could not be read.</p>
                    <button
                      type="button"
                      className="btn btn-secondary h-9 shrink-0"
                      onClick={() =>
                        retryProcessing(f, (u) => {
                          setOverrides((o) => ({ ...o, [u.id]: u }));
                          if (u.status === "Ready") notify.success("Processing complete", u.name);
                        })
                      }
                    >
                      <RotateCw className="size-3.5" /> Retry
                    </button>
                  </div>
                </div>
              ) : f.status === "Processing" || f.status === "Uploading" ? (
                <div key={f.id} className="border-b border-border last:border-b-0">
                  <FileRow file={f} />
                  <div className="h-0.5 overflow-hidden bg-surface">
                    <div className="animate-splash-bar h-full w-1/3 bg-primary" />
                  </div>
                </div>
              ) : (
                <FileRow key={f.id} file={f} />
              ),
            )
        )}
      </div>
    </div>
  );
}
