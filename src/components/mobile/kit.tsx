import { Link, useRouter } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Loader2,
  PenTool,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { FileStatusBadge, ProjectStatusBadge, RevisionBadge } from "@/components/kit/Badges";
import { getProjectBriefingCounts } from "@/lib/api";
import { formatDate, relativeDay } from "@/lib/format";
import { projectImage } from "@/lib/project-media";
import type { FileKind, Project, ProjectFile } from "@/lib/types";

/* ---------- Header ---------- */

export function MobileHeader({
  title,
  eyebrow,
  back,
  right,
  large,
}: {
  title: string;
  eyebrow?: string | undefined;
  back?: boolean;
  right?: ReactNode;
  large?: boolean;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card">
      <div className="grid h-12 grid-cols-[44px_minmax(0,1fr)_auto] items-center px-1.5">
        {back ? (
          <button
            type="button"
            aria-label="Back"
            onClick={() => router.history.back()}
            className="flex size-11 items-center justify-center text-foreground"
          >
            <ChevronLeft className="size-5" />
          </button>
        ) : (
          <span />
        )}
        {!large ? (
          <p className="truncate text-center text-[15px] font-semibold">{title}</p>
        ) : (
          <span />
        )}
        <div className="flex min-w-[44px] justify-end">{right}</div>
      </div>
      {large && (
        <div className="px-4 pb-3.5">
          {eyebrow && <p className="text-overline">{eyebrow}</p>}
          <h1 className="mt-0.5 truncate text-[24px] font-semibold tracking-[-0.015em]">{title}</h1>
        </div>
      )}
    </header>
  );
}

export function IconButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center text-foreground"
    >
      <Icon className="size-5" />
    </button>
  );
}

/* ---------- Section ---------- */

export function MSection({
  title,
  action,
  children,
  flush,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  flush?: boolean;
}) {
  return (
    <section className="pt-5">
      <div className="flex items-end justify-between px-4 pb-2">
        <h2 className="text-overline">{title}</h2>
        {action}
      </div>
      <div className={flush ? "" : "border-y border-border bg-card"}>{children}</div>
    </section>
  );
}

/* ---------- Chips (horizontal filters) ---------- */

