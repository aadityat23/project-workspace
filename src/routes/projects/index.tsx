import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ImagePlus, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ProjectStatusBadge } from "@/components/kit/Badges";
import { Field, Modal } from "@/components/kit/Modal";
import { notify } from "@/lib/notify";
import { EmptyState } from "@/components/kit/Page";
import { SearchInput } from "@/components/kit/SearchInput";
import { COVER_IMAGE_TYPES, createProject, getProjectBriefingCounts, getProjects } from "@/lib/api";
import { useProjectsVersion } from "@/lib/use-projects";
import { formatDate } from "@/lib/format";
import { projectImage } from "@/lib/project-media";
import type { Project, ProjectStatus } from "@/lib/types";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Milind Awasarmol & Associates" },
      {
        name: "description",
        content:
          "Every Milind Awasarmol & Associates project with client, location, status and file counts in one register.",
      },
      { property: "og:title", content: "Projects — Milind Awasarmol & Associates" },
      {
        property: "og:description",
        content: "Project register with client, location, status and file counts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Projects,
});

const statuses = ["All", "Active", "On Hold", "Completed", "Planning"] as const;

function Projects() {
  const version = useProjectsVersion();
  const all = useMemo(() => getProjects(), [version]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");
  const [createOpen, setCreateOpen] = useState(false);

  const projects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((p) => {
      const mq =
        !q || `${p.name} ${p.location} ${p.client} ${p.code}`.toLowerCase().includes(q);
      return mq && (status === "All" || p.status === status);
    });
  }, [all, query, status]);

  const primary = projects.filter((p) => p.status === "Active");
  const others = projects.filter((p) => p.status !== "Active");

  return (
    <div className="mx-auto w-full max-w-[1440px] px-8 pt-7 pb-14">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-5">
        <div>
          <p className="text-overline">Directory · {all.length} projects</p>
          <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.015em]">
            Projects
            <span className="ml-3 font-normal text-muted-foreground">
              {all.filter((p) => p.status === "Active").length} active on site
            </span>
          </h1>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Create Project
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="flex border-b border-border">
          {statuses.map((s) => {
            const count = s === "All" ? all.length : all.filter((p) => p.status === s).length;
            return (
              <button
                key={s}
                role="tab"
                aria-selected={status === s}
                type="button"
                onClick={() => setStatus(s)}
                className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-[13px] ${
                  status === s
                    ? "border-foreground font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
                <span className="font-mono text-[11px] text-muted-foreground">{count}</span>
              </button>
            );
          })}
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search name, client, location, code"
          className="w-full max-w-[320px]"
        />
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects match this filter"
          description="Adjust the search term or choose a different status."
        />
      ) : (
        <>
          {primary.length > 0 ? (
            <section className="mt-6">
              <header className="flex h-9 items-center justify-between border-b border-foreground/80">
                <h2 className="text-[11px] font-semibold tracking-[0.12em] uppercase">
                  Active projects
                </h2>
                <span className="font-mono text-[11.5px] text-muted-foreground">{primary.length}</span>
              </header>
              <div className="mt-4 grid gap-5 lg:grid-cols-2">
                {primary.map((p) => (
                  <PrimaryRecord key={p.id} p={p} />
                ))}
              </div>
            </section>
          ) : null}

          {others.length > 0 ? (
            <section className="mt-10">
              <header className="flex h-9 items-center justify-between border-b border-foreground/80">
                <h2 className="text-[11px] font-semibold tracking-[0.12em] uppercase">
                  On hold, completed and planning
                </h2>
                <span className="font-mono text-[11.5px] text-muted-foreground">{others.length}</span>
              </header>
              <div className="grid grid-cols-[92px_minmax(0,2fr)_minmax(0,1.2fr)_120px_80px_110px] items-center gap-x-5 border-b border-border py-2 text-[10.5px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                <span />
                <span>Project</span>
                <span>Client · Type</span>
                <span>Status</span>
                <span className="text-right">Files</span>
                <span>Updated</span>
              </div>
              <ul className="divide-y divide-border">
                {others.map((p) => (
                  <li key={p.id}>
                    <Link
                      to="/projects/$projectId"
                      params={{ projectId: p.id }}
                      className="group grid grid-cols-[92px_minmax(0,2fr)_minmax(0,1.2fr)_120px_80px_110px] items-center gap-x-5 py-3 hover:bg-surface"
                    >
                      <img
                        src={projectImage(p.id)}
                        alt=""
                        loading="lazy"
                        width={1280}
                        height={800}
                        className="h-[56px] w-[92px] rounded-[4px] object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold tracking-[0.02em] uppercase group-hover:text-primary">
                          {p.name}
                        </p>
                        <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
                          {p.location}
                        </p>
                        <p className="text-code mt-0.5 text-[11.5px] text-muted-foreground">{p.code}</p>
                      </div>
                      <div className="min-w-0 text-[13px]">
                        <p className="truncate">{p.client}</p>
                        <p className="truncate text-[12px] text-muted-foreground">{p.category}</p>
                      </div>
                      <ProjectStatusBadge status={p.status} />
                      <span className="text-code text-right">{p.fileCount}</span>
                      <span className="text-code text-muted-foreground">{formatDate(p.updatedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

function PrimaryRecord({ p }: { p: Project }) {
  const c = getProjectBriefingCounts(p.id);
  return (
    <Link
      to="/projects/$projectId"
      params={{ projectId: p.id }}
      className="group grid overflow-hidden rounded-[6px] border border-border bg-card transition-colors hover:border-border-strong sm:grid-cols-[240px_minmax(0,1fr)]"
    >
      <div className="relative min-h-[200px]">
        <img
          src={projectImage(p.id)}
          alt={`${p.name} site`}
          loading="lazy"
          width={1280}
          height={800}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute top-3 left-3 bg-navy px-2 py-1 font-mono text-[11px] text-navy-foreground">
          {p.code}
        </span>
      </div>
      <div className="flex min-w-0 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold tracking-[0.03em] uppercase group-hover:text-primary">
              {p.name}
            </p>
            <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">{p.location}</p>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
        </div>
        <dl className="dl-grid mt-4 text-[12.5px]">
          <dt className="text-muted-foreground">Client</dt>
          <dd className="truncate">{p.client}</dd>
          <dt className="text-muted-foreground">Type</dt>
          <dd>{p.category}</dd>
          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <ProjectStatusBadge status={p.status} />
          </dd>
        </dl>
        <dl className="mt-auto flex divide-x divide-border border-t border-border pt-3">
          {(
            [
              ["Docs", c.documents],
              ["Drawings", c.drawings],
              ["Photos", c.photos],
              ["Updated", formatDate(p.updatedAt)],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="px-2.5 first:pl-0 whitespace-nowrap">
              <dt className="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                {k}
              </dt>
              <dd className="mt-0.5 font-mono text-[12.5px] tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Link>
  );
}

const emptyForm = {
  name: "",
  code: "",
  category: "Residential",
  location: "",
  manager: "Milind Awasarmol",
  status: "Planning" as ProjectStatus,
};

function CreateProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const set = <K extends keyof typeof emptyForm>(k: K, v: (typeof emptyForm)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (!COVER_IMAGE_TYPES.includes(file.type)) {
      notify.error("Unsupported image", "Use a JPG, PNG or WEBP photo.");
      return;
    }
    setPhoto(file);
  };

  const reset = () => {
    setForm(emptyForm);
    setPhoto(null);
    if (input.current) input.current.value = "";
  };
  const close = () => {
    if (busy) return;
    reset();
    onClose();
  };
  const submit = async () => {
    if (!form.name.trim() || busy) return;
    setBusy(true);
    try {
      const p = await createProject({ ...form, coverFile: photo });
      notify.success("Project created", p.name);
      reset();
      onClose();
    } catch {
      notify.error("Could not create project", "Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Create project"
      description="Folders for each discipline are created automatically."
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={close}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" disabled={!form.name.trim() || busy} onClick={submit}>
            {busy ? "Creating…" : "Create project"}
          </button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Field label="Project name">
          <input
            className="field"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Aaditya Residency Phase 2"
          />
        </Field>
        <div>
          <span className="text-label mb-1.5 block">Project photo</span>
          <input
            ref={input}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-label="Project photo"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          {preview ? (
            <div className="flex items-center gap-4 rounded-[6px] border border-border p-2">
              <img src={preview} alt="Selected project photo" className="h-[72px] w-[116px] rounded-[4px] object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{photo?.name}</p>
                <p className="text-meta text-muted-foreground">Used as the project cover image</p>
              </div>
              <div className="flex gap-1">
                <button type="button" className="btn btn-ghost h-8 text-[12.5px]" onClick={() => input.current?.click()}>
                  Replace
                </button>
                <button
                  type="button"
                  className="btn btn-ghost h-8 text-[12.5px] text-danger"
                  onClick={() => {
                    setPhoto(null);
                    if (input.current) input.current.value = "";
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => input.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                pick(e.dataTransfer.files?.[0]);
              }}
              className={`flex h-[88px] w-full flex-col items-center justify-center gap-1 rounded-[6px] border border-dashed text-[13px] transition-colors ${
                drag ? "border-primary bg-primary/5" : "border-border-strong hover:bg-surface"
              }`}
            >
              <span className="flex items-center gap-2 font-medium">
                <ImagePlus className="size-4 text-muted-foreground" /> Add project photo
              </span>
              <span className="text-meta text-muted-foreground">JPG, PNG or WEBP · optional</span>
            </button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project code">
            <input className="field" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="ACL-2607" />
          </Field>
          <Field label="Client type">
            <select className="field w-full" value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option>Residential</option>
              <option>Commercial</option>
              <option>Retail</option>
              <option>Industrial</option>
            </select>
          </Field>
        </div>
        <Field label="Location">
          <input
            className="field"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Ghatkopar West, Mumbai"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project manager">
            <select className="field w-full" value={form.manager} onChange={(e) => set("manager", e.target.value)}>
              <option>Milind Awasarmol</option>
              <option>Pratibha Nair</option>
              <option>Sneha Kulkarni</option>
            </select>
          </Field>
          <Field label="Status">
            <select
              className="field w-full"
              value={form.status}
              onChange={(e) => set("status", e.target.value as ProjectStatus)}
            >
              <option>Planning</option>
              <option>Active</option>
              <option>On Hold</option>
            </select>
          </Field>
        </div>
      </form>
    </Modal>
  );
}
