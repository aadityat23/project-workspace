import { createFileRoute } from "@tanstack/react-router";

import { ActivityList } from "@/components/activity/ActivityList";
import { PageBody, PageHeader } from "@/components/kit/Page";
import { getActivity, getProject } from "@/lib/api";

export const Route = createFileRoute("/projects/$projectId/activity")({
  head: ({ params }) => {
    const project = getProject(params.projectId);
    const title = `Activity — ${project?.name ?? "Project"}`;
    const description = `Chronological record of uploads, revisions and folder changes for ${project?.name ?? "the project"}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProjectActivity,
});

function ProjectActivity() {
  const { projectId } = Route.useParams();
  const entries = getActivity(projectId);

  return (
    <PageBody>
      <PageHeader title="Activity" subtitle={`${entries.length} recorded events`} />
      <div className="panel mt-4 overflow-hidden">
        <ActivityList entries={entries} />
      </div>
    </PageBody>
  );
}
