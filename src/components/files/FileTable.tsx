import { Download, FileImage, FileSpreadsheet, FileText, FileType2, MoreHorizontal, Package } from "lucide-react";
import { useState } from "react";

import { Modal } from "@/components/kit/Modal";
import { notify } from "@/lib/notify";

import { FileStatusBadge, RevisionBadge } from "@/components/kit/Badges";
import { formatDate, formatSize } from "@/lib/format";
import type { FileKind, ProjectFile } from "@/lib/types";

const kindIcon: Record<FileKind, typeof FileText> = {
  PDF: FileText,
  DWG: FileType2,
  XLSX: FileSpreadsheet,
  DOCX: FileText,
  JPG: FileImage,
  PNG: FileImage,
  ZIP: Package,
};

export function FileKindIcon({ kind, className = "size-4" }: { kind: FileKind; className?: string }) {
  const Icon = kindIcon[kind];
  return <Icon className={`${className} shrink-0 text-muted-foreground`} aria-hidden />;
}

export function FileTable({
  files,
  selectedId,
  onSelect,
  selectable = true,
  showProjectColumn = false,
  projectNameFor,
  compact = false,
}: {
  files: ProjectFile[];
  selectedId?: string | null;
  onSelect?: (file: ProjectFile) => void;
  selectable?: boolean;
  showProjectColumn?: boolean;
  projectNameFor?: (file: ProjectFile) => string;
  compact?: boolean;
}) {
  const [checked, setChecked] = useState<string[]>([]);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [trashed, setTrashed] = useState<string[]>([]);
  const [confirmTrash, setConfirmTrash] = useState<ProjectFile[] | null>(null);
  const visible = files.filter((f) => !trashed.includes(f.id));

  const runAction = (action: string, file: ProjectFile) => {
    setMenuFor(null);
    if (action === "Open") onSelect?.(file);
    else if (action === "Download") notify.prototype(`Download ${file.name}`);
    else if (action === "Copy link") {
      void navigator.clipboard?.writeText(`${window.location.origin}/projects/${file.projectId}/documents?file=${file.id}`);
      notify.success("Link copied", file.name);
    } else if (action === "Move to folder") notify.prototype(`Move ${file.name}`);
    else if (action === "Move to trash") setConfirmTrash([file]);
  };

  const toggle = (id: string) =>
    setChecked((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            {selectable ? (
              <th scope="col" className="w-9">
                <span className="sr-only">Select</span>
              </th>
            ) : null}
            <th scope="col" className="min-w-[220px]">
              Name
            </th>
            {showProjectColumn ? (
              <th scope="col" className="min-w-[160px]">
                Project
              </th>
            ) : null}
            {compact ? null : (
              <th scope="col" className="w-[76px]">
                Type
              </th>
            )}
            <th scope="col" className="w-[92px]">
              Revision
            </th>
            {compact ? null : (
              <th scope="col" className="w-[92px]">
                Size
              </th>
            )}
            <th scope="col" className="w-[116px]">
              Modified
            </th>
            <th scope="col" className="w-[124px]">
              Status
            </th>
            <th scope="col" className="w-[56px] text-right">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {visible.map((file) => {
            const active = file.id === selectedId;
            return (
              <tr
                key={file.id}
                onClick={() => onSelect?.(file)}
                aria-selected={active}
                className="cursor-pointer"
              >
                {selectable ? (
                  <td onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${file.name}`}
                      checked={checked.includes(file.id)}
                      onChange={() => toggle(file.id)}
                      className="size-3.5 accent-[var(--primary)]"
                    />
                  </td>
                ) : null}
                <td>
                  <div className="flex items-center gap-2">
                    <FileKindIcon kind={file.kind} />
                    <span className={`block truncate font-medium ${compact ? "max-w-[230px]" : "max-w-[300px]"}`} title={file.name}>{file.name}</span>
                  </div>
                </td>
                {showProjectColumn ? (
                  <td className="text-muted-foreground">
                    <span className="block truncate">{projectNameFor?.(file) ?? "—"}</span>
                  </td>
                ) : null}
                {compact ? null : <td className="text-code text-muted-foreground">{file.kind}</td>}
                <td>
                  <RevisionBadge
                    revision={file.revision}
                    current={file.status !== "Superseded"}
                  />
                </td>
                {compact ? null : <td className="text-code text-muted-foreground">{formatSize(file.sizeBytes)}</td>}
                <td className="text-code text-muted-foreground">{formatDate(file.modifiedAt)}</td>
                <td>
                  <FileStatusBadge status={file.status} />
                </td>
                <td className="text-right" onClick={(event) => event.stopPropagation()}>
                  <div className="relative inline-block">
                    <button
                      type="button"
                      aria-label={`Actions for ${file.name}`}
                      onClick={() => setMenuFor(menuFor === file.id ? null : file.id)}
                      className="btn btn-ghost size-7 px-0"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                    {menuFor === file.id ? (
                      <>
                        <button
                          type="button"
                          aria-label="Close actions"
                          className="fixed inset-0 z-10 cursor-default"
                          onClick={() => setMenuFor(null)}
                        />
                        <div
                          role="menu"
                          className="overlay-panel absolute right-0 z-20 mt-1 w-44 py-1 text-left"
                        >
                          {["Open", "Download", "Copy link", "Move to folder", "Move to trash"].map(
                            (action) => (
                              <button
                                key={action}
                                type="button"
                                onClick={() => runAction(action, file)}
                                className={`text-body block w-full px-3 py-1.5 text-left hover:bg-surface ${
                                  action === "Move to trash" ? "text-danger" : ""
                                }`}
                              >
                                {action}
                              </button>
                            ),
                          )}
                        </div>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {checked.length > 0 ? (
        <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-border bg-card px-4 py-2.5">
          <span className="text-meta text-muted-foreground">{checked.length} selected</span>
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setChecked([])}>
              Clear
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => notify.prototype(`Download ${checked.length} files`)}>
              <Download className="size-4" />
              Download
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => notify.prototype(`Move ${checked.length} files`)}>
              Move
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setConfirmTrash(visible.filter((f) => checked.includes(f.id)))}
            >
              Move to trash
            </button>
          </div>
        </div>
      ) : null}
      <Modal
        open={confirmTrash !== null}
        onClose={() => setConfirmTrash(null)}
        title={confirmTrash && confirmTrash.length > 1 ? `Move ${confirmTrash.length} files to trash?` : "Move file to trash?"}
        description="Files in trash can be restored from the Trash screen."
        width="sm"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmTrash(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                const ids = confirmTrash?.map((f) => f.id) ?? [];
                setTrashed((t) => [...t, ...ids]);
                setChecked((c) => c.filter((id) => !ids.includes(id)));
                notify.success(ids.length > 1 ? `${ids.length} files moved to trash` : "Moved to trash", confirmTrash?.length === 1 ? confirmTrash[0]!.name : undefined);
                setConfirmTrash(null);
              }}
            >
              Move to trash
            </button>
          </>
        }
      >
        <ul className="space-y-1">
          {confirmTrash?.map((f) => (
            <li key={f.id} className="truncate text-[13px] font-medium" title={f.name}>{f.name}</li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}
