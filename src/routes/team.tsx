import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { useState } from "react";

import { Field, Modal } from "@/components/kit/Modal";
import { notify } from "@/lib/notify";
import { getProjectMembers, getProjects, getUsers } from "@/lib/api";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team — Milind Awasarmol & Associates" },
      {
        name: "description",
        content:
          "Organisation directory of engineers, architects, consultants and managers with workspace access.",
      },
      { property: "og:title", content: "Team — Milind Awasarmol & Associates" },
      {
        property: "og:description",
        content: "Organisation directory with roles and workspace access.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Team,
});

function Team() {
  const users = getUsers();
  const projects = getProjects();
  const members = projects.flatMap((p) => getProjectMembers(p.id).map((m) => ({ ...m, code: p.code })));
  const [addOpen, setAddOpen] = useState(false);

  const rows = users.map((u, i) => {
    const on = members.filter((m) => m.email === u.email || m.name === u.name);
    const access = i === 0 ? "Owner" : on[0]?.access ?? (u.email.endsWith("maa-consultant.com") ? "Editor" : "Viewer");
    return { u, codes: [...new Set(on.map((m) => m.code))], access: String(access), internal: u.email.endsWith("maa-consultant.com") };
  });
  const internal = rows.filter((r) => r.internal);
  const external = rows.filter((r) => !r.internal);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-8 pt-7 pb-14">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-5">
        <div>
          <p className="text-overline">Organisation · Milind Awasarmol & Associates</p>
          <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.015em]">
            Team
            <span className="ml-3 font-normal text-muted-foreground">
              {users.length} members · {projects.length} projects
            </span>
          </h1>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setAddOpen(true)}>
          <UserPlus className="size-4" />
          Add Member
        </button>
      </div>

      {[["Milind Awasarmol & Associates staff", internal], ["Consultants and partners", external]].map(([title, list]) =>
        (list as typeof rows).length ? (
          <section key={title as string} className="mt-6">
            <header className="flex h-9 items-center justify-between border-b border-foreground/80">
              <h2 className="text-[11px] font-semibold tracking-[0.12em] uppercase">{title as string}</h2>
              <span className="font-mono text-[11.5px] text-muted-foreground">{(list as typeof rows).length}</span>
            </header>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="min-w-[240px]">Name</th>
                    <th className="min-w-[200px]">Role</th>
                    <th className="min-w-[200px]">Project / Access</th>
                    <th className="min-w-[260px]">Email</th>
                    <th className="w-[110px]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(list as typeof rows).map(({ u, codes, access }) => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 items-center justify-center rounded-[4px] bg-navy text-[11px] font-semibold text-navy-foreground">
                            {u.initials}
                          </span>
                          <span className="font-semibold">{u.name}</span>
                        </div>
                      </td>
                      <td>{u.role}</td>
                      <td>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="badge">{access}</span>
                          {codes.length ? (
                            codes.map((c) => (
                              <span key={c} className="text-code text-[11.5px] text-muted-foreground">{c}</span>
                            ))
                          ) : (
                            <span className="text-[12px] text-muted-foreground">All projects</span>
                          )}
                        </div>
                      </td>
                      <td className="text-code text-muted-foreground">{u.email}</td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 text-[12.5px]">
                          <span className="size-1.5 rounded-full bg-success" /> Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null,
      )}

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
            <button type="button" className="btn btn-primary" onClick={() => { notify.prototype("Add member"); setAddOpen(false); }}>
              Add member
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Full name">
            <input className="field" placeholder="e.g. Milind Awasarmol" />
          </Field>
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
    </div>
  );
}
