import { createFileRoute, Link } from "@tanstack/react-router";

import { ActivityList } from "@/components/activity/ActivityList";
import { AskBlock } from "@/components/ai/AskBlock";
import { DisciplineBadge, DrawingStatusBadge, RevisionBadge } from "@/components/kit/Badges";
import { FileKindIcon } from "@/components/files/FileTable";
import { PageBody, Section } from "@/components/kit/Page";
import {
  askProject,
  getActivity,
  getDrawings,
  getPhotos,
  getProject,
  getProjectBriefingCounts,
  getProjectFiles,
} from "@/lib/api";
import { relativeDay } from "@/lib/format";

export const Route = createFileRoute("/projects/$projectId/")({
  head: ({ params }) => {
    const project = getProject(params.projectId);
    const title = `${project?.name ?? "Project"} — Overview`;
    const description = project
      ? `${project.category} at ${project.location}. Documents, drawings, photos and activity for ${project.name}.`
      : "Project overview.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProjectOverview,
});

function ProjectOverview() {
  const { projectId } = Route.useParams();
  const project = getProject(projectId);
  const counts = getProjectBriefingCounts(projectId);
  const files = getProjectFiles(projectId).slice(0, 5);
  const drawings = getDrawings(projectId).filter((d) => d.status !== "Superseded").slice(0, 4);
  const photos = getPhotos(projectId).slice(0, 4);
  const activity = getActivity(projectId).slice(0, 5);

  if (!project) return null;

  return (
    <PageBody>
      <section className="panel">
        <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
          <h2 className="text-section">Project Briefing</h2>
          <span className="text-meta text-muted-foreground">Managed by {project.manager}</span>
        </header>
        <p className="text-body border-b border-border px-4 py-3 text-muted-foreground">
          {project.briefing}
        </p>
        <div className="flex flex-wrap divide-x divide-border">
          {[
            ["Documents", counts.documents],
            ["Drawings", counts.drawings],
            ["Photos", counts.photos],
            ["Processing", counts.processing],
            ["Revised files", counts.revised],
          ].map(([label, value]) => (
            <div key={label as string} className="min-w-[132px] flex-1 px-4 py-3">
              <p className="text-overline">{label as string}</p>
              <p className="tabular mt-1 text-[20px] leading-none font-semibold">
                {value as number}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Section
            title="Recent Documents"
            action={
              <Link
                to="/projects/$projectId/documents"
                params={{ projectId }}
                className="text-meta text-primary hover:underline"
              >
                Open Documents
              </Link>
            }
          >
            <ul className="divide-y divide-border">
              {files.map((file) => (
                <li key={file.id} className="flex items-center gap-3 px-4 py-2.5">
                  <FileKindIcon kind={file.kind} />
                  <Link
                    to="/projects/$projectId/documents"
                    params={{ projectId }}
                    search={{ file: file.id }}
                    className="min-w-0 flex-1 truncate font-medium hover:text-primary"
                  >
                    {file.name}
                  </Link>
                  <RevisionBadge
                    revision={file.revision}
                    current={file.status !== "Superseded"}
                  />
                  <span className="text-meta tabular w-20 text-right text-muted-foreground">
                    {relativeDay(file.modifiedAt)}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            title="Latest Drawings"
            action={
              <Link
                to="/projects/$projectId/drawings"
                params={{ projectId }}
                className="text-meta text-primary hover:underline"
              >
                Drawing register
              </Link>
            }
          >
            <ul className="divide-y divide-border">
              {drawings.map((drawing) => (
                <li key={drawing.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-label tabular w-[84px] shrink-0">{drawing.number}</span>
                  <span className="min-w-0 flex-1 truncate">{drawing.name}</span>
                  <DisciplineBadge discipline={drawing.discipline} />
                  <RevisionBadge revision={drawing.revision} current={drawing.status === "Current"} />
                  <DrawingStatusBadge status={drawing.status} />
                </li>
              ))}
            </ul>
          </Section>

          <AskBlock onAsk={(question) => askProject(projectId, question)} />
        </div>

        <div className="space-y-6">
          <Section
            title="Photos"
            action={
              <Link
                to="/projects/$projectId/photos"
                params={{ projectId }}
                className="text-meta text-primary hover:underline"
              >
                All photos
              </Link>
            }
          >
            <div className="grid grid-cols-2 gap-2 p-3">
              {photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.url}
                  alt={photo.title}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="aspect-[4/3] w-full rounded-[4px] border border-border object-cover"
                />
              ))}
            </div>
          </Section>

          <Section
            title="Recent Activity"
            action={
              <Link
                to="/projects/$projectId/activity"
                params={{ projectId }}
                className="text-meta text-primary hover:underline"
              >
                Full log
              </Link>
            }
          >
            <ActivityList entries={activity} />
          </Section>
        </div>
      </div>
    </PageBody>
  );
}
