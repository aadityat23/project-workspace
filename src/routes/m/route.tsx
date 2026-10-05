import { Link, Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { FolderOpen, Home, Images, Layers, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { SplashLockup } from "@/components/app/BrandMark";
import { getSession, onSessionChange } from "@/lib/auth";

export const Route = createFileRoute("/m")({
  head: () => ({
    meta: [
      { title: "Milind Awasarmol & Associates — Mobile" },
      { name: "description", content: "Field companion to the Milind Awasarmol & Associates project workspace." },
      { property: "og:title", content: "Milind Awasarmol & Associates — Mobile" },
      { property: "og:description", content: "Projects, documents, drawings and site photos in the field." },
      { name: "theme-color", content: "#0B1E3D" },
    ],
  }),
  component: MobileShell,
});

const TABS = [
  { to: "/m", label: "Home", icon: Home, match: (p: string) => p === "/m" || p === "/m/" },
  { to: "/m/projects", label: "Projects", icon: Layers, match: (p: string) => p.startsWith("/m/projects") },
  { to: "/m/files", label: "Files", icon: FolderOpen, match: (p: string) => p.startsWith("/m/files") },
  { to: "/m/photos", label: "Photos", icon: Images, match: (p: string) => p.startsWith("/m/photos") },
  { to: "/m/search", label: "Search", icon: Search, match: (p: string) => p.startsWith("/m/search") },
] as const;

const FULLSCREEN = ["/m/login", "/m/file/", "/m/capture"];

function MobileShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    setAuthed(Boolean(getSession()));
    const off = onSessionChange(() => setAuthed(Boolean(getSession())));
    const t = setTimeout(() => setSplash(false), 1300);
    return () => {
      off();
      clearTimeout(t);
    };
  }, []);

  const isLogin = pathname === "/m/login";
  useEffect(() => {
    if (authed === null) return;
    if (!authed && !isLogin) void navigate({ to: "/m/login", replace: true });
    if (authed && isLogin) void navigate({ to: "/m", replace: true });
  }, [authed, isLogin, navigate]);

  const allowed = authed !== null && authed !== isLogin;
  const fullscreen = FULLSCREEN.some((p) => pathname.startsWith(p));

  return (
    <div className="min-h-dvh bg-surface sm:flex sm:items-center sm:justify-center sm:py-6">
      <div className="relative isolate flex h-dvh w-full flex-col overflow-hidden bg-background sm:h-[844px] sm:max-h-[calc(100dvh-48px)] sm:w-[390px] sm:rounded-[8px] sm:border sm:border-border-strong">
        {splash || !allowed ? (
          <MobileSplash />
        ) : (
          <>
            <main className="animate-entry min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
              <Outlet />
            </main>
            {!fullscreen && (
              <nav aria-label="Primary" className="grid shrink-0 grid-cols-5 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
                {TABS.map((t) => {
                  const active = t.match(pathname);
                  const Icon = t.icon;
                  return (
                    <Link
                      key={t.to}
                      to={t.to}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                        active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {active && <span aria-hidden className="absolute top-0 h-0.5 w-7 bg-accent" />}
                      <Icon className="size-5" strokeWidth={active ? 2 : 1.6} />
                      {t.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MobileSplash() {
  return (
    <div role="status" aria-label="Loading workspace" className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-navy">
      <SplashLockup compact />
    </div>
  );
}
