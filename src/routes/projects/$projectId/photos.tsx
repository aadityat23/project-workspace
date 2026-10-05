import { createFileRoute } from "@tanstack/react-router";
import { Upload } from "lucide-react";

import { notify } from "@/lib/notify";

import { PhotoGrid } from "@/components/media/PhotoGrid";
import { EmptyState, PageBody, PageHeader } from "@/components/kit/Page";
import { getPhotos, getProject } from "@/lib/api";

export const Route = createFileRoute("/projects/$projectId/photos")({
  head: ({ params }) => {
    const project = getProject(params.projectId);
    const title = `Photos — ${project?.name ?? "Project"}`;
    const description = `Site photography grouped by site visit for ${project?.name ?? "the project"}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: Photos,
});

function Photos() {
  const { projectId } = Route.useParams();
  const photos = getPhotos(projectId);

  return (
    <PageBody>
      <PageHeader
        title="Photos"
        subtitle={`${photos.length} photo${photos.length === 1 ? "" : "s"} across site visits`}
        actions={
          <button type="button" className="btn btn-primary" onClick={() => notify.prototype("Upload site photos")}>
            <Upload className="size-4" />
            Upload Photos
          </button>
        }
      />
      <div className="mt-6">
        {photos.length === 0 ? (
          <div className="panel">
            <EmptyState
              title="No site photos yet"
              description="Upload photographs from a site visit to build the visual record."
            />
          </div>
        ) : (
          <PhotoGrid photos={photos} />
        )}
      </div>
    </PageBody>
  );
}
