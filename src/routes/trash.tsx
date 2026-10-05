import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";

import { Modal } from "@/components/kit/Modal";
import { EmptyState, PageBody, PageHeader } from "@/components/kit/Page";
import { getTrash } from "@/lib/api";
import { notify } from "@/lib/notify";
import { formatDate, formatSize } from "@/lib/format";
import type { TrashedFile } from "@/lib/types";

export const Route = createFileRoute("/trash")({
  head: () => ({
    meta: [
      { title: "Trash — Milind Awasarmol & Associates" },
      { name: "description", content: "Deleted files kept for 30 days before permanent removal." },
      { property: "og:title", content: "Trash — Milind Awasarmol & Associates" },
      { property: "og:description", content: "Deleted files kept for 30 days before permanent removal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Trash,
});

function Trash() {
  const [items, setItems] = useState<TrashedFile[]>(() => getTrash());
  const [confirm, setConfirm] = useState<TrashedFile | null>(null);
  const [typed, setTyped] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const remove = (id: string) => setItems((list) => list.filter((f) => f.id !== id));

  return (
    <PageBody>
      <PageHeader
        eyebrow="Workspace"
        title="Trash"
        subtitle="Deleted files are kept for 30 days, then removed permanently."
      />
      {notice ? <p className="mb-3 text-[12.5px] text-muted-foreground">{notice}</p> : null}
      <div className="overflow-x-auto border-t border-border">
        {items.length === 0 ? (
          <EmptyState icon={<Trash2 className="size-5" />} title="Trash is empty" description="Files you delete will appear here." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Project</th>
                <th className="hidden xl:table-cell">Folder</th>
                <th>Deleted by</th>
                <th>Deleted</th>
                <th className="hidden 2xl:table-cell">Original location</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((f) => (
                <tr key={f.id}>
                  <td>
                    <span className="block max-w-[240px] truncate font-medium" title={f.name}>{f.name}</span>
                    <span className="text-code text-[11px] text-muted-foreground">{formatSize(f.sizeBytes)}</span>
                  </td>
                  <td className="text-muted-foreground">{f.projectName}</td>
                  <td className="hidden text-muted-foreground xl:table-cell">{f.folder}</td>
                  <td className="text-muted-foreground">{f.deletedBy}</td>
                  <td className="text-code text-muted-foreground">{formatDate(f.deletedAt)}</td>
                  <td className="hidden max-w-[200px] truncate text-[12.5px] text-muted-foreground 2xl:table-cell" title={f.originalLocation}>{f.originalLocation}</td>
                  <td className="text-right whitespace-nowrap">
                    <button
                      type="button"
                      className="btn btn-ghost h-7 px-2"
                      onClick={() => {
                        remove(f.id);
                        setNotice(`${f.name} restored to ${f.originalLocation}.`);
                        notify.success("File restored", `${f.name} → ${f.originalLocation}`);
                      }}
                    >
                      <RotateCcw className="size-3.5" /> Restore
                    </button>
                    <button
                      type="button"
                      title="Delete permanently"
                      className="btn btn-ghost size-7 px-0 hover:bg-danger-subtle hover:text-danger"
                      onClick={() => setConfirm(f)}
                    >
                      <Trash2 className="size-3.5" />
                      <span className="sr-only">Delete permanently</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={confirm !== null}
        onClose={() => {
          setConfirm(null);
          setTyped("");
        }}
        title="Delete permanently?"
        description="This file will be removed for everyone. This cannot be undone."
        width="sm"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setConfirm(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={typed !== "DELETE"}
              onClick={() => {
                if (confirm) {
                  notify.success("Permanently deleted", confirm.name);
                  remove(confirm.id);
                  setNotice(`${confirm.name} was permanently deleted.`);
                }
                setConfirm(null);
                setTyped("");
              }}
            >
              Delete permanently
            </button>
          </>
        }
      >
        <p className="font-medium">{confirm?.name}</p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">{confirm?.originalLocation}</p>
        <label className="mt-4 block">
          <span className="text-label mb-1.5 block">
            Type <span className="font-mono">DELETE</span> to confirm
          </span>
          <input className="field" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
        </label>
      </Modal>
    </PageBody>
  );
}
