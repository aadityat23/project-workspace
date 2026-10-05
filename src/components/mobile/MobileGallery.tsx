import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { formatDate, formatTime } from "@/lib/format";
import type { Photo } from "@/lib/types";

type GPhoto = Photo & { status?: "Uploading" | "Processing" | "Ready" };

/** Date-grouped two-column site archive with a full-screen swipe viewer. */
export function MobileGallery({ photos }: { photos: GPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const sorted = [...photos].sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
  const groups: [string, { p: GPhoto; i: number }[]][] = [];
  sorted.forEach((p, i) => {
    const key = `${p.capturedAt.slice(0, 10)}|${p.visit}`;
    const last = groups[groups.length - 1];
    if (last && last[0] === key) last[1].push({ p, i });
    else groups.push([key, [{ p, i }]]);
  });

  return (
    <>
      {groups.map(([key, list]) => {
        const [date, visit] = key.split("|");
        return (
          <section key={key} className="pb-3">
            <header className="sticky top-0 z-10 flex items-baseline justify-between border-b border-border bg-background px-4 py-2">
              <span>
                <span className="block font-mono text-[12px] font-medium tracking-[0.06em] uppercase">{formatDate(date!)}</span>
                <span className="block text-[12.5px] text-muted-foreground">{visit}</span>
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">{list.length} PHOTOS</span>
            </header>
            <div className="grid grid-cols-2 gap-1.5 px-4 pt-2">
              {list.map(({ p, i }) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => p.status === undefined || p.status === "Ready" ? setOpen(i) : undefined}
                  className="relative aspect-[4/3] overflow-hidden rounded-[4px] bg-surface text-left"
                >
                  <img src={p.url} alt={p.title} loading="lazy" className="size-full object-cover" />
                  {p.status && p.status !== "Ready" && (
                    <span className="absolute inset-0 flex flex-col justify-end bg-navy/55 p-2">
                      <span className="text-[12px] font-medium text-navy-foreground">{p.status}…</span>
                      <span className="mt-1 h-0.5 overflow-hidden bg-navy-border">
                        <span className="animate-splash-bar block h-full w-1/3 bg-accent" />
                      </span>
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 truncate bg-navy/70 px-2 py-1 text-[11px] text-navy-foreground">
                    {p.title}
                  </span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
      {open !== null && sorted[open] && (
        <PhotoViewer photos={sorted} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </>
  );
}

function PhotoViewer({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: GPhoto[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const p = photos[index]!;
  const startX = useRef<number | null>(null);
  const prev = () => index > 0 && onIndex(index - 1);
  const next = () => index < photos.length - 1 && onIndex(index + 1);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  return (
    <div role="dialog" aria-modal="true" aria-label={p.title} className="absolute inset-0 z-50 flex flex-col bg-navy text-navy-foreground">
      <div className="flex h-12 items-center justify-between px-1.5">
        <button type="button" aria-label="Close" onClick={onClose} className="flex size-11 items-center justify-center">
          <X className="size-5" />
        </button>
        <span className="font-mono text-[12px] text-navy-muted">
          {index + 1} / {photos.length}
        </span>
        <span className="size-11" />
      </div>
      <div
        className="relative flex min-h-0 flex-1 items-center"
        onTouchStart={(e) => (startX.current = e.touches[0]!.clientX)}
        onTouchEnd={(e) => {
          if (startX.current === null) return;
          const dx = e.changedTouches[0]!.clientX - startX.current;
          if (dx > 50) prev();
          if (dx < -50) next();
          startX.current = null;
        }}
      >
        <img src={p.url} alt={p.title} className="max-h-full w-full object-contain" />
        <button type="button" aria-label="Previous photo" onClick={prev} disabled={index === 0} className="absolute left-0 flex size-11 items-center justify-center disabled:opacity-0">
          <ChevronLeft className="size-6" />
        </button>
        <button type="button" aria-label="Next photo" onClick={next} disabled={index === photos.length - 1} className="absolute right-0 flex size-11 items-center justify-center disabled:opacity-0">
          <ChevronRight className="size-6" />
        </button>
      </div>
      <div className="border-t border-navy-border px-4 pt-3 pb-5">
        <p className="text-[15px] font-medium">{p.title}</p>
        <p className="mt-1 font-mono text-[11.5px] text-navy-muted">
          {p.visit.toUpperCase()} · {formatDate(p.capturedAt)} {formatTime(p.capturedAt)} · {p.uploadedBy}
        </p>
      </div>
    </div>
  );
}
