import { createFileRoute } from "@tanstack/react-router";

import { MobileAsk } from "@/components/mobile/MobileAsk";
import { MobileHeader } from "@/components/mobile/kit";
import { askProject, getProject } from "@/lib/api";

export const Route = createFileRoute("/m/projects/$projectId/ask")({
  head: ({ params }) => {
    const t = `Ask · ${getProject(params.projectId)?.name ?? "Project"} — Mobile`;
    return {
      meta: [
        { title: t },
        { name: "description", content: "Ask questions answered from this project's documents, with sources." },
        { property: "og:title", content: t },
        { property: "og:description", content: "Project questions answered from indexed documents." },
      ],
    };
  },
  component: MobileProjectAsk,
});

const SUGGESTIONS = [
  "Latest structural revision?",
  "What changed recently?",
  "Find foundation documents.",
  "Summarize the project documentation.",
];

function MobileProjectAsk() {
  const { projectId } = Route.useParams();
  const project = getProject(projectId);
  return (
    <div className="pb-6">
      <MobileHeader title={project?.name ?? "Project"} eyebrow="Ask about" back large />
      <MobileAsk
        suggestions={SUGGESTIONS}
        placeholder="What do you want to know?"
        ask={(q) => askProject(projectId, q)}
      />
    </div>
  );
}
