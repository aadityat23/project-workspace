import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";

import { EmptyState, PageBody } from "@/components/kit/Page";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { getProject } from "@/lib/api";

export const Route = createFileRoute("/projects/$projectId")({
  component: ProjectWorkspace,
});

function ProjectWorkspace() {
  const { projectId } = Route.useParams();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const project = getProject(projectId);

  if (!project) {
    return (
      <PageBody>
        <h1 className="sr-only">Project not found</h1>
        <EmptyState
          title="Project not found"
          description="This project may have been archived or the link is out of date."
          action={<Link to="/projects" className="btn btn-secondary">Open Projects</Link>}
        />
      </PageBody>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ProjectHeader project={project} pathname={pathname} />
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
