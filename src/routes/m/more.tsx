import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, HelpCircle, LogOut, Monitor, Settings, Trash2, Users } from "lucide-react";

import { MobileHeader, NavRow, navRowClass } from "@/components/mobile/kit";
import { getCurrentUser, getOrganisation, getTrash } from "@/lib/api";
import { signOut } from "@/lib/auth";

export const Route = createFileRoute("/m/more")({
  head: () => ({
    meta: [
      { title: "More — Milind Awasarmol & Associates Mobile" },
      { name: "description", content: "Profile, team, activity, settings, help and trash." },
      { property: "og:title", content: "More — Milind Awasarmol & Associates Mobile" },
      { property: "og:description", content: "Profile, team, activity, settings, help and trash." },
    ],
  }),
  component: More,
});

function More() {
  const user = getCurrentUser();
  const org = getOrganisation();
  const navigate = useNavigate();
  return (
    <div className="pb-6">
      <MobileHeader title="More" back />
      <Link to="/m/settings" className="flex items-center gap-3.5 border-b border-border bg-card px-4 py-4 active:bg-surface">
        <span className="flex size-12 items-center justify-center rounded-full bg-navy text-[15px] font-semibold text-navy-foreground">
          {user.initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-overline">My profile</span>
          <span className="block truncate text-[16px] font-semibold">{user.name}</span>
          <span className="block truncate text-[12.5px] text-muted-foreground">
            {user.role} · {org.name}
          </span>
        </span>
      </Link>
      <div className="mt-4 border-y border-border bg-card">
        <Link to="/m/team" className={navRowClass}><NavRow icon={Users} label="Team" /></Link>
        <Link to="/m/activity" search={{}} className={navRowClass}><NavRow icon={Activity} label="Activity" /></Link>
      </div>
      <div className="mt-4 border-y border-border bg-card">
        <Link to="/m/settings" className={navRowClass}><NavRow icon={Settings} label="Settings" /></Link>
        <Link to="/m/help" className={navRowClass}><NavRow icon={HelpCircle} label="Help & Support" /></Link>
        <Link to="/m/trash" className={navRowClass}><NavRow icon={Trash2} label="Trash" meta={getTrash().length} /></Link>
      </div>
      <div className="mt-4 border-y border-border bg-card">
        <Link to="/" className={navRowClass}><NavRow icon={Monitor} label="Open web workspace" /></Link>
        <button
          type="button"
          onClick={() => {
            signOut();
            void navigate({ to: "/m/login", replace: true });
          }}
          className="flex min-h-[52px] w-full items-center gap-3 px-4 text-left text-[15px] font-medium text-danger active:bg-surface"
        >
          <LogOut className="size-[18px]" /> Sign Out
        </button>
      </div>
      <p className="px-4 pt-4 font-mono text-[10.5px] tracking-[0.08em] text-muted-foreground">
        MILIND AWASARMOL & ASSOCIATES · MOBILE 1.0
      </p>
    </div>
  );
}
