import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { DisciplineBadge, DrawingStatusBadge, RevisionBadge } from "@/components/kit/Badges";
import { EmptyState, PageBody, PageHeader } from "@/components/kit/Page";
import { SearchInput, SelectInput } from "@/components/kit/SearchInput";
import { getDrawings, getProject } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/projects/$projectId/drawings")({
  head: ({ params }) => {
    const project = getProject(params.projectId);
    const title = `Drawings — ${project?.name ?? "Project"}`;
    const description = `Drawing register with numbers, disciplines, revisions and current status for ${project?.name ?? "the project"}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: Drawings,
});

function Drawings() {
  const { projectId } = Route.useParams();
  const [query, setQuery] = useState("");
  const [discipline, setDiscipline] = useState("All disciplines");
  const [scope, setScope] = useState("Current only");

  const drawings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return getDrawings(projectId).filter((drawing) => {
      const matchesQuery =
        !q || `${drawing.number} ${drawing.name} ${drawing.fileName}`.toLowerCase().includes(q);
      const matchesDiscipline =
        discipline === "All disciplines" || drawing.discipline === discipline;
      const matchesScope = scope === "Current and superseded" || drawing.status !== "Superseded";
      return matchesQuery && matchesDiscipline && matchesScope;
    });
  }, [projectId, query, discipline, scope]);

  return (
    <PageBody>
      <PageHeader
        eyebrow="Register"
        title="Drawings"
        subtitle={`${getDrawings(projectId).length} drawings · ${getDrawings(projectId).filter((d) => d.status === "Current").length} current revisions · ${drawings.length} shown`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search drawing number or name"
          className="w-full max-w-[300px]"
        />
        <SelectInput
          value={discipline}
          onChange={setDiscipline}
          ariaLabel="Filter by discipline"
          options={[
            "All disciplines",
            "ARCHITECTURAL",
            "STRUCTURAL",
            "ELECTRICAL",
            "PLUMBING",
            "MEP",
          ]}
        />
        <SelectInput
          value={scope}
          onChange={setScope}
          ariaLabel="Revision scope"
          options={["Current only", "Current and superseded"]}
        />
      </div>

      <div className="mt-4 overflow-hidden border-t border-foreground/80">
        {drawings.length === 0 ? (
          <EmptyState
            title="No drawings match this filter"
            description="Clear the discipline filter or include superseded revisions."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col" className="w-[124px]">
                    Drawing Number
                  </th>
                  <th scope="col" className="min-w-[260px]">
                    Drawing Name
                  </th>
                  <th scope="col" className="w-[152px]">
                    Discipline
                  </th>
                  <th scope="col" className="w-[92px]">
                    Revision
                  </th>
                  <th scope="col" className="w-[124px]">
                    Status
                  </th>
                  <th scope="col" className="w-[116px]">
                    Date
                  </th>
                  <th scope="col" className="min-w-[220px]">
                    File
                  </th>
                </tr>
              </thead>
              <tbody>
                {drawings.map((drawing) => (
                  <tr key={drawing.id} className={drawing.status === "Superseded" ? "opacity-70" : ""}>
                    <td>
                      <span className={`inline-block border-l-2 pl-2.5 font-mono text-[14px] font-medium tracking-[0.02em] ${drawing.status === "Current" ? "border-accent" : "border-border"}`}>
                        {drawing.number}
                      </span>
                    </td>
                    <td className="font-medium">{drawing.name}</td>
                    <td>
                      <DisciplineBadge discipline={drawing.discipline} />
                    </td>
                    <td>
                      <RevisionBadge
                        revision={drawing.revision}
                        current={drawing.status === "Current"}
                      />
                    </td>
                    <td>
                      <DrawingStatusBadge status={drawing.status} />
                    </td>
                    <td className="text-code text-muted-foreground">{formatDate(drawing.date)}</td>
                    <td className="text-muted-foreground">
                      <span className="text-code block truncate text-[12px]">{drawing.fileName}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageBody>
  );
}
