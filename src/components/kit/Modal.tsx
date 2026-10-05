import { X } from "lucide-react";
import type { ReactNode } from "react";

import { useDialogFocus } from "./useDialogFocus";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg";
}

const widths = { sm: "max-w-[420px]", md: "max-w-[560px]", lg: "max-w-[720px]" };

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "md",
}: ModalProps) {
  const ref = useDialogFocus<HTMLDivElement>(open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-6 pt-[10vh]">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="fixed inset-0 bg-navy/35"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`overlay-panel relative w-full ${widths[width]}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <h2 className="text-section">{title}</h2>
            {description ? (
              <p className="text-meta mt-1 text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost -mr-2 size-8 px-0">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </button>
        </header>
        <div className="px-6 py-5">{children}</div>
        {footer ? (
          <footer className="flex items-center justify-end gap-2 border-t border-border bg-surface px-6 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-label mb-1.5 block">{label}</span>
      {children}
      {hint ? <span className="text-meta mt-1 block text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
