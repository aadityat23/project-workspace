import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { getSession, onSessionChange } from "@/lib/auth";

import { SplashLockup } from "./BrandMark";

const PUBLIC = new Set(["/login"]);
const SPLASH_MS = 1400;

/**
 * Entry flow: Splash → session check → Workspace (signed in) or Login (signed out).
 * Nothing from the workspace renders until the check has resolved.
 */
export function EntryGate({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [splashDone, setSplashDone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthed(Boolean(getSession()));
    const off = onSessionChange(() => setAuthed(Boolean(getSession())));
    const t1 = setTimeout(() => setLeaving(true), SPLASH_MS - 250);
    const t2 = setTimeout(() => setSplashDone(true), SPLASH_MS);
    return () => {
      off();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const isPublic = PUBLIC.has(pathname);
  useEffect(() => {
    if (authed === null) return;
    if (!authed && !isPublic) void navigate({ to: "/login", replace: true });
    if (authed && isPublic) void navigate({ to: "/", replace: true });
  }, [authed, isPublic, navigate]);

  const allowed = authed !== null && (authed ? !isPublic : isPublic);
  if (!splashDone || !allowed) return <Splash leaving={leaving && allowed} />;
  return <div className="animate-entry">{children}</div>;
}

function Splash({ leaving }: { leaving: boolean }) {
  return (
    <div
      role="status"
      aria-label="Loading workspace"
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-navy transition-opacity duration-300 ${leaving ? "opacity-0" : "opacity-100"}`}
    >
      <SplashLockup />
    </div>
  );
}
