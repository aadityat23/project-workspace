import { signOut } from "@/lib/auth";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, Search } from "lucide-react";
import { useState } from "react";

import { getCurrentUser } from "@/lib/api";

export function Topbar({
  onOpenPalette,
  onToggleNav,
}: {
  onOpenPalette: () => void;
  onToggleNav: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = getCurrentUser();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const context = pathname.startsWith("/projects/") ? "Project workspace" : "Workspace";

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card px-4 lg:px-8">
      <button
        type="button"
        onClick={onToggleNav}
        className="btn btn-ghost size-8 px-0 lg:hidden"
        aria-label="Toggle navigation"
      >
        <Menu className="size-5" />
      </button>

      <button
        type="button"
        onClick={onOpenPalette}
        className="flex h-9 max-w-[520px] flex-1 items-center gap-2.5 border-b border-transparent px-1 text-left text-muted-foreground transition-colors duration-150 hover:border-border-strong hover:text-foreground"
      >
        <Search className="size-4" />
        <span className="flex-1 truncate text-[13.5px]">Search projects, documents, drawings, photos</span>
        <kbd className="text-code rounded-[3px] border border-border px-1.5 py-px text-[11px]">Ctrl K</kbd>
      </button>

      <span className="ml-auto hidden text-[10.5px] font-semibold tracking-[0.12em] text-muted-foreground uppercase md:inline">{context}</span>
      <span aria-hidden className="hidden h-5 w-px bg-border md:block" />

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-8 items-center gap-2 rounded-[6px] border border-transparent px-1.5 transition-colors duration-150 hover:border-border-strong hover:bg-surface"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-navy text-[10.5px] font-semibold text-navy-foreground">
            {user.initials}
          </span>
          <span className="text-label hidden sm:inline">{user.name}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>

        {menuOpen ? (
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setMenuOpen(false)}
            />
            <div
              role="menu"
              className="overlay-panel absolute right-0 z-20 mt-2 w-56 overflow-hidden py-1"
            >
              <div className="border-b border-border px-3 py-2">
                <p className="text-label">{user.name}</p>
                <p className="text-meta text-muted-foreground">{user.email}</p>
              </div>
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="text-body block px-3 py-2 hover:bg-surface"
              >
                My Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="text-body block px-3 py-2 hover:bg-surface"
              >
                Preferences
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="text-body block w-full border-t border-border px-3 py-2 text-left hover:bg-surface"
              >
                Sign out
              </button>
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}
