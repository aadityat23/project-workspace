import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AskBlock } from "@/components/ai/AskBlock";
import { FileStatusBadge, RevisionBadge } from "@/components/kit/Badges";
import { FileKindIcon } from "./FileTable";
import { askFile, getActivity, getDocumentPages, retryProcessing } from "@/lib/api";
import { notify } from "@/lib/notify";
import { formatDateTime, formatSize } from "@/lib/format";
import type { ProjectFile } from "@/lib/types";

const tabs = ["Preview", "Details", "Activity", "AI Assistant"] as const;
type Tab = (typeof tabs)[number];

export function FileDetailPanel({
  file,
  folderName,
  projectName,
  onClose,
  onUpdate,
}: {
  file: ProjectFile;
  onUpdate?: (file: ProjectFile) => void;
  folderName: string;
  projectName: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("Preview");
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const pages = getDocumentPages(file.id);
  const previewable = file.kind === "PDF" && pages.length > 0;

  useEffect(() => {
    setTab("Preview");
    setPage(1);
    setZoom(100);
  }, [file.id]);

  const currentPage = pages.find((item) => item.page === page) ?? pages[0];

  return (
    <aside className="flex h-full w-full flex-col border-l border-border bg-card">
      <header className="border-b border-border px-4 py-3">
        <div className="flex items-start gap-2">
          <FileKindIcon kind={file.kind} className="mt-0.5 size-4" />
          <div className="min-w-0 flex-1">
            <p className="text-overline">{folderName}</p>
            <p className="mt-1 truncate text-[15px] font-semibold" title={file.name}>
              {file.name}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <RevisionBadge revision={file.revision} current={file.status !== "Superseded"} />
              <FileStatusBadge status={file.status} />
              <span className="text-code text-[11.5px] text-muted-foreground">
                {formatSize(file.sizeBytes)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            className="btn btn-ghost size-7 px-0"
          >
            <X className="size-4" />
          </button>
        </div>
      </header>

      {file.status === "Failed" ? (
        <div role="alert" className="flex items-center justify-between gap-3 border-b border-border bg-danger/5 px-4 py-2.5">
          <p className="text-[12.5px]">
            <span className="font-medium text-danger">Processing failed.</span>{" "}
            <span className="text-muted-foreground">Text could not be extracted.</span>
          </p>
          <button
            type="button"
            className="btn btn-secondary h-7 px-2.5"
            onClick={() => {
              if (onUpdate) retryProcessing(file, onUpdate);
              notify.success("Processing restarted", file.name);
            }}
          >
            Retry
          </button>
        </div>
      ) : file.status === "Uploading" || file.status === "Processing" ? (
        <div role="status" className="border-b border-border bg-surface px-4 py-2.5">
          <p className="text-[12.5px] text-muted-foreground">
            {file.status === "Uploading" ? "Uploading file…" : "Extracting text and building the search index…"}
          </p>
          <div className="mt-1.5 h-0.5 overflow-hidden bg-border">
            <div className="h-full w-1/3 bg-primary animate-splash-bar" />
          </div>
        </div>
      ) : null}

      <nav aria-label="File detail sections" className="flex border-b border-border px-2">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`text-meta border-b-2 px-2.5 py-2 font-medium whitespace-nowrap transition-colors duration-150 ${
              tab === item
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "Preview" ? (
          previewable ? (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="btn btn-ghost size-7 px-0"
                    aria-label="Previous page"
                    disabled={page <= 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="text-meta tabular text-muted-foreground">
                    Page {page} / {pages.length}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost size-7 px-0"
                    aria-label="Next page"
                    disabled={page >= pages.length}
                    onClick={() => setPage((value) => Math.min(pages.length, value + 1))}
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="btn btn-ghost size-7 px-0"
                    aria-label="Zoom out"
                    onClick={() => setZoom((value) => Math.max(70, value - 10))}
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="text-meta tabular w-10 text-center text-muted-foreground">
                    {zoom}%
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost size-7 px-0"
                    aria-label="Zoom in"
                    onClick={() => setZoom((value) => Math.min(150, value + 10))}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-surface p-5 border-t border-border">
                <article
                  className="mx-auto border border-border bg-card px-6 py-6 shadow-none"
                  style={{ width: `${zoom}%`, maxWidth: "100%" }}
                >
                  <p className="text-overline">
                    {file.metadata.discipline} · {file.revision}
                  </p>
                  <h3 className="text-section mt-2">{currentPage?.heading}</h3>
                  <div className="mt-3 space-y-2">
                    {currentPage?.body.map((line) => (
                      <p key={line} className="text-meta leading-relaxed text-muted-foreground">
                        {line}
                      </p>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          ) : (
            <div className="px-4 py-6">
              <p className="text-label">Preview not available</p>
              <p className="text-meta mt-1 text-muted-foreground">
                {file.status === "Uploading" || file.status === "Processing"
                  ? "The preview becomes available once processing finishes."
                  : file.status === "Failed"
                    ? "No preview could be generated for this file."
                    : `${file.kind} files are not rendered in the browser. Download the file to open it in the associated application.`}
              </p>
              <dl className="mt-4 divide-y divide-border border-y border-border">
                <Row label="Size" value={formatSize(file.sizeBytes)} />
                <Row label="Uploaded by" value={file.metadata.uploadedBy} />
                <Row label="Modified" value={formatDateTime(file.modifiedAt)} />
              </dl>
              <div className="mt-4 flex gap-2">
                <button type="button" className="btn btn-primary" onClick={() => notify.prototype(`Download ${file.name}`)}>
                  <Download className="size-4" />
                  Download
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => notify.prototype(`Open ${file.name} externally`)}>
                  <ExternalLink className="size-4" />
                  Open externally
                </button>
              </div>
            </div>
          )
        ) : null}

        {tab === "Details" ? (
          <dl className="divide-y divide-border">
            <Row label="Filename" value={file.name} />
            <Row label="File type" value={file.kind} />
            <Row label="Size" value={formatSize(file.sizeBytes)} />
            <Row label="Uploaded by" value={file.metadata.uploadedBy} />
            <Row label="Uploaded" value={formatDateTime(file.metadata.uploadedAt)} />
            <Row label="Revision" value={file.revision} />
            <Row label="Discipline" value={file.metadata.discipline} />
            <Row label="Source" value={file.metadata.source} />
            <Row label="Project" value={projectName} />
            <Row label="Folder" value={folderName} />
            {file.metadata.pages ? <Row label="Pages" value={String(file.metadata.pages)} /> : null}
          </dl>
        ) : null}

        {tab === "Activity" ? (
          <ul className="divide-y divide-border">
            <li className="px-4 py-3">
              <p className="text-body">
                <span className="font-medium">{file.metadata.uploadedBy}</span> uploaded this file
              </p>
              <p className="text-meta mt-0.5 text-muted-foreground">
                {formatDateTime(file.metadata.uploadedAt)}
              </p>
            </li>
            {file.status === "Superseded" ? (
              <li className="px-4 py-3">
                <p className="text-body">Marked superseded by a newer revision</p>
                <p className="text-meta mt-0.5 text-muted-foreground">
                  {formatDateTime(file.modifiedAt)}
                </p>
              </li>
            ) : null}
            {getActivity(file.projectId)
              .filter((entry) => entry.target.includes(file.name))
              .slice(0, 3)
              .map((entry) => (
                <li key={entry.id} className="px-4 py-3">
                  <p className="text-body">
                    <span className="font-medium">{entry.actor}</span> {entry.action}
                  </p>
                  <p className="text-meta mt-0.5 text-muted-foreground">
                    {formatDateTime(entry.at)}
                  </p>
                </li>
              ))}
          </ul>
        ) : null}

        {tab === "AI Assistant" ? (
          <div className="px-4 py-4">
            <p className="text-meta mb-3 text-muted-foreground">
              Answers are generated from the indexed text of this document only.
            </p>
            <AskBlock
              compact
              placeholder="Ask about this document…"
              onAsk={(question) => askFile(file.id, question)}
              suggestions={[
                "Summarise this document",
                "What changed in this revision?",
                "Which specifications are referenced?",
              ]}
            />
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 px-4 py-2.5">
      <dt className="text-meta w-[104px] shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-meta min-w-0 flex-1 break-words text-foreground">{value}</dd>
    </div>
  );
}