export function Chips<T extends string>({
  options,
  value,
  onChange,
  counts,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  counts?: Partial<Record<T, number>>;
}) {
  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-2.5" role="tablist">
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o)}
            className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[4px] border px-2.5 text-[13px] font-medium ${
              active
                ? "border-navy bg-navy text-navy-foreground"
                : "border-border-strong bg-card text-foreground"
            }`}
          >
            {o}
            {counts?.[o] !== undefined && (
              <span className={`font-mono text-[11px] ${active ? "text-navy-muted" : "text-muted-foreground"}`}>
                {counts[o]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- File rows ---------- */

const kindIcon: Record<FileKind, LucideIcon> = {
  PDF: FileText,
  DWG: PenTool,
  XLSX: FileSpreadsheet,
  DOCX: FileText,
  JPG: FileImage,
  PNG: FileImage,
  ZIP: FileArchive,
};

export function FileKindIcon({ kind }: { kind: FileKind }) {
  const Icon = kindIcon[kind];
  return (
    <span className="relative flex size-10 shrink-0 flex-col items-center justify-center rounded-[4px] border border-border bg-surface">
      <Icon className="size-4 text-primary" strokeWidth={1.75} />
      <span className="mt-0.5 font-mono text-[8.5px] font-medium tracking-[0.06em] text-muted-foreground">
        {kind}
      </span>
    </span>
  );
}

export function FileRowBody({ file, project }: { file: ProjectFile; project?: string | undefined }) {
  return (
    <>
      <FileKindIcon kind={file.kind} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14.5px] font-medium">{file.name}</span>
        <span className="mt-1 flex items-center gap-2 text-[12.5px] text-muted-foreground">
          <RevisionBadge revision={file.revision} current={file.status !== "Superseded"} />
          <FileStatusBadge status={file.status} />
          <span className="truncate">· {project ?? relativeDay(file.modifiedAt)}</span>
        </span>
      </span>
    </>
  );
}

export function FileRow({ file, project }: { file: ProjectFile; project?: string | undefined }) {
  return (
    <Link
      to="/m/file/$fileId"
      params={{ fileId: file.id }}
      search={{}}
      className="flex min-h-[64px] items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0 active:bg-surface"
    >
      <FileRowBody file={file} project={project} />
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

/* ---------- Project record ---------- */

export function ProjectRecord({ project, large }: { project: Project; large?: boolean }) {
  const c = getProjectBriefingCounts(project.id);
  if (large) {
    return (
      <Link
        to="/m/projects/$projectId"
        params={{ projectId: project.id }}
        className="block overflow-hidden rounded-[6px] border border-border bg-card active:bg-surface"
      >
        <div className="relative aspect-[16/9] bg-surface">
          <img
            src={projectImage(project.id)}
            alt={project.name}
            width={1280}
            height={800}
            loading="lazy"
            className="size-full object-cover"
          />
          <span className="absolute top-2.5 left-2.5 rounded-[3px] bg-navy px-1.5 py-0.5 font-mono text-[11px] text-navy-foreground">
            {project.code}
          </span>
        </div>
        <div className="px-3.5 pt-3 pb-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold tracking-[-0.01em]">{project.name}</p>
              <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                {project.location} · {project.category}
              </p>
            </div>
            <ProjectStatusBadge status={project.status} />
          </div>
          <dl className="mt-3 grid grid-cols-3 border-t border-border pt-2.5">
            {(
              [
                ["Documents", c.documents],
                ["Drawings", c.drawings],
                ["Photos", c.photos],
              ] as const
            ).map(([k, v], i) => (
              <div key={k} className={i ? "border-l border-border pl-3" : ""}>
                <dt className="text-[11px] text-muted-foreground">{k}</dt>
                <dd className="font-mono text-[16px] font-medium tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Link>
    );
  }
  return (
    <Link
      to="/m/projects/$projectId"
      params={{ projectId: project.id }}
      className="flex min-h-[76px] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 active:bg-surface"
    >
      <img
        src={projectImage(project.id)}
        alt=""
        width={72}
        height={54}
        loading="lazy"
        className="h-[54px] w-[72px] shrink-0 rounded-[4px] object-cover"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14.5px] font-semibold">{project.name}</span>
        <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">
          <span className="font-mono">{project.code}</span> · {project.location}
        </span>
        <span className="mt-1 flex items-center gap-2 text-[12px] text-muted-foreground">
          <ProjectStatusBadge status={project.status} />
          <span>· {project.fileCount} files · {formatDate(project.updatedAt)}</span>
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

/* ---------- States ---------- */

export function StateBlock({
  kind,
  title,
  body,
  action,
}: {
  kind: "empty" | "loading" | "error";
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  const Icon = kind === "loading" ? Loader2 : kind === "error" ? AlertTriangle : FileText;
  return (
    <div role={kind === "error" ? "alert" : "status"} className="px-6 py-10 text-center">
      <span className="mx-auto flex size-10 items-center justify-center rounded-[4px] border border-border bg-card">
        <Icon
          className={`size-4 ${kind === "loading" ? "animate-spin text-primary" : kind === "error" ? "text-danger" : "text-muted-foreground"}`}
        />
      </span>
      <p className="mt-3 text-[14.5px] font-semibold">{title}</p>
      {body && <p className="mx-auto mt-1 max-w-[260px] text-[13px] text-muted-foreground">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SkeletonRows({ n = 4 }: { n?: number }) {
  return (
    <div aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="size-10 animate-pulse rounded-[4px] bg-surface" />
          <span className="flex-1 space-y-2">
            <span className="block h-3 w-3/4 animate-pulse rounded bg-surface" />
            <span className="block h-2.5 w-1/2 animate-pulse rounded bg-surface" />
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Bottom sheet ---------- */

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-navy/45"
        onClick={onClose}
      />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-sheet relative flex max-h-[86%] flex-col rounded-t-[8px] border-t border-border bg-card outline-none"
      >
        <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-border-strong" aria-hidden />
        <div className="flex items-center justify-between py-1 pr-1.5 pl-4">
          <p className="text-[15px] font-semibold">{title}</p>
          <IconButton label="Close" icon={X} onClick={onClose} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-border p-3">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Key/value list ---------- */

export function KV({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-border">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 px-4 py-2.5">
          <dt className="text-[12.5px] text-muted-foreground">{k}</dt>
          <dd className="min-w-0 truncate text-[14px]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function NavRow({
  icon: Icon,
  label,
  meta,
  children,
}: {
  icon: LucideIcon;
  label: string;
  meta?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      <Icon className="size-[18px] shrink-0 text-primary" strokeWidth={1.75} />
      <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{label}</span>
      {meta && <span className="font-mono text-[12.5px] text-muted-foreground">{meta}</span>}
      {children}
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </>
  );
}

export const navRowClass =
  "flex min-h-[52px] items-center gap-3 border-b border-border px-4 last:border-b-0 active:bg-surface";
