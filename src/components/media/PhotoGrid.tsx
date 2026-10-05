import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";

import { formatDateTime } from "@/lib/format";
import type { Photo } from "@/lib/types";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const visits = photos.reduce<Record<string, Photo[]>>((acc, photo) => {
    (acc[photo.visit] ??= []).push(photo);
    return acc;
  }, {});

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") setActiveIndex((i) => ((i ?? 0) + 1) % photos.length);
      if (event.key === "ArrowLeft")
        setActiveIndex((i) => ((i ?? 0) - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, photos.length]);

  const active = activeIndex === null ? null : photos[activeIndex];

  return (
    <div className="space-y-8">
      {Object.entries(visits).map(([visit, items]) => {
        const [label, date] = visit.split(" — ");
        return (
          <section key={visit} className="grid gap-5 lg:grid-cols-[140px_minmax(0,1fr)]">
            <header className="lg:sticky lg:top-4 lg:self-start">
              <p className="font-mono text-[13px] font-medium tracking-[0.04em] uppercase">{date ?? visit}</p>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">{label}</p>
              <p className="mt-3 text-[11.5px] text-muted-foreground">
                {items.length} photo{items.length === 1 ? "" : "s"}
                <br />
                {items[0]?.uploadedBy}
              </p>
            </header>
            <ul className="grid auto-rows-[150px] grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
              {items.map((photo, i) => (
                <li key={photo.id} className={i === 0 ? "col-span-2 row-span-2" : undefined}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(photos.indexOf(photo))}
                    className="group relative block h-full w-full overflow-hidden rounded-[4px] bg-surface text-left"
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      loading="lazy"
                      width={1024}
                      height={768}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <span className="absolute inset-x-0 bottom-0 translate-y-1 bg-navy/85 px-2.5 py-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <span className="block truncate text-[12px] font-medium text-navy-foreground">{photo.title}</span>
                      <span className="block font-mono text-[10.5px] text-navy-muted">
                        {formatDateTime(photo.capturedAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {active ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-navy/90 p-6">
          <div className="flex items-center justify-between gap-4 text-navy-foreground">
            <div className="min-w-0">
              <p className="text-label truncate">{active.title}</p>
              <p className="text-meta text-navy-muted">
                {active.visit} · {formatDateTime(active.capturedAt)} · {active.uploadedBy}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              aria-label="Close photo"
              className="flex size-8 items-center justify-center rounded-[6px] border border-navy-border hover:bg-navy-raised"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center gap-4 py-4">
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => setActiveIndex((i) => ((i ?? 0) - 1 + photos.length) % photos.length)}
              className="flex size-9 shrink-0 items-center justify-center rounded-[6px] border border-navy-border text-navy-foreground hover:bg-navy-raised"
            >
              <ChevronLeft className="size-5" />
            </button>
            <img
              src={active.url}
              alt={active.title}
              className="max-h-full max-w-full rounded-[6px] object-contain"
            />
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => setActiveIndex((i) => ((i ?? 0) + 1) % photos.length)}
              className="flex size-9 shrink-0 items-center justify-center rounded-[6px] border border-navy-border text-navy-foreground hover:bg-navy-raised"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
