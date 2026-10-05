// Domain types for the Milind Awasarmol & Associates platform.
// The mock service layer in src/lib/api.ts returns exactly these shapes, so a
// FastAPI backend can replace it without touching the UI.

export type ProjectStatus = "Active" | "On Hold" | "Completed" | "Planning";
export type FileStatus = "Uploading" | "Processing" | "Ready" | "Failed" | "Superseded";
export type Discipline =
  | "ARCHITECTURAL"
  | "STRUCTURAL"
  | "ELECTRICAL"
  | "PLUMBING"
  | "MEP"
  | "GENERAL";
export type FileKind = "PDF" | "DWG" | "XLSX" | "DOCX" | "JPG" | "PNG" | "ZIP";
export type AccessLevel = "Owner" | "Editor" | "Viewer";

export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  initials: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  location: string;
  client: string;
  category: string;
  status: ProjectStatus;
  fileCount: number;
  updatedAt: string;
  briefing: string;
  startedOn: string;
  manager: string;
  /** Primary cover/header image URL. Optional; UI falls back to a placeholder. */
  coverImage?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  name: string;
  role: string;
  email: string;
  access: AccessLevel;
  initials: string;
}

export interface Folder {
  id: string;
  projectId: string;
  name: string;
  parentId: string | null;
  fileCount: number;
}

export interface FileMetadata {
  uploadedBy: string;
  uploadedAt: string;
  discipline: Discipline;
  source: string;
  pages?: number;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  folderId: string;
  name: string;
  kind: FileKind;
  revision: string;
  sizeBytes: number;
  modifiedAt: string;
  status: FileStatus;
  metadata: FileMetadata;
}

export interface Drawing {
  id: string;
  projectId: string;
  number: string;
  name: string;
  discipline: Discipline;
  revision: string;
  status: "Current" | "Superseded" | "For Review";
  date: string;
  fileName: string;
}

export interface Photo {
  id: string;
  projectId: string;
  title: string;
  visit: string;
  capturedAt: string;
  url: string;
  uploadedBy: string;
}

export interface Activity {
  id: string;
  projectId: string | null;
  projectName?: string;
  actor: string;
  action: string;
  target: string;
  at: string;
  kind: "upload" | "folder" | "revision" | "photo" | "member" | "delete";
}

export interface DocumentPage {
  page: number;
  heading: string;
  body: string[];
}

export interface DocumentChunk {
  fileId: string;
  page: number;
  text: string;
}

export interface SearchResult {
  id: string;
  group: "PROJECTS" | "DOCUMENTS" | "DRAWINGS" | "PHOTOS";
  title: string;
  subtitle: string;
  projectId: string;
  href: string;
}

export interface SourceCitation {
  fileName: string;
  page: number;
  fileId: string;
}

export interface AIAnswer {
  question: string;
  answer: string;
  keyPoints?: string[];
  sources: SourceCitation[];
}

export interface TrashedFile {
  id: string;
  name: string;
  projectName: string;
  folder: string;
  originalLocation: string;
  deletedBy: string;
  deletedAt: string;
  sizeBytes: number;
}

export interface NewProjectInput {
  name: string;
  code: string;
  category: string;
  location: string;
  manager: string;
  status: ProjectStatus;
  /** Selected cover photo. The backend will persist it and return coverImage. */
  coverFile?: File | null;
}
