import type { ErrorComponentProps } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { AppShell } from "@/components/app/AppShell";
import { EntryGate } from "@/components/app/EntryGate";
import { Toaster } from "@/components/ui/sonner";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-8 pt-16 pb-14">
      <p className="font-mono text-[12px] tracking-[0.12em] text-muted-foreground">ERROR 404</p>
      <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.015em]">This page does not exist</h1>
      <p className="mt-2 max-w-[520px] text-[13.5px] text-muted-foreground">
        The link may be outdated, or the project, folder or file may have been moved.
      </p>
      <div className="mt-6 flex gap-2 border-t border-border pt-5">
        <Link to="/" className="btn btn-primary">Go to Overview</Link>
        <Link to="/projects" className="btn btn-secondary">Open Projects</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Milind Awasarmol & Associates — Project Workspace" },
      {
        name: "description",
        content:
          "Project workspace for Milind Awasarmol & Associates, Consulting Structural Engineer, Mumbai.",
      },
      { name: "author", content: "Milind Awasarmol & Associates" },
      { property: "og:title", content: "Milind Awasarmol & Associates — Project Workspace" },
      {
        property: "og:description",
        content:
          "Project workspace for Milind Awasarmol & Associates, Consulting Structural Engineer, Mumbai.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const bare = pathname === "/login";
  // The mobile client (/m) has its own shell and entry gate.
  const mobile = pathname === "/m" || pathname.startsWith("/m/");

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      {mobile ? (
        <Outlet />
      ) : (
        <EntryGate>{bare ? <Outlet /> : <AppShell><Outlet /></AppShell>}</EntryGate>
      )}
      <Toaster position={mobile ? "top-center" : "bottom-right"} />
    </QueryClientProvider>
  );
}
