// Session-local state for the mobile client (captured photos). Replace with the
// shared API upload endpoint once the backend exists.
import { useSyncExternalStore } from "react";

import type { Photo } from "./types";

export type CapturedPhoto = Photo & { status: "Uploading" | "Processing" | "Ready" };

let captured: CapturedPhoto[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function upsertCaptured(photo: CapturedPhoto) {
  const i = captured.findIndex((p) => p.id === photo.id);
  captured = i === -1 ? [photo, ...captured] : captured.map((p) => (p.id === photo.id ? photo : p));
  emit();
}

export function useCapturedPhotos(projectId?: string) {
  const all = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => void listeners.delete(l);
    },
    () => captured,
    () => captured,
  );
  return projectId ? all.filter((p) => p.projectId === projectId) : all;
}
