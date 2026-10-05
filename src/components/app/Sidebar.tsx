import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  FileStack,
  FolderKanban,
  LayoutList,
  LifeBuoy,
  ScanSearch,
  Search,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

import { BrandLockup } from "./BrandMark";

interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
}

const groups: { label?: string; items: NavItem[] }[] = [
  {
    items: [
      { label: "Overview", to: "/", icon: LayoutList },
      { label: "Projects", to: "/projects", icon: FolderKanban },
      { label: "All Files", to: "/files", icon: FileStack },
      { label: "Search", to: "/search", icon: Search },
    ],
  },
  { label: "Intelligence", items: [{ label: "AI Assistant", to: "/assistant", icon: ScanSearch }] },
  {
    label: "Organisation",
    items: [
      { label: "Team", to: "/team", icon: Users },
      { label: "Activity", to: "/activity", icon: Activity },
    ],
  },
];

const utility: NavItem[] = [
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "Help & Support", to: "/help", icon: LifeBuoy },
  { label: "Trash", to: "/trash", icon: Trash2 },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  const renderItem = ({ label, to, icon: Icon }: NavItem) => {
    const active = isActive(to);
    return (
      <Link
        key={to}
        to={to}
        aria-current={active ? "page" : undefined}
        className={`nav-link relative ${
          active
            ? "bg-navy-raised text-navy-foreground"
            : "text-navy-muted hover:bg-navy-raised/50 hover:text-navy-foreground"
        }`}
      >
        {active ? (
          <span aria-hidden className="absolute top-2 bottom-2 -left-3 w-[2px] bg-accent" />
        ) : null}
        <Icon className="size-[17px] shrink-0" strokeWidth={1.75} />
        <span className="truncate">{label}</span>
      </Link>
    );
  };

  return (
    <nav
      aria-label="Primary"
      className="flex h-full w-[232px] shrink-0 flex-col border-r border-navy-border bg-navy"
    >
      <Link to="/" className="flex h-[68px] items-center border-b border-navy-border px-4">
        <BrandLockup size={30} nameClass="text-[11.5px]" labelClass="text-[9px]" />
      </Link>

      <div className="flex-1 overflow-y-auto px-3 pt-4 pb-3">
        {groups.map((group, index) => (
          <div key={index} className={index > 0 ? "mt-6" : undefined}>
            {group.label ? (
              <p className="mb-1.5 px-2.5 text-[10px] font-semibold tracking-[0.14em] text-navy-muted/70 uppercase">
                {group.label}
              </p>
            ) : null}
            <div className="space-y-px">{group.items.map(renderItem)}</div>
          </div>
        ))}
      </div>

      <div className="space-y-px border-t border-navy-border px-3 py-3">{utility.map(renderItem)}</div>

      <div className="border-t border-navy-border px-5 py-3">
        <p className="text-[11px] text-navy-muted">Milind Awasarmol & Associates</p>
        <p className="text-[11px] text-navy-muted/60">Andheri East · Mumbai</p>
      </div>
    </nav>
  );
}
