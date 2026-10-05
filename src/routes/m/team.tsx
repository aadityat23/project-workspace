import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Mail, UserPlus } from "lucide-react";
import { useState } from "react";

import { KV, MobileHeader, Sheet } from "@/components/mobile/kit";
import { getProject, getProjects, getProjectMembers, getUsers } from "@/lib/api";
import { notify } from "@/lib/notify";
import type { User } from "@/lib/types";

export const Route = createFileRoute("/m/team")({
  head: () => ({
    meta: [
      { title: "Team — Milind Awasarmol & Associates Mobile" },
      { name: "description", content: "Company staff and consultants with project access." },
      { property: "og:title", content: "Team — Milind Awasarmol & Associates Mobile" },
      { property: "og:description", content: "Company staff and consultants with project access." },
    ],
  }),
  component: MobileTeam,
});

function MobileTeam() {
  const users = getUsers();
  const memberships = getProjects().flatMap((p) => getProjectMembers(p.id));
  const [sel, setSel] = useState<User | null>(null);
  const accessFor = (u: User) => memberships.filter((m) => m.email === u.email || m.name === u.name);

  return (
    <div className="pb-24">
      <MobileHeader title="Team" eyebrow={`${users.length} members · ${getProjects().length} projects`} back large />
      <div className="mt-4 border-y border-border bg-card">
        {users.map((u) => {
          const a = accessFor(u);
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => setSel(u)}
              className="flex min-h-[64px] w-full items-center gap-3 border-b border-border px-4 py-2.5 text-left last:border-b-0 active:bg-surface"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy text-[12.5px] font-semibold text-navy-foreground">
                {u.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14.5px] font-semibold">{u.name}</span>
                <span className="block truncate text-[12.5px] text-muted-foreground">
                  {u.role} · {a.length ? `${a.length} project${a.length > 1 ? "s" : ""}` : "Organisation"}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium">
                <span className="size-1.5 rounded-full bg-success" /> Active
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          );
        })}
      </div>
      <div className="pointer-events-none sticky bottom-0 px-4 pt-4 pb-4">
        <button type="button" onClick={() => notify.prototype("Add member")} className="btn btn-primary pointer-events-auto h-12 w-full text-[15px]">
          <UserPlus className="size-[18px]" /> Add Member
        </button>
      </div>

      <Sheet open={sel !== null} onClose={() => setSel(null)} title={sel?.name ?? ""}>
        {sel && (
          <>
            <KV rows={[["Role", sel.role], ["Email", sel.email], ["Status", "Active"]]} />
            <h3 className="text-overline border-t border-border px-4 pt-3 pb-1.5">Project access</h3>
            {accessFor(sel).length ? (
              accessFor(sel).map((m) => (
                <div key={m.id} className="flex min-h-[48px] items-center justify-between border-t border-border px-4 text-[14px]">
                  <span className="truncate">{getProject(m.projectId)?.name}</span>
                  <span className="font-mono text-[12px] text-muted-foreground">{m.access.toUpperCase()}</span>
                </div>
              ))
            ) : (
              <p className="px-4 pb-3 text-[13px] text-muted-foreground">Organisation-wide access.</p>
            )}
            <div className="p-3">
              <a href={`mailto:${sel.email}`} className="btn btn-secondary h-11 w-full">
                <Mail className="size-4" /> Email {sel.name.split(" ")[0]}
              </a>
            </div>
          </>
        )}
      </Sheet>
    </div>
  );
}
