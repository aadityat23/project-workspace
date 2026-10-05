// Service layer. Every screen reads data through these functions so the mock
// dataset can be swapped for FastAPI endpoints without UI changes.
import {
  activity,
  currentUser,
  documentPages,
  drawings,
  files,
  folders,
  members,
  organisation,
  photos,
  projects,
  trashedFiles,
  users,
} from "./mock-data";
import type {
  AIAnswer,
  Activity,
  Drawing,
  DocumentPage,
  Folder,
  NewProjectInput,
  Photo,
  Project,
  ProjectFile,
  ProjectMember,
  SearchResult,
  TrashedFile,
  User,
} from "./types";

export function getCurrentUser(): User {
  return currentUser;
}

export function getOrganisation() {
  return organisation;
}

export function getUsers(): User[] {
  return users;
}

export function getProjects(): Project[] {
  return [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// Project mutations (prototype: session-local). Subscribers re-render on change.
const projectListeners = new Set<() => void>();
let projectsVersion = 0;
function emitProjects() {
  projectsVersion++;
  projectListeners.forEach((l) => l());
}
export function subscribeProjects(listener: () => void) {
  projectListeners.add(listener);
  return () => void projectListeners.delete(listener);
}
export function getProjectsVersion() {
  return projectsVersion;
}

export const COVER_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function createProject(input: NewProjectInput): Promise<Project> {
  await new Promise((r) => setTimeout(r, 300));
  const base = input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
  let id = base;
  for (let i = 2; projects.some((p) => p.id === id); i++) id = `${base}-${i}`;
  const today = new Date().toISOString().slice(0, 10);
  const project: Project = {
    id,
    name: input.name.trim(),
    code: input.code.trim() || "—",
    location: input.location.trim() || "—",
    client: input.category,
    category: input.category,
    status: input.status,
    fileCount: 0,
    updatedAt: today,
    startedOn: today,
    briefing: "New project. No documents have been uploaded yet.",
    manager: input.manager,
    ...(input.coverFile ? { coverImage: URL.createObjectURL(input.coverFile) } : {}),
  };
  projects.push(project);
  emitProjects();
  return project;
}

/** Removes the project from the workspace. Files are not touched here; backend policy decides. */
export async function deleteProject(projectId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  const i = projects.findIndex((p) => p.id === projectId);
  if (i >= 0) projects.splice(i, 1);
  emitProjects();
}

export function getProject(projectId: string): Project | undefined {
  return projects.find((project) => project.id === projectId);
}

export function getFolders(projectId: string): Folder[] {
  return folders.filter((folder) => folder.projectId === projectId);
}

export function getProjectFiles(projectId: string, folderId?: string): ProjectFile[] {
  return files
    .filter((file) => file.projectId === projectId)
    .filter((file) => (folderId ? file.folderId === folderId : true))
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}

export function getAllFiles(): ProjectFile[] {
  return [...files].sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}

export function getFile(fileId: string): ProjectFile | undefined {
  return files.find((file) => file.id === fileId);
}

export function getDocumentPages(fileId: string): DocumentPage[] {
  return documentPages[fileId] ?? [];
}

export function getDrawings(projectId?: string): Drawing[] {
  return drawings.filter((drawing) => (projectId ? drawing.projectId === projectId : true));
}

export function getPhotos(projectId?: string): Photo[] {
  return photos
    .filter((photo) => (projectId ? photo.projectId === projectId : true))
    .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
}

export function getProjectMembers(projectId: string): ProjectMember[] {
  return members.filter((member) => member.projectId === projectId);
}

export function getActivity(projectId?: string): Activity[] {
  return activity
    .filter((entry) => (projectId ? entry.projectId === projectId : true))
    .sort((a, b) => b.at.localeCompare(a.at));
}

export function getTrash(): TrashedFile[] {
  return trashedFiles;
}

export function getProjectBriefingCounts(projectId: string) {
  const projectFiles = getProjectFiles(projectId);
  return {
    documents: projectFiles.length,
    drawings: getDrawings(projectId).length,
    photos: getPhotos(projectId).length,
    processing: projectFiles.filter((file) => file.status === "Processing").length,
    revised: projectFiles.filter((file) => file.revision !== "R01").length,
  };
}

export function searchFiles(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const project of projects) {
    if (`${project.name} ${project.location} ${project.code}`.toLowerCase().includes(q)) {
      results.push({
        id: project.id,
        group: "PROJECTS",
        title: project.name,
        subtitle: `${project.code} · ${project.location} · ${project.status}`,
        projectId: project.id,
        href: `/projects/${project.id}`,
      });
    }
  }

  for (const file of files) {
    if (file.name.toLowerCase().includes(q)) {
      const project = getProject(file.projectId);
      results.push({
        id: file.id,
        group: "DOCUMENTS",
        title: file.name,
        subtitle: `${project?.name ?? ""} · ${file.metadata.discipline} · ${file.revision}`,
        projectId: file.projectId,
        href: `/projects/${file.projectId}/documents?file=${file.id}`,
      });
    }
  }

  for (const drawing of drawings) {
    if (`${drawing.number} ${drawing.name}`.toLowerCase().includes(q)) {
      const project = getProject(drawing.projectId);
      results.push({
        id: drawing.id,
        group: "DRAWINGS",
        title: `${drawing.number} ${drawing.name}`,
        subtitle: `${project?.name ?? ""} · ${drawing.discipline} · ${drawing.revision} · ${drawing.status}`,
        projectId: drawing.projectId,
        href: `/projects/${drawing.projectId}/drawings`,
      });
    }
  }

  for (const photo of photos) {
    if (`${photo.title} ${photo.visit}`.toLowerCase().includes(q)) {
      results.push({
        id: photo.id,
        group: "PHOTOS",
        title: photo.visit,
        subtitle: `${photo.title} · ${photo.uploadedBy}`,
        projectId: photo.projectId,
        href: `/projects/${photo.projectId}/photos`,
      });
    }
  }

  return results;
}

const projectAnswers: Record<string, AIAnswer> = {
  latest: {
    question: "What is the latest structural drawing?",
    answer:
      "The latest structural drawing is STR-104-R03, issued for construction on 26 September 2026. It supersedes R02 dated 30 August 2026.",
    keyPoints: [
      "Revision R03 adds top reinforcement at grid C/4.",
      "Concrete grade M30, reinforcement Fe500D.",
    ],
    sources: [
      { fileName: "STR-104-R03.pdf", page: 4, fileId: "f-1" },
      { fileName: "STR-104-R02.pdf", page: 4, fileId: "f-2" },
    ],
  },
  current: {
    question: "Which revision is current?",
    answer:
      "R03 is the current revision for STR-104. R01 and R02 are marked superseded in the Structural folder.",
    sources: [{ fileName: "STR-104-R03.pdf", page: 1, fileId: "f-1" }],
  },
  foundation: {
    question: "What documents mention the foundation?",
    answer:
      "Three documents reference the foundation: the raft reinforcement schedule, the soil investigation report, and the podium slab detail's general notes.",
    keyPoints: [
      "Raft-Foundation-Reinforcement-Schedule.xlsx — R02",
      "Soil-Investigation-Report.pdf — 24 pages",
    ],
    sources: [
      { fileName: "Raft-Foundation-Reinforcement-Schedule.xlsx", page: 1, fileId: "f-4" },
      { fileName: "Soil-Investigation-Report.pdf", page: 6, fileId: "f-11" },
      { fileName: "STR-104-R03.pdf", page: 2, fileId: "f-1" },
    ],
  },
  summary: {
    question: "Summarize the structural documents.",
    answer:
      "The structural set covers the podium slab reinforcement detail at R03, a raft foundation reinforcement schedule at R02, an M30 cube test report from September 2026, and the original soil investigation report. All slab work follows IS 456 with M30 concrete and Fe500D reinforcement.",
    keyPoints: [
      "4 structural documents, 1 at a superseded revision.",
      "Cube test results for September 2026 are on record.",
    ],
    sources: [
      { fileName: "STR-104-R03.pdf", page: 2, fileId: "f-1" },
      { fileName: "Cube-Test-Report-M30-Sep-2026.pdf", page: 1, fileId: "f-10" },
      { fileName: "Raft-Foundation-Reinforcement-Schedule.xlsx", page: 1, fileId: "f-4" },
    ],
  },
};

export const suggestedProjectQuestions = [
  "What is the latest structural drawing?",
  "Which revision is current?",
  "What documents mention the foundation?",
  "Summarize the structural documents.",
];

export async function askProject(projectId: string, question: string): Promise<AIAnswer> {
  await new Promise((resolve) => setTimeout(resolve, 450));
  const q = question.toLowerCase();
  const key = q.includes("foundation")
    ? "foundation"
    : q.includes("summar")
      ? "summary"
      : q.includes("current") || q.includes("revision")
        ? "current"
        : "latest";
  const base = projectAnswers[key]!;
  const projectFiles = getProjectFiles(projectId);
  const available = new Set(projectFiles.map((file) => file.name));
  const sources = base.sources.filter((source) => available.has(source.fileName));
  return {
    ...base,
    question,
    sources: sources.length ? sources : base.sources.slice(0, 1),
  };
}

export async function askFile(fileId: string, question: string): Promise<AIAnswer> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const file = getFile(fileId);
  const pages = getDocumentPages(fileId);
  return {
    question,
    answer: file
      ? `${file.name} is revision ${file.revision} of a ${file.metadata.discipline.toLowerCase()} document uploaded by ${file.metadata.uploadedBy}. ${
          pages.length
            ? `It contains ${pages.length} indexed pages covering general notes, schedules and revision history.`
            : "The text layer for this file has not been indexed yet."
        }`
      : "This document is not available.",
    keyPoints: pages.slice(0, 2).map((page) => `Page ${page.page}: ${page.heading}`),
    sources: pages.slice(0, 2).map((page) => ({
      fileName: file?.name ?? "",
      page: page.page,
      fileId,
    })),
  };
}

