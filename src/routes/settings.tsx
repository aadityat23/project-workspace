import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Field } from "@/components/kit/Modal";
import { PageBody, PageHeader } from "@/components/kit/Page";
import { getCurrentUser, getOrganisation } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Milind Awasarmol & Associates" },
      { name: "description", content: "Company details, profile and workspace preferences." },
      { property: "og:title", content: "Settings — Milind Awasarmol & Associates" },
      { property: "og:description", content: "Company details, profile and workspace preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

const sections = ["Company", "My Profile", "Preferences"] as const;
type SectionName = (typeof sections)[number];

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[220px_1fr] gap-8 border-b border-border py-5 last:border-0">
      <div>
        <p className="text-label">{label}</p>
        {hint ? <p className="mt-1 text-[12.5px] text-muted-foreground">{hint}</p> : null}
      </div>
      <div className="max-w-[440px] space-y-4">{children}</div>
    </div>
  );
}

function Settings() {
  const [active, setActive] = useState<SectionName>("Company");
  const [saved, setSaved] = useState(false);
  const org = getOrganisation();
  const user = getCurrentUser();

  return (
    <PageBody>
      <PageHeader eyebrow="Workspace" title="Settings" />
      <div className="grid grid-cols-[180px_1fr] gap-12 border-t border-border pt-6">
        <nav aria-label="Settings sections" className="space-y-px">
          {sections.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setActive(s);
                setSaved(false);
              }}
              className={`nav-link w-full ${
                active === s
                  ? "bg-surface text-foreground shadow-[inset_2px_0_0_var(--color-foreground)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </nav>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
          }}
        >
          <h2 className="text-section">{active}</h2>
          <div className="mt-2">
            {active === "Company" ? (
              <>
                <Row label="Legal entity" hint="Shown on exported registers and transmittals.">
                  <Field label="Company name">
                    <input className="field" defaultValue={`${org.name} Pvt. Ltd.`} />
                  </Field>
                  <Field label="GSTIN">
                    <input className="field font-mono" defaultValue={org.gstin} />
                  </Field>
                </Row>
                <Row label="Registered office">
                  <Field label="Address">
                    <input className="field" defaultValue={org.office} />
                  </Field>
                  <Field label="Phone">
                    <input className="field" defaultValue={org.phone} />
                  </Field>
                </Row>
              </>
            ) : null}
            {active === "My Profile" ? (
              <>
                <Row label="Identity">
                  <Field label="Full name">
                    <input className="field" defaultValue={user.name} />
                  </Field>
                  <Field label="Role">
                    <input className="field" defaultValue={user.role} />
                  </Field>
                </Row>
                <Row label="Sign-in" hint="Used for notifications and sign-in.">
                  <Field label="Email">
                    <input className="field" type="email" defaultValue={user.email} />
                  </Field>
                  <button type="button" className="btn btn-secondary">
                    Change password
                  </button>
                </Row>
              </>
            ) : null}
            {active === "Preferences" ? (
              <>
                <Row label="Regional">
                  <Field label="Date format">
                    <select className="field" defaultValue="dmy">
                      <option value="dmy">27 Sep 2026</option>
                      <option value="iso">2026-09-27</option>
                    </select>
                  </Field>
                  <Field label="Time zone">
                    <select className="field" defaultValue="ist">
                      <option value="ist">India Standard Time (UTC+5:30)</option>
                    </select>
                  </Field>
                </Row>
                <Row label="Notifications" hint="Email summaries of document changes.">
                  {["New revisions on my projects", "Files shared with me", "Weekly activity digest"].map(
                    (label, i) => (
                      <label key={label} className="flex items-center gap-2.5 text-[13.5px]">
                        <input type="checkbox" defaultChecked={i < 2} className="size-3.5 accent-[var(--primary)]" />
                        {label}
                      </label>
                    ),
                  )}
                </Row>
              </>
            ) : null}
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-border pt-5">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
            <button type="reset" className="btn btn-ghost" onClick={() => setSaved(false)}>
              Discard
            </button>
            {saved ? <span className="ml-2 text-[12.5px] text-muted-foreground">Changes saved</span> : null}
          </div>
        </form>
      </div>
    </PageBody>
  );
}
