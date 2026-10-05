import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import facade from "@/assets/login-facade.jpg";
import { BrandLockup } from "@/components/app/BrandMark";
import { signIn } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Milind Awasarmol & Associates" },
      { name: "description", content: "Sign in to the Milind Awasarmol & Associates project workspace." },
      { property: "og:title", content: "Sign in — Milind Awasarmol & Associates" },
      { property: "og:description", content: "Sign in to the Milind Awasarmol & Associates project workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

/** Local hero film over the static poster. Skipped for reduced motion and small screens; poster stays on any failure. */
function HeroVideo() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    setEnabled(!reduce && desktop);
  }, []);
  if (!enabled)
    return <img src={facade} alt="" width={960} height={1280} className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-luminosity" />;
  return (
    <video
      src="/assets/maa-login-hero.mp4"
      poster={facade}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      tabIndex={-1}
      onError={() => setEnabled(false)}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-45 mix-blend-luminosity"
    />
  );
}

function Login() {
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "block h-12 w-full rounded-[6px] border border-border-strong bg-card px-3.5 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground/70 hover:border-muted-foreground/50 focus:border-primary focus:ring-[3px] focus:ring-primary/15";

  return (
    <div className="grid min-h-dvh grid-cols-1 bg-card lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy px-12 py-11 lg:flex">
        <HeroVideo />
        <div aria-hidden className="absolute inset-0 bg-navy/25" />
        <div className="relative">
          <BrandLockup bare size={48} nameClass="text-[16px]" labelClass="text-[10.5px]" />
        </div>
        <div className="relative border-t border-navy-foreground/15 pt-4 text-[12px] leading-relaxed tracking-[0.12em]">
          <p className="text-navy-foreground/80">MILIND AWASARMOL &amp; ASSOCIATES</p>
          <p className="text-navy-muted">MUMBAI, INDIA</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <form
          className="w-full max-w-[420px] -translate-y-[4vh]"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            setPending(true);
            signIn(email, password).catch((err: Error) => {
              setError(err.message);
              setPending(false);
            });
          }}
        >
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="size-2.5 bg-accent" />
            <p className="text-[11.5px] font-medium tracking-[0.18em] text-muted-foreground uppercase">Project workspace</p>
          </div>
          <h1 className="mt-5 text-[30px] leading-[1.15] font-semibold tracking-[-0.02em]">Sign in to your workspace</h1>
          <p className="mt-2.5 text-[15px] text-muted-foreground">Access your projects, documents and site records.</p>

          <div className="mt-10 space-y-5">
            <label className="block">
              <span className="mb-2 block text-[14px] font-medium">Email</span>
              <input className={inputCls} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@maa-consultant.com" />
            </label>
            <label className="block">
              <span className="mb-2 flex items-center justify-between">
                <span className="text-[14px] font-medium">Password</span>
                <a href="mailto:support@maa-consultant.com" className="text-[13px] text-primary hover:underline">
                  Forgot password?
                </a>
              </span>
              <input className={inputCls} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            {error ? <p role="alert" className="text-[13px] text-danger">{error}</p> : null}
            <button type="submit" className="btn btn-primary !h-12 w-full !rounded-[6px] !text-[15px] !font-semibold" disabled={pending}>
              {pending ? "Signing in…" : "Sign In"}
            </button>
          </div>

          <div className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-5 text-[12.5px] text-muted-foreground">
            <p>Access is managed by your company administrator.</p>
            <p className="shrink-0 font-mono text-[11px] tracking-[0.06em]">MAA · MUMBAI</p>
          </div>
        </form>
      </div>
    </div>
  );
}
