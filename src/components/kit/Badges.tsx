import type { ProjectStatus, FileStatus, Discipline } from "@/lib/types";

/* Restrained status system: a small dot + text. Colour carries meaning, never decoration. */
function Dot({ tone }: { tone: string }) {
  return <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${tone}`} />;
}

function StatusText({ tone, label, muted }: { tone: string; label: string; muted?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium whitespace-nowrap ${
        muted ? "text-muted-foreground" : "text-foreground"
      }`}
    >
      <Dot tone={tone} />
      {label}
    </span>
  );
}

const fileTone: Record<FileStatus, string> = {
  Uploading: "bg-muted-foreground",
  Ready: "bg-success",
  Processing: "bg-primary",
  Failed: "bg-danger",
  Superseded: "bg-border-strong",
};

export function FileStatusBadge({ status }: { status: FileStatus }) {
  return <StatusText tone={fileTone[status]} label={status} muted={status === "Superseded"} />;
}

const projectTone: Record<ProjectStatus, string> = {
  Active: "bg-success",
  "On Hold": "bg-warning",
  Completed: "bg-primary",
  Planning: "bg-muted-foreground",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <StatusText tone={projectTone[status]} label={status} />;
}

export function RevisionBadge({ revision, current }: { revision: string; current?: boolean }) {
  return (
    <span
      className={`inline-flex h-5 items-center rounded-[3px] px-1.5 font-mono text-[11.5px] font-medium tabular-nums ${
        current
          ? "bg-navy text-navy-foreground"
          : "border border-border text-muted-foreground line-through decoration-muted-foreground/50"
      }`}
    >
      {revision}
    </span>
  );
}

export function DisciplineBadge({ discipline }: { discipline: Discipline }) {
  return (
    <span className="text-[10.5px] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
      {discipline}
    </span>
  );
}

export function DrawingStatusBadge({
  status,
}: {
  status: "Current" | "Superseded" | "For Review";
}) {
  const tone =
    status === "Current" ? "bg-success" : status === "For Review" ? "bg-warning" : "bg-border-strong";
  return <StatusText tone={tone} label={status} muted={status === "Superseded"} />;
}
