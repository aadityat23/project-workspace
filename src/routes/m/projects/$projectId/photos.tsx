import { Link, createFileRoute } from "@tanstack/react-router";
import { Camera } from "lucide-react";

import { MobileGallery } from "@/components/mobile/MobileGallery";
import { MobileHeader, StateBlock } from "@/components/mobile/kit";
import { getPhotos, getProject } from "@/lib/api";
import { useCapturedPhotos } from "@/lib/mobile-store";

export const Route = createFileRoute("/m/projects/$projectId/photos")({
  head: ({ params }) => {
    const t = `Photos · ${getProject(params.projectId)?.name ?? "Project"} — Mobile`;
    return {
      meta: [
        { title: t },
        { name: "description", content: "Site photos grouped by visit." },
        { property: "og:title", content: t },
        { property: "og:description", content: "Site photos grouped by visit." },
      ],
    };
  },
  component: ProjectPhotos,
});

function ProjectPhotos() {
  const { projectId } = Route.useParams();
  const project = getProject(projectId);
  const captured = useCapturedPhotos(projectId);
  const photos = [...captured, ...getPhotos(projectId)];

  return (
    <div className="relative pb-24">
      <MobileHeader title="Photos" eyebrow={project?.name} back large />
      <p className="px-4 pt-3 pb-1 font-mono text-[11px] tracking-[0.06em] text-muted-foreground">
        {photos.length} PHOTOS · {new Set(photos.map((p) => p.visit + p.capturedAt.slice(0, 10))).size} SITE VISITS
      </p>
      {photos.length ? (
        <MobileGallery photos={photos} />
      ) : (
        <StateBlock kind="empty" title="No site photos yet" body="Take the first progress photo for this project." />
      )}
      <div className="pointer-events-none sticky bottom-0 px-4 pb-4">
        <Link
          to="/m/capture"
          search={{ project: projectId }}
          className="btn btn-primary pointer-events-auto h-12 w-full text-[15px]"
        >
          <Camera className="size-[18px]" /> Take photo
        </Link>
      </div>
    </div>
  );
}
