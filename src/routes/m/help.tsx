import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Mail, Phone } from "lucide-react";

import { MobileHeader } from "@/components/mobile/kit";
import { getOrganisation } from "@/lib/api";

export const Route = createFileRoute("/m/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — Milind Awasarmol & Associates Mobile" },
      { name: "description", content: "How to use the mobile workspace, and how to reach support." },
      { property: "og:title", content: "Help & Support — Milind Awasarmol & Associates Mobile" },
      { property: "og:description", content: "How to use the mobile workspace." },
    ],
  }),
  component: MobileHelp,
});

const TOPICS = [
  ["Getting Started", "Sign in with your company email. Home shows active projects, recent documents and site activity. Use the bottom bar to move between Projects, Files, Photos and Search."],
  ["Projects", "Open a project to see its documents, drawings and photos. Activity and Team are one tap below the main sections."],
  ["Documents", "Folders follow the web workspace. Tap any file for the full-screen viewer; open Details for revision, discipline and status. Failed files can be retried from the folder."],
  ["Search", "Search matches project names, file names, drawing numbers and site visits. Filter results by type and tap to open."],
  ["AI Assistant", "Use “Ask this project” or “Ask about this document”. Answers come only from indexed documents and always list tappable sources."],
] as const;

function MobileHelp() {
  const org = getOrganisation();
  return (
    <div className="pb-6">
      <MobileHeader title="Help & Support" back large />
      <div className="mt-4 border-y border-border bg-card">
        {TOPICS.map(([t, body], i) => (
          <details key={t} className="group border-b border-border last:border-b-0">
            <summary className="flex min-h-[52px] cursor-pointer list-none items-center gap-3 px-4">
              <span className="font-mono text-[12px] text-muted-foreground">0{i + 1}</span>
              <span className="flex-1 text-[15px] font-medium">{t}</span>
              <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-4 pb-4 pl-11 text-[14px] leading-[1.55] text-muted-foreground">{body}</p>
          </details>
        ))}
      </div>
      <section className="pt-5">
        <h2 className="text-overline px-4 pb-2">Contact support</h2>
        <div className="border-y border-border bg-card">
          <a href="mailto:support@maa-consultant.com" className="flex min-h-[52px] items-center gap-3 border-b border-border px-4 text-[15px]">
            <Mail className="size-[18px] text-primary" /> support@maa-consultant.com
          </a>
          <a href={`tel:${org.phone.replace(/\s/g, "")}`} className="flex min-h-[52px] items-center gap-3 px-4 text-[15px]">
            <Phone className="size-[18px] text-primary" /> {org.phone}
          </a>
        </div>
      </section>
    </div>
  );
}
