import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { useState } from "react";

import { Field, Modal } from "@/components/kit/Modal";
import { PageBody, PageHeader } from "@/components/kit/Page";
import { getProject, getProjectMembers } from "@/lib/api";

export const Route = createFileRoute("/projects/$projectId/team")({
  head: ({ params }) => {
    const project = getProject(params.projectId);
    const title = `Team — ${project?.name ?? "Project"}`;
    const description = `Project team directory and access levels for ${project?.name ?? "the project"}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProjectTeam,
});

function ProjectTeam() {
  const { projectId } = Route.useParams();
  const members = getProjectMembers(projectId);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <PageBody>
      <PageHeader
        title="Project Team"
        subtitle={`${members.length} member${members.length === 1 ? "" : "s"} with access`}
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setAddOpen(true)}>
            <UserPlus className="size-4" />
            Add Member
          </button>
        }
      />

      <div className="panel mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col" className="min-w-[220px]">
                  Name
                </th>
                <th scope="col" className="min-w-[200px]">
                  Role
                </th>
                <th scope="col" className="min-w-[260px]">
                  Email
                </th>
                <th scope="col" className="w-[120px]">
                  Access
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-[4px] border border-border bg-surface text-[11px] font-semibold text-muted-foreground">
                        {member.initials}
                      </span>
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{member.role}</td>
                  <td className="text-muted-foreground">{member.email}</td>
                  <td>
                    <span className="badge">{member.access}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add member"
        width="sm"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setAddOpen(false)}>
              Add member
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Email address">
            <input className="field" placeholder="name@maa-consultant.com" />
          </Field>
          <Field label="Access level">
            <select className="field w-full" defaultValue="Editor">
              <option>Owner</option>
              <option>Editor</option>
              <option>Viewer</option>
            </select>
          </Field>
        </div>
      </Modal>
    </PageBody>
  );
}
