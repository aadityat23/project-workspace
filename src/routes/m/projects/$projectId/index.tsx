import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, ChevronRight, MoreHorizontal, Trash2, FolderOpen, Images, PenTool, Sparkles, Users } from "lucide-react";

import { ProjectStatusBadge } from "@/components/kit/Badges";
import { FileRow, IconButton, MSection, Sheet, MobileHeader, NavRow, StateBlock, navRowClass } from "@/components/mobile/kit";
import { deleteProject, getPhotos, getProject, getProjectBriefingCounts, getProjectFiles } from "@/lib/api";
import { notify } from "@/lib/notify";
import { projectImage } from "@/lib/project-media";

export const Route = createFileRoute("/m/projects/$projectId/")({
  head: ({ params }) => {
    const p = getProject(params.projectId);
    const t = `${p?.name ?? "Project"} — Milind Awasarmol & Associates Mobile`;
    return {
      meta: [
        { title: t },
        { name: "description", content: `Documents, drawings and photos for ${p?.name ?? "this project"}.` },
        { property: "og:title", content: t },
        { property: "og:description", content: `Project workspace for ${p?.name ?? "this project"}.` },
      ],
    };
  },
  component: MobileProject,
});

function MobileProject() {
  const { projectId } = Route.useParams();
  const project = getProject(projectId);
  const navigate = useNavigate();
  const [sheet, setSheet] = useState<null | "menu" | "confirm">(null);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  if (!project) {
    return (
      <>
        <MobileHeader title="Project" back />
        <StateBlock
          kind="error"
          title="Project not found"
          body="It may have been archived or the link is outdated."
          action={<Link to="/m/projects" className="btn btn-secondary h-11">Open Projects</Link>}
        />
      </>
    );
  }
  const c = getProjectBriefingCounts(projectId);
  const files = [...getProjectFiles(projectId)].sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt)).slice(0, 3);
  const photos = getPhotos(projectId).slice(0, 4);

  return (
    <div className="pb-6">
      <MobileHeader
        title={project.name}
        back
        right={<IconButton label="Project actions" icon={MoreHorizontal} onClick={() => setSheet("menu")} />}
      />
      <div className="relative aspect-[16/9] bg-navy">
        <img src={projectImage(projectId)} alt={project.name} width={1280} height={800} className="size-full object-cover" />
      </div>
      <div className="border-b border-border bg-card px-4 pt-3.5 pb-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[11.5px] text-muted-foreground">
            {project.code} · {project.category.toUpperCase()}
          </p>
          <ProjectStatusBadge status={project.status} />
        </div>
        <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.015em] uppercase">{project.name}</h1>
        <p className="text-[13.5px] text-muted-foreground">{project.location}</p>
        <dl className="mt-3.5 grid grid-cols-3 border-t border-border pt-3">
          {(
            [
              ["Documents", c.documents],
              ["Drawings", c.drawings],
              ["Photos", c.photos],
            ] as const
          ).map(([k, v], i) => (
            <div key={k} className={i ? "border-l border-border pl-3" : ""}>
              <dd className="font-mono text-[20px] font-medium tabular-nums">{v}</dd>
              <dt className="text-[11.5px] text-muted-foreground">{k}</dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4 border-y border-border bg-card">
        <Link to="/m/projects/$projectId/documents" params={{ projectId }} className={navRowClass}>
          <NavRow icon={FolderOpen} label="Documents" meta={c.documents} />
        </Link>
        <Link to="/m/projects/$projectId/drawings" params={{ projectId }} className={navRowClass}>
          <NavRow icon={PenTool} label="Drawings" meta={c.drawings} />
        </Link>
        <Link to="/m/projects/$projectId/photos" params={{ projectId }} className={navRowClass}>
          <NavRow icon={Images} label="Photos" meta={c.photos} />
        </Link>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-px border-y border-border bg-border">
        <Link to="/m/activity" search={{ project: projectId }} className="flex h-11 items-center justify-center gap-2 bg-card text-[13.5px] font-medium">
          <Activity className="size-4 text-muted-foreground" /> Activity
        </Link>
        <Link to="/m/team" className="flex h-11 items-center justify-center gap-2 bg-card text-[13.5px] font-medium">
          <Users className="size-4 text-muted-foreground" /> Team
        </Link>
      </div>

      <section className="px-4 pt-4">
        <Link
          to="/m/projects/$projectId/ask"
          params={{ projectId }}
          className="flex min-h-[56px] items-center gap-3 rounded-[6px] border border-border bg-card px-3.5 active:bg-surface"
        >
          <Sparkles className="size-[18px] text-primary" strokeWidth={1.75} />
          <span className="flex-1 text-[14.5px] font-medium">Ask this project</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </section>

      <MSection title="Recent documents">
        {files.map((f) => (
          <FileRow key={f.id} file={f} />
        ))}
      </MSection>

      {photos.length > 0 && (
        <MSection
          title="Recent photos"
          flush
          action={
            <Link to="/m/projects/$projectId/photos" params={{ projectId }} className="text-[13px] font-medium text-primary">
              All photos
            </Link>
          }
        >
          <div className="grid grid-cols-4 gap-1 px-4">
            {photos.map((p) => (
              <Link key={p.id} to="/m/projects/$projectId/photos" params={{ projectId }} className="aspect-square overflow-hidden rounded-[4px] bg-surface">
                <img src={p.url} alt={p.title} loading="lazy" className="size-full object-cover" />
              </Link>
            ))}
          </div>
        </MSection>
      )}

      <Sheet open={sheet === "menu"} onClose={() => setSheet(null)} title="Project actions">
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => setSheet("confirm")}
            className="flex h-12 w-full items-center gap-3 rounded-[6px] border border-border px-3.5 text-[15px] font-medium text-danger"
          >
            <Trash2 className="size-[18px]" /> Delete project
          </button>
        </div>
      </Sheet>

      <Sheet
        open={sheet === "confirm"}
        onClose={() => {
          if (busy) return;
          setSheet(null);
          setTyped("");
        }}
        title="Delete project"
        footer={
          <button
            type="button"
            disabled={typed.trim() !== project.name || busy}
            onClick={async () => {
              setBusy(true);
              try {
                await deleteProject(project.id);
                notify.success("Project deleted", project.name);
                setSheet(null);
                void navigate({ to: "/m/projects", replace: true });
              } catch {
                notify.error("Could not delete project", "Try again.");
              } finally {
                setBusy(false);
              }
            }}
            className="btn h-12 w-full bg-danger text-[15px] text-danger-foreground disabled:opacity-50"
          >
            {busy ? "Deleting…" : "Delete project"}
          </button>
        }
      >
        <div className="px-4 pb-4">
          <p className="text-[15px] font-semibold uppercase">Delete "{project.name}"?</p>
          <p className="mt-2 text-[14px] text-muted-foreground">
            This will permanently remove the project and its associated data. This cannot be undone.
          </p>
          <label className="mt-4 block">
            <span className="text-label">
              Type <span className="font-mono">{project.name}</span> to confirm
            </span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="field mt-1.5 h-12 w-full font-mono text-[16px]"
            />
          </label>
        </div>
      </Sheet>
    </div>
  );
}
