import { Link, createFileRoute } from "@tanstack/react-router";

import { FileRow, MobileHeader } from "@/components/mobile/kit";
import { ProfileButton } from "@/components/mobile/ProfileButton";
import { getAllFiles, getProjects } from "@/lib/api";

export const Route = createFileRoute("/m/files")({
  head: () => ({
    meta: [
      { title: "Files — Milind Awasarmol & Associates Mobile" },
      { name: "description", content: "Recent files across every project." },
      { property: "og:title", content: "Files — Milind Awasarmol & Associates Mobile" },
      { property: "og:description", content: "Recent files across every project." },
    ],
  }),
  component: MobileFiles,
});

function MobileFiles() {
  const files = getAllFiles();
  return (
    <div className="pb-6">
      <MobileHeader title="Files" eyebrow={`${files.length} files · all projects`} large right={<ProfileButton />} />
      {getProjects().map((p) => {
        const list = files
          .filter((f) => f.projectId === p.id)
          .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
          .slice(0, 4);
        if (!list.length) return null;
        return (
          <section key={p.id} className="pt-5">
            <div className="flex items-end justify-between px-4 pb-2">
              <h2 className="text-overline">{p.name}</h2>
              <Link to="/m/projects/$projectId/documents" params={{ projectId: p.id }} className="text-[13px] font-medium text-primary">
                Folders
              </Link>
            </div>
            <div className="border-y border-border bg-card">
              {list.map((f) => (
                <FileRow key={f.id} file={f} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
