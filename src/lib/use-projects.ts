import { useSyncExternalStore } from "react";

import { getProjectsVersion, subscribeProjects } from "./api";

/** Re-renders the caller whenever projects are created or deleted. */
export function useProjectsVersion() {
  return useSyncExternalStore(subscribeProjects, getProjectsVersion, () => 0);
}
