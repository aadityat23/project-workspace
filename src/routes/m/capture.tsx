import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, Check, ChevronLeft, ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";

import { getCurrentUser, getProjects } from "@/lib/api";
import { upsertCaptured } from "@/lib/mobile-store";
import { notify } from "@/lib/notify";

type Search = { project?: string | undefined };

export const Route = createFileRoute("/m/capture")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    project: typeof s["project"] === "string" ? s["project"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Capture site photo — Milind Awasarmol & Associates Mobile" },
      { name: "description", content: "Take or choose a site photo and upload it to a project." },
      { property: "og:title", content: "Capture site photo — Milind Awasarmol & Associates Mobile" },
      { property: "og:description", content: "Document site progress from the field." },
    ],
  }),
  component: Capture,
});

const VISITS = ["Site Visit", "Slab Pour Inspection", "Progress Walkthrough", "Snag Inspection"];

function Capture() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const projects = getProjects().filter((p) => p.status !== "Completed");
  const [projectId, setProjectId] = useState(search.project ?? projects[0]?.id ?? "");
  const [visit, setVisit] = useState(VISITS[0]!);
  const [caption, setCaption] = useState("");
  const [picked, setPicked] = useState<{ file: File; url: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const camRef = useRef<HTMLInputElement>(null);
  const libRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  const onPick = (list: FileList | null) => {
    if (!list) return;
    const imgs = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (imgs.length < list.length) notify.error("Only images can be added here");
    setPicked((p) => [...p, ...imgs.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  };

  const upload = () => {
    if (!picked.length || !projectId) return;
    setBusy(true);
    const now = new Date().toISOString();
    picked.forEach(({ url, file }, i) => {
      const photo = {
        id: `cap-${Date.now()}-${i}`,
        projectId,
        title: caption.trim() || file.name.replace(/\.[^.]+$/, ""),
        visit,
        capturedAt: now,
        url,
        uploadedBy: getCurrentUser().name,
        status: "Uploading" as const,
      };
      upsertCaptured(photo);
      setTimeout(() => upsertCaptured({ ...photo, status: "Processing" }), 900 + i * 200);
      setTimeout(() => upsertCaptured({ ...photo, status: "Ready" }), 2200 + i * 300);
    });
    notify.success(`${picked.length} photo${picked.length > 1 ? "s" : ""} uploading`, visit);
    void navigate({ to: "/m/projects/$projectId/photos", params: { projectId }, replace: true });
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="grid h-12 shrink-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center border-b border-border px-1.5">
        <button type="button" aria-label="Back" onClick={() => window.history.back()} className="flex size-11 items-center justify-center">
          <ChevronLeft className="size-5" />
        </button>
        <p className="text-center text-[15px] font-semibold">Site photo</p>
        <span />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <input ref={camRef} type="file" accept="image/*" capture="environment" multiple hidden onChange={(e) => onPick(e.target.files)} />
        <input ref={libRef} type="file" accept="image/*" multiple hidden onChange={(e) => onPick(e.target.files)} />

        {picked.length === 0 ? (
          <div className="px-4 pt-5">
            <button
              type="button"
              onClick={() => camRef.current?.click()}
              className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-[6px] bg-navy text-navy-foreground active:opacity-90"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Camera className="size-6" />
              </span>
              <span className="text-[16px] font-semibold">Take photo</span>
            </button>
            <button type="button" onClick={() => libRef.current?.click()} className="btn btn-secondary mt-2.5 h-12 w-full text-[15px]">
              <ImagePlus className="size-[18px]" /> Choose from library
            </button>
          </div>
        ) : (
          <div className="px-4 pt-4">
            <div className="grid grid-cols-3 gap-1.5">
              {picked.map((p, i) => (
                <div key={p.url} className="relative aspect-square overflow-hidden rounded-[4px] bg-surface">
                  <img src={p.url} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => setPicked((l) => l.filter((_, j) => j !== i))}
                    className="absolute top-0 right-0 flex size-9 items-center justify-center"
                  >
                    <span className="flex size-6 items-center justify-center rounded-full bg-navy/80 text-navy-foreground">
                      <X className="size-3.5" />
                    </span>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => camRef.current?.click()}
                aria-label="Add another photo"
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[4px] border border-dashed border-border-strong text-[12px] text-muted-foreground"
              >
                <Camera className="size-5" /> Add
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 space-y-4 border-t border-border px-4 pt-4 pb-6">
          <label className="block">
            <span className="text-label">Project</span>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="field mt-1.5 h-12 w-full text-[15px]">
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.code}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="text-label">Site visit · <span className="font-mono">{today}</span></span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {VISITS.map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={v === visit}
                  onClick={() => setVisit(v)}
                  className={`inline-flex h-9 items-center gap-1 rounded-[4px] border px-2.5 text-[13px] font-medium ${
                    v === visit ? "border-navy bg-navy text-navy-foreground" : "border-border-strong"
                  }`}
                >
                  {v === visit && <Check className="size-3.5" />}
                  {v}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="text-label">Caption</span>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Level 6 slab reinforcement, grid C–D"
              className="field mt-1.5 h-12 w-full text-[15px]"
            />
          </label>
        </div>
      </div>

      <div className="shrink-0 border-t border-border p-3">
        <button type="button" disabled={!picked.length || busy} onClick={upload} className="btn btn-primary h-12 w-full text-[15px]">
          {picked.length ? `Upload ${picked.length} photo${picked.length > 1 ? "s" : ""}` : "Upload"}
        </button>
      </div>
    </div>
  );
}
