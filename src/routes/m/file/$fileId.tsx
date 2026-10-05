import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Info,
  MoreHorizontal,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useState } from "react";

import { DisciplineBadge, FileStatusBadge, RevisionBadge } from "@/components/kit/Badges";
import { MobileAsk } from "@/components/mobile/MobileAsk";
import { IconButton, KV, Sheet, StateBlock } from "@/components/mobile/kit";
import { askFile, getDocumentPages, getFile, getProject } from "@/lib/api";
import { formatDate, formatSize } from "@/lib/format";
import { notify } from "@/lib/notify";

type Search = { page?: number | undefined; ask?: boolean | undefined };

export const Route = createFileRoute("/m/file/$fileId")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    page: s["page"] ? Number(s["page"]) || undefined : undefined,
    ask: s["ask"] === true || s["ask"] === "true" ? true : undefined,
  }),
  head: ({ params }) => {
    const f = getFile(params.fileId);
    const t = `${f?.name ?? "File"} — Milind Awasarmol & Associates Mobile`;
    return {
      meta: [
        { title: t },
        { name: "description", content: "Document viewer with revision and processing details." },
        { property: "og:title", content: t },
        { property: "og:description", content: "Document viewer with revision and processing details." },
      ],
    };
  },
  component: FileViewer,
});

