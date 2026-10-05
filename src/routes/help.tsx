import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";

import { PageBody, PageHeader } from "@/components/kit/Page";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — Milind Awasarmol & Associates" },
      { name: "description", content: "How to work with projects, documents, search and the AI assistant." },
      { property: "og:title", content: "Help & Support — Milind Awasarmol & Associates" },
      { property: "og:description", content: "How to work with projects, documents, search and the AI assistant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Help,
});

const topics = [
  {
    title: "Getting Started",
    points: [
      "Your projects appear on Overview and Projects once you are added to the project team.",
      "Press Ctrl K anywhere to jump to a project, document or drawing.",
    ],
  },
  {
    title: "Projects",
    points: [
      "Each project has its own Documents, Drawings, Photos, Team and Activity.",
      "Project owners manage members and access levels from the Team tab.",
    ],
  },
  {
    title: "Documents",
    points: [
      "Upload files into a folder; a new file with the same drawing number becomes the next revision.",
      "Select any file to open the inspector with preview, details and activity.",
    ],
  },
  {
    title: "Search",
    points: [
      "Search looks inside file names and document text, including scanned PDFs.",
      "Filter results by project, document, drawing or photo.",
    ],
  },
  {
    title: "AI Assistant",
    points: [
      "Ask questions about a project in plain language.",
      "Every answer lists its source documents and page numbers. Check the source before acting on it.",
    ],
  },
];

function Help() {
  return (
    <PageBody>
      <PageHeader eyebrow="Support" title="Help & Support" subtitle="Short guides to the essentials." />
      <div className="grid grid-cols-1 gap-12 border-t border-border pt-2 lg:grid-cols-[1fr_300px]">
        <div>
          {topics.map((t, i) => (
            <div key={t.title} className="grid grid-cols-[48px_180px_1fr] gap-4 border-b border-border py-5">
              <span className="text-code pt-0.5 text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="text-label">{t.title}</h2>
              <ul className="space-y-2 text-[13.5px] text-muted-foreground">
                {t.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <aside className="pt-5">
          <p className="text-overline">Contact Support</p>
          <p className="mt-3 text-[13.5px] text-muted-foreground">
            The IT desk replies within one working day, Monday to Saturday, 9:30 to 18:30 IST.
          </p>
          <div className="mt-5 space-y-3 text-[13.5px]">
            <p className="flex items-center gap-2.5">
              <Mail className="size-4 text-muted-foreground" /> support@maa-consultant.com
            </p>
            <p className="flex items-center gap-2.5">
              <Phone className="size-4 text-muted-foreground" /> +91 22 4890 2210
            </p>
          </div>
          <a href="mailto:support@maa-consultant.com" className="btn btn-primary mt-6">
            Email Support
          </a>
        </aside>
      </div>
    </PageBody>
  );
}
