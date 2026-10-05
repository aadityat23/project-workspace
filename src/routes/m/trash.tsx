import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";

import { MobileHeader, Sheet, StateBlock } from "@/components/mobile/kit";
import { getTrash } from "@/lib/api";
import { formatDate, formatSize } from "@/lib/format";
import { notify } from "@/lib/notify";
import type { TrashedFile } from "@/lib/types";

export const Route = createFileRoute("/m/trash")({
  head: () => ({
    meta: [
      { title: "Trash — Milind Awasarmol & Associates Mobile" },
      { name: "description", content: "Deleted files that can be restored or permanently deleted." },
      { property: "og:title", content: "Trash — Milind Awasarmol & Associates Mobile" },
      { property: "og:description", content: "Deleted files that can be restored." },
    ],
  }),
  component: MobileTrash,
});

function MobileTrash() {
  const [items, setItems] = useState(getTrash());
  const [target, setTarget] = useState<TrashedFile | null>(null);
  const [typed, setTyped] = useState("");
  const remove = (id: string) => setItems((l) => l.filter((x) => x.id !== id));
  const close = () => {
    setTarget(null);
    setTyped("");
  };

  return (
    <div className="pb-6">
      <MobileHeader title="Trash" eyebrow={`${items.length} files`} back large />
      <div className="mt-4 border-y border-border bg-card">
        {items.length === 0 ? (
          <StateBlock kind="empty" title="Trash is empty" body="Deleted files stay here until they are restored or permanently deleted." />
        ) : (
          items.map((t) => (
            <div key={t.id} className="border-b border-border px-4 py-3 last:border-b-0">
              <p className="truncate font-mono text-[13.5px] font-medium">{t.name}</p>
              <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
                {t.projectName} · {t.folder}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                DELETED {formatDate(t.deletedAt).toUpperCase()} · {t.deletedBy} · {formatSize(t.sizeBytes)}
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="btn btn-secondary h-10"
                  onClick={() => {
                    remove(t.id);
                    notify.success("File restored", `${t.name} → ${t.originalLocation}`);
                  }}
                >
                  <RotateCcw className="size-4" /> Restore
                </button>
                <button type="button" className="btn btn-danger h-10" onClick={() => setTarget(t)}>
                  <Trash2 className="size-4" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Sheet
        open={target !== null}
        onClose={close}
        title="Permanently delete"
        footer={
          <button
            type="button"
            disabled={typed !== "DELETE"}
            onClick={() => {
              if (!target) return;
              remove(target.id);
              notify.success("File permanently deleted", target.name);
              close();
            }}
            className="btn h-12 w-full bg-danger text-[15px] text-danger-foreground"
          >
            Permanently delete
          </button>
        }
      >
        <div className="px-4 pb-4">
          <p className="font-mono text-[13px] break-all">{target?.name}</p>
          <p className="mt-2 text-[14px] text-muted-foreground">
            This cannot be undone. The file and its revision history will be removed from {target?.projectName}.
          </p>
          <label className="mt-4 block">
            <span className="text-label">
              Type <span className="font-mono">DELETE</span> to confirm
            </span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoCapitalize="characters"
              className="field mt-1.5 h-12 w-full font-mono text-[16px]"
            />
          </label>
        </div>
      </Sheet>
    </div>
  );
}
