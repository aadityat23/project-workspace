import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { FileTable } from "@/components/files/FileTable";
import { EmptyState, PageBody, PageHeader } from "@/components/kit/Page";
import { SearchInput, SelectInput } from "@/components/kit/SearchInput";
import { getAllFiles, getProject, getProjects } from "@/lib/api";

export const Route = createFileRoute("/files")({
  head: () => ({
    meta: [
      { title: "All Files — Milind Awasarmol & Associates" },
      {
        name: "description",
        content:
          "Cross-project file register with project, type, date and status filters for every stored document.",
      },
      { property: "og:title", content: "All Files — Milind Awasarmol & Associates" },
      {
        property: "og:description",
        content: "Cross-project file register with project, type, date and status filters.",
      },
    ],
  }),
  component: AllFiles,
});

function AllFiles() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [project, setProject] = useState("All projects");
  const [kind, setKind] = useState("All types");
  const [status, setStatus] = useState("All statuses");
  const [period, setPeriod] = useState("Any date");

  const projects = getProjects();

  const files = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff =
      period === "Last 7 days"
        ? Date.parse("2026-09-20T00:00:00+05:30")
        : period === "Last 30 days"
          ? Date.parse("2026-08-28T00:00:00+05:30")
          : 0;
    return getAllFiles().filter((file) => {
      const projectName = getProject(file.projectId)?.name ?? "";
      return (
        (!q || file.name.toLowerCase().includes(q)) &&
        (project === "All projects" || projectName === project) &&
        (kind === "All types" || file.kind === kind) &&
        (status === "All statuses" || file.status === status) &&
        (!cutoff || Date.parse(file.modifiedAt) >= cutoff)
      );
    });
  }, [query, project, kind, status, period]);

  return (
    <PageBody>
      <PageHeader title="All Files" subtitle={`${files.length} files across all projects`} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search file names"
          className="w-full max-w-[300px]"
        />
        <SelectInput
          value={project}
          onChange={setProject}
          ariaLabel="Filter by project"
          options={["All projects", ...projects.map((item) => item.name)]}
        />
        <SelectInput
          value={kind}
          onChange={setKind}
          ariaLabel="Filter by file type"
          options={["All types", "PDF", "DWG", "XLSX", "DOCX", "ZIP"]}
        />
        <SelectInput
          value={status}
          onChange={setStatus}
          ariaLabel="Filter by status"
          options={["All statuses", "Ready", "Processing", "Failed", "Superseded"]}
        />
        <SelectInput
          value={period}
          onChange={setPeriod}
          ariaLabel="Filter by date"
          options={["Any date", "Last 7 days", "Last 30 days"]}
        />
      </div>

      <div className="panel mt-4 overflow-hidden">
        {files.length === 0 ? (
          <EmptyState
            title="No files match these filters"
            description="Try a different project, file type or date range."
          />
        ) : (
          <FileTable
            files={files}
            showProjectColumn
            projectNameFor={(file) => getProject(file.projectId)?.name ?? "—"}
            onSelect={(file) =>
              void navigate({
                to: "/projects/$projectId/documents",
                params: { projectId: file.projectId },
                search: { file: file.id },
              })
            }
          />
        )}
      </div>
    </PageBody>
  );
}