/* ---------- Uploads (simulated; replace with POST /files + processing status polling) ---------- */

const extKind: Record<string, ProjectFile["kind"]> = {
  pdf: "PDF", dwg: "DWG", xlsx: "XLSX", xls: "XLSX", docx: "DOCX", doc: "DOCX",
  jpg: "JPG", jpeg: "JPG", png: "PNG", zip: "ZIP",
};
export const acceptedUploadTypes = ".pdf,.dwg,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png,.zip";

export function kindForFilename(name: string): ProjectFile["kind"] | null {
  return extKind[name.split(".").pop()?.toLowerCase() ?? ""] ?? null;
}

/**
 * Registers uploads and reports status transitions Uploading → Processing → Ready.
 * The UI only consumes `onUpdate`, so a real pipeline can drive the same states.
 */
export function uploadFiles(
  projectId: string,
  folderId: string,
  discipline: ProjectFile["metadata"]["discipline"],
  revision: string,
  selected: { name: string; size: number }[],
  onUpdate: (file: ProjectFile) => void,
) {
  const now = new Date().toISOString();
  selected.forEach((f, i) => {
    const kind = kindForFilename(f.name);
    if (!kind) return;
    const file: ProjectFile = {
      id: `up-${Date.now()}-${i}`,
      projectId,
      folderId,
      name: f.name,
      kind,
      revision: revision || "R01",
      sizeBytes: f.size,
      modifiedAt: now,
      status: "Uploading",
      metadata: { uploadedBy: getCurrentUser().name, uploadedAt: now, discipline, source: "Web upload" },
    };
    onUpdate(file);
    setTimeout(() => onUpdate({ ...file, status: "Processing" }), 900 + i * 250);
    setTimeout(() => onUpdate({ ...file, status: "Ready" }), 2600 + i * 400);
  });
}

/** Re-queues a failed file for processing (simulated). */
export function retryProcessing(file: ProjectFile, onUpdate: (file: ProjectFile) => void) {
  onUpdate({ ...file, status: "Processing" });
  setTimeout(() => onUpdate({ ...file, status: "Ready" }), 1800);
}
