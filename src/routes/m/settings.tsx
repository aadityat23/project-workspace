import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { MobileHeader } from "@/components/mobile/kit";
import { getCurrentUser, getOrganisation } from "@/lib/api";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/m/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Milind Awasarmol & Associates Mobile" },
      { name: "description", content: "Company, profile and preference settings." },
      { property: "og:title", content: "Settings — Milind Awasarmol & Associates Mobile" },
      { property: "og:description", content: "Company, profile and preference settings." },
    ],
  }),
  component: MobileSettings,
});

function Field({ label, value, onChange, readOnly }: { label: string; value: string; onChange?: (v: string) => void; readOnly?: boolean }) {
  return (
    <label className="block border-b border-border px-4 py-2.5 last:border-b-0">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <input
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        className={`mt-0.5 block h-8 w-full bg-transparent text-[15px] outline-none ${readOnly ? "text-muted-foreground" : ""}`}
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-[52px] items-center justify-between gap-3 border-b border-border px-4 last:border-b-0">
      <span className="text-[15px]">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5 accent-[var(--color-primary)]" />
    </label>
  );
}

function MobileSettings() {
  const org = getOrganisation();
  const user = getCurrentUser();
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [n, setN] = useState({ uploads: true, revisions: true, photos: false });
  const [wifi, setWifi] = useState(true);
  const [dirty, setDirty] = useState(false);
  const d = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setDirty(true);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        <MobileHeader title="Settings" back large />
        {(
          [
            [
              "Company",
              <>
                <Field label="Legal name" value={org.name} readOnly />
                <Field label="GSTIN" value={org.gstin} readOnly />
                <Field label="Registered office" value={org.office} readOnly />
              </>,
            ],
            [
              "My profile",
              <>
                <Field label="Full name" value={name} onChange={d(setName)} />
                <Field label="Role" value={role} onChange={d(setRole)} />
                <Field label="Email" value={user.email} readOnly />
              </>,
            ],
            [
              "Preferences",
              <>
                <Toggle label="Notify on uploads" checked={n.uploads} onChange={d((v: boolean) => setN({ ...n, uploads: v }))} />
                <Toggle label="Notify on new revisions" checked={n.revisions} onChange={d((v: boolean) => setN({ ...n, revisions: v }))} />
                <Toggle label="Notify on site photos" checked={n.photos} onChange={d((v: boolean) => setN({ ...n, photos: v }))} />
                <Toggle label="Upload photos on Wi-Fi only" checked={wifi} onChange={d(setWifi)} />
              </>,
            ],
          ] as const
        ).map(([title, body]) => (
          <section key={title} className="pt-5">
            <h2 className="text-overline px-4 pb-2">{title}</h2>
            <div className="border-y border-border bg-card">{body}</div>
          </section>
        ))}
      </div>
      <div className="shrink-0 border-t border-border bg-card p-3">
        <button
          type="button"
          disabled={!dirty}
          onClick={() => {
            setDirty(false);
            notify.success("Settings saved");
          }}
          className="btn btn-primary h-12 w-full text-[15px]"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