function FileViewer() {
  const { fileId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const file = getFile(fileId);
  const pages = getDocumentPages(fileId);
  const total = Math.max(pages.length, file?.metadata.pages ?? 1, 1);
  const [page, setPage] = useState(Math.min(search.page ?? 1, total));
  const [zoom, setZoom] = useState(1);
  const [sheet, setSheet] = useState<"details" | "more" | null>(null);
  const setAsk = (open: boolean) =>
    void navigate({ to: "/m/file/$fileId", params: { fileId }, search: { page, ask: open || undefined }, replace: true });

  if (!file) {
    return (
      <div className="flex h-full flex-col">
        <ViewerBar title="File" onMore={() => {}} />
        <StateBlock kind="error" title="File not found" body="It may have been moved to Trash." />
      </div>
    );
  }
  const project = getProject(file.projectId);
  const content = pages.find((p) => p.page === page) ?? pages[0];
  const unavailable = file.status !== "Ready" && file.status !== "Superseded";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify.success("Link copied", file.name);
    } catch {
      notify.error("Could not copy link");
    }
    setSheet(null);
  };

  return (
    <div className="flex h-full flex-col bg-navy">
      <ViewerBar title={file.name} onMore={() => setSheet("more")} />

      {/* Canvas */}
      <div className="min-h-0 flex-1 overflow-auto bg-border/60 p-4">
        {unavailable ? (
          <div className="flex h-full items-center justify-center">
            <div className="w-full rounded-[6px] border border-border bg-card">
              <StateBlock
                kind={file.status === "Failed" ? "error" : "loading"}
                title={file.status === "Failed" ? "Preview unavailable" : `${file.status}…`}
                body={
                  file.status === "Failed"
                    ? "Processing failed. Retry from the folder view."
                    : "The preview will appear when processing finishes."
                }
              />
            </div>
          </div>
        ) : (
          <div
            className="mx-auto origin-top border border-border-strong bg-card shadow-sm transition-transform"
            style={{ transform: `scale(${zoom})`, width: "100%", aspectRatio: "1 / 1.414" }}
          >
            <div className="flex h-full flex-col p-5">
              <div className="flex items-start justify-between border-b-2 border-foreground pb-2">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.12em] text-muted-foreground">MILIND AWASARMOL & ASSOCIATES</p>
                  <p className="text-[11px] font-semibold">{project?.name}</p>
                </div>
                <p className="font-mono text-[9px] text-muted-foreground">{file.revision}</p>
              </div>
              <p className="mt-3 text-[12px] font-semibold">{content?.heading ?? file.name}</p>
              <div className="mt-2 space-y-1.5">
                {(content?.body ?? ["No indexed text for this page."]).map((line, i) => (
                  <p key={i} className="text-[9.5px] leading-[1.5] text-foreground/80">{line}</p>
                ))}
              </div>
              <div className="mt-auto grid grid-cols-3 border border-foreground/70 font-mono text-[8px]">
                <span className="border-r border-foreground/70 p-1">{file.metadata.discipline}</span>
                <span className="border-r border-foreground/70 p-1">REV {file.revision}</span>
                <span className="p-1 text-right">
                  SHEET {page}/{total}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Viewer controls */}
      <div className="flex h-12 shrink-0 items-center justify-between border-t border-navy-border px-1 text-navy-foreground">
        <div className="flex items-center">
          <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(page - 1)} className="flex size-11 items-center justify-center disabled:opacity-40">
            <ChevronLeft className="size-5" />
          </button>
          <span className="w-14 text-center font-mono text-[12.5px] tabular-nums">
            {page} / {total}
          </span>
          <button type="button" aria-label="Next page" disabled={page >= total} onClick={() => setPage(page + 1)} className="flex size-11 items-center justify-center disabled:opacity-40">
            <ChevronRight className="size-5" />
          </button>
        </div>
        <div className="flex items-center">
          <button type="button" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom(Math.max(1, zoom - 0.25))} className="flex size-11 items-center justify-center disabled:opacity-40">
            <ZoomOut className="size-[18px]" />
          </button>
          <span className="w-10 text-center font-mono text-[12px]">{Math.round(zoom * 100)}%</span>
          <button type="button" aria-label="Zoom in" disabled={zoom >= 2} onClick={() => setZoom(Math.min(2, zoom + 0.25))} className="flex size-11 items-center justify-center disabled:opacity-40">
            <ZoomIn className="size-[18px]" />
          </button>
        </div>
      </div>

      {/* Metadata strip */}
      <div className="shrink-0 border-t border-border bg-card px-4 pt-2.5 pb-3">
        <button type="button" onClick={() => setSheet("details")} className="flex w-full items-center gap-2.5 text-left">
          <RevisionBadge revision={file.revision} current={file.status !== "Superseded"} />
          <FileStatusBadge status={file.status} />
          <span className="min-w-0 flex-1 truncate text-[12.5px] text-muted-foreground">
            {formatSize(file.sizeBytes)} · {formatDate(file.modifiedAt)}
          </span>
          <Info className="size-4 text-muted-foreground" />
        </button>
        <div className="mt-2.5 grid grid-cols-[1fr_auto] gap-2">
          <button type="button" className="btn btn-secondary h-11" onClick={() => setAsk(true)}>
            <Sparkles className="size-4 text-primary" /> Ask about this document
          </button>
          <button type="button" aria-label="Download" className="btn btn-secondary size-11 p-0" onClick={() => notify.prototype("Download")}>
            <Download className="size-4" />
          </button>
        </div>
      </div>

      <Sheet open={sheet === "details"} onClose={() => setSheet(null)} title="Details">
        <div className="px-4 pb-2">
          <p className="text-code font-medium break-all">{file.name}</p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">{project?.name}</p>
        </div>
        <div className="border-t border-border">
          <KV
            rows={[
              ["Revision", <RevisionBadge key="r" revision={file.revision} current={file.status !== "Superseded"} />],
              ["Discipline", <DisciplineBadge key="d" discipline={file.metadata.discipline} />],
              ["Size", formatSize(file.sizeBytes)],
              ["Uploaded", `${formatDate(file.metadata.uploadedAt)} · ${file.metadata.uploadedBy}`],
              ["Status", <FileStatusBadge key="s" status={file.status} />],
              ["Pages", String(total)],
              ["Source", file.metadata.source],
            ]}
          />
        </div>
      </Sheet>

      <Sheet open={sheet === "more"} onClose={() => setSheet(null)} title="File actions">
        {(
          [
            [Download, "Download", () => notify.prototype("Download")],
            [Copy, "Share / Copy link", copy],
            [ExternalLink, "Open externally", () => notify.prototype("Open externally")],
            [Info, "Details", () => setSheet("details")],
          ] as const
        ).map(([Icon, label, fn]) => (
          <button
            key={label}
            type="button"
            onClick={() => void fn()}
            className="flex min-h-[52px] w-full items-center gap-3 border-t border-border px-4 text-left text-[15px] active:bg-surface"
          >
            <Icon className="size-[18px] text-primary" strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </Sheet>

      <Sheet open={Boolean(search.ask)} onClose={() => setAsk(false)} title="Ask about this document">
        <p className="truncate px-4 pb-2 text-code text-muted-foreground">{file.name}</p>
        <MobileAsk
          suggestions={["Summarize this document", "What changed in this revision?", "What does this drawing show?"]}
          placeholder="Ask a question about this document"
          ask={(q) => askFile(fileId, q)}
        />
        <div className="h-4" />
      </Sheet>
    </div>
  );
}

function ViewerBar({ title, onMore }: { title: string; onMore: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="grid h-12 shrink-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center px-1.5 text-navy-foreground">
      <button
        type="button"
        aria-label="Back"
        onClick={() => (window.history.length > 1 ? window.history.back() : void navigate({ to: "/m" }))}
        className="flex size-11 items-center justify-center"
      >
        <ChevronLeft className="size-5" />
      </button>
      <p className="truncate text-center font-mono text-[13px]">{title}</p>
      <span className="text-navy-foreground [&_svg]:text-navy-foreground">
        <IconButton label="More" icon={MoreHorizontal} onClick={onMore} />
      </span>
    </div>
  );
}
