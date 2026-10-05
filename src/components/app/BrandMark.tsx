/** Real company logo, served from /public/assets so it works on any host (Lovable, Vercel, etc.). */

/** Real company logo. Default: on a white plate. `bare`: transparent mark for dark/photographic surfaces. */
export function BrandMark({ size = 36, className = "", bare = true }: { size?: number; className?: string; bare?: boolean }) {
  if (bare) {
    return (
      <img
        src="/assets/maa-logo-white.png"
        alt=""
        aria-hidden
        className={`shrink-0 object-contain ${className}`}
        style={{ width: size * 1.75, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-[4px] bg-card ${className}`}
      style={{ width: size * 1.45, height: size }}
    >
      <img src="/assets/maa-logo.png" alt="" className="h-[82%] w-[88%] object-contain" />
    </span>
  );
}

export function BrandLockup({
  size = 36,
  nameClass = "text-[13px]",
  labelClass = "text-[10px]",
  bare = true,
}: {
  size?: number;
  nameClass?: string;
  labelClass?: string;
  bare?: boolean;
}) {
  return (
    <span className="flex items-center gap-3">
      <BrandMark size={size} bare={bare} />
      <span className="min-w-0 leading-tight">
        <span className={`block font-semibold tracking-[0.08em] text-navy-foreground ${nameClass}`}>
          MILIND AWASARMOL
          <br />& ASSOCIATES
        </span>
        <span className={`mt-1 block tracking-[0.22em] text-navy-muted ${labelClass}`}>PROJECT WORKSPACE</span>
      </span>
    </span>
  );
}

/** Splash identity: faint drafting grid, a few self-drawing structural lines, staggered typeset reveal, measured yellow progress. CSS/SVG only. */
export function SplashLockup({ compact = false }: { compact?: boolean }) {
  const d = (ms: number) => ({ animationDelay: `${ms}ms` });
  return (
    <>
      <svg aria-hidden className={`splash-grid pointer-events-none absolute inset-0 h-full w-full ${compact ? "opacity-50" : ""}`}>
        <defs>
          <pattern id="splash-grid-minor" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          </pattern>
          <pattern id="splash-grid-major" width="120" height="120" patternUnits="userSpaceOnUse">
            <rect width="120" height="120" fill="url(#splash-grid-minor)" />
            <path d="M120 0H0V120" fill="none" stroke="currentColor" strokeWidth="0.75" />
            <circle cx="0" cy="0" r="1.25" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#splash-grid-major)" />
      </svg>
      <div aria-hidden className="splash-scan pointer-events-none absolute inset-x-0 top-[38%] h-px bg-navy-foreground/10" />

      <div className="relative flex -translate-y-[4vh] flex-col items-center px-6 text-center">
        <div className="relative">
          <svg aria-hidden viewBox="0 0 320 120" className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible text-navy-foreground ${compact ? "w-[240px]" : "w-[320px]"}`}>
            <line className="splash-draw" style={d(150)} x1="0" y1="96" x2="320" y2="96" pathLength={1} />
            <line className="splash-draw" style={d(220)} x1="160" y1="-10" x2="160" y2="24" pathLength={1} />
            <line className="splash-draw" style={d(280)} x1="28" y1="96" x2="104" y2="30" pathLength={1} />
            <line className="splash-draw" style={d(280)} x1="292" y1="96" x2="216" y2="30" pathLength={1} />
            <line className="splash-draw" style={d(340)} x1="0" y1="90" x2="0" y2="102" pathLength={1} />
            <line className="splash-draw" style={d(340)} x1="320" y1="90" x2="320" y2="102" pathLength={1} />
          </svg>
          <div className="splash-rise relative" style={d(250)}>
            <BrandMark size={compact ? 46 : 56} />
          </div>
        </div>
        <p
          className={`splash-rise mt-7 font-semibold leading-[1.25] tracking-[0.16em] text-navy-foreground ${compact ? "text-[15px]" : "text-[18px]"}`}
          style={d(420)}
        >
          MILIND AWASARMOL
          <br />& ASSOCIATES
        </p>
        <p className="splash-rise mt-3 text-[10.5px] tracking-[0.3em] text-navy-muted" style={d(600)}>
          PROJECT WORKSPACE
        </p>
        <div className="splash-rise mt-7 flex flex-col items-center" style={d(750)}>
          <span aria-hidden className="block h-px w-10 bg-navy-border" />
          <p className="mt-4 font-mono text-[10px] tracking-[0.2em] text-navy-muted/80">CONSULTING STRUCTURAL ENGINEER</p>
        </div>
        <div className="splash-rise relative mt-9 h-px w-40 bg-navy-border" style={d(800)}>
          <span aria-hidden className="absolute -top-[3px] left-0 h-[7px] w-px bg-navy-border" />
          <span aria-hidden className="absolute -top-[3px] right-0 h-[7px] w-px bg-navy-border" />
          <div className="splash-measure absolute inset-y-0 left-0 w-1/3 bg-accent" style={d(850)} />
        </div>
      </div>
    </>
  );
}
