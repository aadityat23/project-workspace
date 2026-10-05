import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import loginFacade from "@/assets/login-facade.jpg";
import { BrandLockup } from "@/components/app/BrandMark";
import { signIn } from "@/lib/auth";

export const Route = createFileRoute("/m/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Milind Awasarmol & Associates Mobile" },
      { name: "description", content: "Sign in to the Milind Awasarmol & Associates mobile workspace." },
      { property: "og:title", content: "Sign in — Milind Awasarmol & Associates Mobile" },
      { property: "og:description", content: "Sign in to the Milind Awasarmol & Associates mobile workspace." },
    ],
  }),
  component: MobileLogin,
});

function MobileLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await signIn(email, password);
      void navigate({ to: "/m", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-card">
      <div className="relative h-[250px] shrink-0 overflow-hidden bg-navy">
        <img
          src={loginFacade}
          alt=""
          width={960}
          height={1280}
          className="absolute inset-0 size-full object-cover opacity-35 mix-blend-luminosity"
        />
        <div className="relative flex h-full flex-col justify-between p-5">
          <BrandLockup bare size={34} nameClass="text-[12px]" labelClass="text-[9px]" />
          <p className="font-mono text-[11px] tracking-[0.1em] text-navy-muted">PROJECT WORKSPACE · MUMBAI</p>
        </div>
      </div>
      <form onSubmit={submit} className="flex flex-1 flex-col px-5 pt-7 pb-6">
        <h1 className="text-[22px] font-semibold tracking-[-0.015em]">Sign in to your workspace</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">Use your company email address.</p>
        <label className="mt-6 block">
          <span className="text-label">Email</span>
          <input
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field mt-1.5 h-12 w-full text-[16px]"
            placeholder="name@maa-consultant.com"
          />
        </label>
        <label className="mt-4 block">
          <span className="flex items-center justify-between">
            <span className="text-label">Password</span>
            <a href="mailto:support@maa-consultant.com?subject=Password%20reset" className="text-[13px] font-medium text-primary">
              Forgot password
            </a>
          </span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field mt-1.5 h-12 w-full text-[16px]"
          />
        </label>
        {error && (
          <p role="alert" className="mt-3 text-[13px] text-danger">
            {error}
          </p>
        )}
        <div className="mt-auto pt-8">
          <button type="submit" disabled={pending} className="btn btn-primary h-12 w-full text-[15px]">
            {pending ? "Signing in…" : "Sign In"}
          </button>
          <p className="mt-3 text-center text-[12px] text-muted-foreground">Access is managed by your administrator.</p>
        </div>
      </form>
    </div>
  );
}
