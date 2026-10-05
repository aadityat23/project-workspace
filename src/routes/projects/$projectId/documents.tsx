import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDownUp, ChevronRight, FolderPlus, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { FileDetailPanel } from "@/components/files/FileDetailPanel";
import { FileTable } from "@/components/files/FileTable";
import { FolderTree } from "@/components/files/FolderTree";
import { Field, Modal } from "@/components/kit/Modal";
import { EmptyState } from "@/components/kit/Page";
import { SearchInput, SelectInput } from "@/components/kit/SearchInput";
import { acceptedUploadTypes, getFolders, getProject, getProjectFiles, kindForFilename, uploadFiles } from "@/lib/api";
import { notify } from "@/lib/notify";
import type { Discipline, ProjectFile } from "@/lib/types";

export const Route = createFileRoute("/projects/$projectId/documents")({
  validateSearch: (search: Record<string, unknown>): { file?: string } =>
    typeof search["file"] === "string" ? { file: search["file"] } : {},
  head: ({ params }) => {
    const project = getProject(params.projectId);
    const title = `Documents — ${project?.name ?? "Project"}`;
    const description = `Folder tree, file register and document previews for ${project?.name ?? "the project"}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: Documents,
});

const sortOptions = ["Modified (newest)", "Modified (oldest)", "Name (A–Z)", "Size (largest)"];

function Documents() {
  const { projectId } = Route.useParams();
  const { file: fileParam } = Route.useSearch();
  const navigate = useNavigate();

  const folders = getFolders(projectId);
  const project = getProject(projectId);
  const rootId = folders.find((folder) => folder.parentId === null)?.id ?? "";

  const initialFolder = useMemo(() => {
    if (!fileParam) return rootId;
    return getProjectFiles(projectId).find((f) => f.id === fileParam)?.folderId ?? rootId;
  }, [fileParam, projectId, rootId]);

  const [folderId, setFolderId] = useState(initialFolder);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(sortOptions[0]!);
  const [selectedId, setSelectedId] = useState<string | null>(fileParam ?? null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [local, setLocal] = useState<ProjectFile[]>([]);
  const [picked, setPicked] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [discipline, setDiscipline] = useState<Discipline>("STRUCTURAL");
  const [revision, setRevision] = useState("");
  const [folderName2, setFolderName2] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const upsert = (file: ProjectFile) =>
    setLocal((list) => [file, ...list.filter((f) => f.id !== file.id)]);

  const addPicked = (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list);
    const bad = arr.filter((f) => !kindForFilename(f.name));
    if (bad.length) notify.error("Unsupported file type", bad.map((f) => f.name).join(", "));
    setPicked((p) => [...p, ...arr.filter((f) => kindForFilename(f.name))]);
  };

  const startUpload = () => {
    if (picked.length === 0) return;
    uploadFiles(projectId, folderId === rootId ? rootId : folderId, discipline, revision, picked, upsert);
    notify.success(`${picked.length} file${picked.length === 1 ? "" : "s"} uploading`, `Added to ${folderName}. Text indexing starts automatically.`);
    setPicked([]);
    setRevision("");
    setUploadOpen(false);
  };

  const files = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inFolder = local.filter((f) => folderId === rootId || f.folderId === folderId);
    const base = getProjectFiles(projectId, folderId === rootId ? undefined : folderId).map(
      (f) => local.find((l) => l.id === f.id) ?? f,
    );
    const list = [...inFolder.filter((f) => !base.some((b) => b.id === f.id)), ...base].filter(
      (file) => !q || file.name.toLowerCase().includes(q),
    );
    const sorted = [...list];
    if (sort === "Modified (oldest)") sorted.reverse();
    if (sort === "Name (A–Z)") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "Size (largest)") sorted.sort((a, b) => b.sizeBytes - a.sizeBytes);
    return sorted;
  }, [projectId, folderId, query, sort, rootId, local]);

  const selected = files.find((file) => file.id === selectedId) ?? null;
  const folderName = folders.find((folder) => folder.id === folderId)?.name ?? "Documents";

  const select = (id: string | null) => {
    setSelectedId(id);
    void navigate({
      to: "/projects/$projectId/documents",
      params: { projectId },
      search: id ? { file: id } : {},
      replace: true,
    });
  };

  return (
    <div className="flex h-full min-h-0">
      <div className="hidden w-[200px] shrink-0 overflow-y-auto border-r border-border bg-card lg:block">
        <p className="text-overline border-b border-border px-4 py-2.5">Folders</p>
        <FolderTree
          folders={folders}
          selectedId={folderId}
          onSelect={(id) => {
            setFolderId(id);
            select(null);
          }}
        />
        <div className="border-t border-border px-2 py-2">
          <button
            type="button"
            className="btn btn-ghost w-full justify-start"
            onClick={() => setNewFolderOpen(true)}
          >
            <FolderPlus className="size-4" />
            New Folder
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border bg-card px-5 py-3">
          <nav aria-label="Breadcrumb" className="text-meta flex items-center gap-1.5">
            <span className="text-muted-foreground">{project?.name}</span>
            <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />
            <span className="text-muted-foreground">Documents</span>
            {folderId !== rootId ? (
              <>
                <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />
                <span className="text-foreground">{folderName}</span>
              </>
            ) : null}
          </nav>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-screen">{folderName}</h2>
              <p className="text-meta mt-0.5 text-muted-foreground">
                {files.length} file{files.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search this folder"
                className="w-[240px]"
              />
              <SelectInput
                value={sort}
                onChange={setSort}
                ariaLabel="Sort files"
                options={sortOptions}
              />
              <button type="button" className="btn btn-secondary" onClick={() => setNewFolderOpen(true)}>
                <FolderPlus className="size-4" />
                New Folder
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setUploadOpen(true)}>
                <Upload className="size-4" />
                Upload
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-card">
          {files.length === 0 ? (
            <EmptyState
              icon={<ArrowDownUp className="size-6" />}
              title="No files in this folder"
              description="Upload drawings, reports or contracts to start building the project record."
              action={
                <button type="button" className="btn btn-primary" onClick={() => setUploadOpen(true)}>
                  <Upload className="size-4" />
                  Upload files
                </button>
              }
            />
          ) : (
            <FileTable files={files} selectedId={selectedId} compact={selected !== null} onSelect={(file) => select(file.id)} />
          )}
        </div>
      </div>

      {selected ? (
        <div className="hidden w-[340px] shrink-0 2xl:w-[380px] xl:block">
          <FileDetailPanel
            file={selected}
            folderName={folderName}
            projectName={project?.name ?? ""}
            onClose={() => select(null)}
            onUpdate={upsert}
          />
        </div>
      ) : null}

      <Modal
        open={newFolderOpen}
        onClose={() => setNewFolderOpen(false)}
        title="New folder"
        width="sm"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setNewFolderOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!folderName2.trim()}
              onClick={() => {
                notify.prototype(`Create folder “${folderName2.trim()}”`);
                setFolderName2("");
                setNewFolderOpen(false);
              }}
            >
              Create folder
            </button>
          </>
        }
      >
        <Field label="Folder name" hint={`Created inside ${folderName}`}>
          <input className="field" placeholder="e.g. Site Instructions" value={folderName2} onChange={(e) => setFolderName2(e.target.value)} />
        </Field>
      </Modal>

      <Modal
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setPicked([]);
        }}
        title="Upload files"
        description={`Files are added to ${folderName} and queued for text indexing.`}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setUploadOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" disabled={picked.length === 0} onClick={startUpload}>
              Upload{picked.length ? ` ${picked.length} file${picked.length === 1 ? "" : "s"}` : ""}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addPicked(e.dataTransfer.files);
            }}
            className={`rounded-[6px] border border-dashed px-6 py-8 text-center transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border-strong bg-surface"}`}
          >
            <p className="text-label">Drop files here</p>
            <p className="text-meta mt-1 text-muted-foreground">
              PDF, DWG, XLSX, DOCX, JPG, PNG, ZIP up to 250 MB each
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={acceptedUploadTypes}
              className="sr-only"
              onChange={(e) => {
                addPicked(e.target.files);
                e.target.value = "";
              }}
            />
            <button type="button" className="btn btn-secondary mt-3" onClick={() => inputRef.current?.click()}>
              Browse files
            </button>
          </div>
          {picked.length ? (
            <ul className="divide-y divide-border border-y border-border">
              {picked.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 py-1.5 text-[13px]">
                  <span className="truncate" title={f.name}>{f.name}</span>
                  <button type="button" className="btn btn-ghost h-6 px-2 text-[12px]" onClick={() => setPicked((p) => p.filter((_, j) => j !== i))}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Discipline">
              <select className="field w-full" value={discipline} onChange={(e) => setDiscipline(e.target.value as Discipline)}>
                <option>ARCHITECTURAL</option>
                <option>STRUCTURAL</option>
                <option>ELECTRICAL</option>
                <option>PLUMBING</option>
                <option>MEP</option>
                <option>GENERAL</option>
              </select>
            </Field>
            <Field label="Revision">
              <input className="field" placeholder="R01" value={revision} onChange={(e) => setRevision(e.target.value.toUpperCase())} />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
