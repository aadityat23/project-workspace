import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
      <div className="min-w-0">
        {eyebrow ? <p className="text-overline mb-2">{eyebrow}</p> : null}
        <h1 className="text-page">{title}</h1>
        {subtitle ? (
          <p className="mt-1.5 max-w-[640px] text-[13.5px] text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/* Sections are grouped by a rule and a label, not by a card. */
export function Section({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <header className="flex h-10 items-center justify-between gap-4 border-b border-foreground/80">
        <h2 className="text-[11px] font-semibold tracking-[0.12em] text-foreground uppercase">
          {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start px-6 py-14">
      {icon ? <div className="mb-3 text-muted-foreground/70">{icon}</div> : null}
      <p className="text-label">{title}</p>
      {description ? (
        <p className="mt-1 max-w-[420px] text-[13px] text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1360px] px-10 pt-9 pb-16">{children}</div>;
}
