import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { FileRow, MSection, ProjectRecord } from "@/components/mobile/kit";
import { MobileActivity } from "@/components/mobile/MobileActivity";
import { ProfileButton } from "@/components/mobile/ProfileButton";
import { getActivity, getAllFiles, getCurrentUser, getProject, getProjects } from "@/lib/api";

export const Route = createFileRoute("/m/")({
  head: () => ({
    meta: [
      { title: "Home — Milind Awasarmol & Associates Mobile" },
      { name: "description", content: "Active projects, recent documents and site activity." },
      { property: "og:title", content: "Home — Milind Awasarmol & Associates Mobile" },
      { property: "og:description", content: "Active projects, recent documents and site activity." },
    ],
  }),
  component: MobileHome,
});

function MobileHome() {
  const user = getCurrentUser();
  const [greeting, setGreeting] = useState("Welcome");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);
  const active = getProjects().filter((p) => p.status === "Active");
  const recent = [...getAllFiles()].sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt)).slice(0, 4);
  const lead = active[0];

  return (
    <div className="pb-6">
      <header className="bg-navy px-4 pt-2 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span aria-hidden className="flex size-6 items-end bg-accent p-[4px]">
              <span className="block size-2 bg-navy" />
            </span>
            <span className="text-[12px] font-semibold tracking-[0.16em] text-navy-foreground">MILIND AWASARMOL & ASSOCIATES</span>
          </div>
          <ProfileButton />
        </div>
        <h1 className="mt-2 text-[21px] font-semibold tracking-[-0.01em] text-navy-foreground">
          {greeting}, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-0.5 font-mono text-[11.5px] text-navy-muted">
          MUMBAI · {active.length} ACTIVE PROJECTS
        </p>
      </header>

      <section className="pt-5">
        <h2 className="text-overline px-4 pb-2">Active projects</h2>
        <div className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4">
          {active.map((p) => (
            <div key={p.id} className="w-[86%] shrink-0 snap-start">
              <ProjectRecord project={p} large />
            </div>
          ))}
        </div>
      </section>

      <MSection
        title="Recent documents"
        action={<Link to="/m/files" className="text-[13px] font-medium text-primary">All files</Link>}
      >
        {recent.map((f) => (
          <FileRow key={f.id} file={f} project={getProject(f.projectId)?.name} />
        ))}
      </MSection>

      {lead && (
        <section className="px-4 pt-5">
          <Link
            to="/m/projects/$projectId/ask"
            params={{ projectId: lead.id }}
            className="flex min-h-[60px] items-center gap-3 rounded-[6px] border border-border bg-card px-3.5 py-3 active:bg-surface"
          >
            <Sparkles className="size-[18px] shrink-0 text-primary" strokeWidth={1.75} />
            <span className="min-w-0 flex-1">
              <span className="block text-overline">Ask this project</span>
              <span className="block truncate text-[14.5px] font-medium">{lead.name}</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </section>
      )}

      <MSection
        title="Recent activity"
        action={<Link to="/m/activity" search={{}} className="text-[13px] font-medium text-primary">View all</Link>}
      >
        <MobileActivity items={getActivity().slice(0, 5)} />
      </MSection>
    </div>
  );
}
