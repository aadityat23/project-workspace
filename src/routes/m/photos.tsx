import { Link, createFileRoute } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { useState } from "react";

import { MobileGallery } from "@/components/mobile/MobileGallery";
import { Chips, MobileHeader, StateBlock } from "@/components/mobile/kit";
import { ProfileButton } from "@/components/mobile/ProfileButton";
import { getPhotos, getProjects } from "@/lib/api";
import { useCapturedPhotos } from "@/lib/mobile-store";

export const Route = createFileRoute("/m/photos")({
  head: () => ({
    meta: [
      { title: "Photos — Milind Awasarmol & Associates Mobile" },
      { name: "description", content: "Site photo archive across all projects." },
      { property: "og:title", content: "Photos — Milind Awasarmol & Associates Mobile" },
      { property: "og:description", content: "Site photo archive across all projects." },
    ],
  }),
  component: AllPhotos,
});

function AllPhotos() {
  const projects = getProjects();
  const names = ["All", ...projects.map((p) => p.name)] as const;
  const [sel, setSel] = useState<string>("All");
  const project = projects.find((p) => p.name === sel);
  const captured = useCapturedPhotos(project?.id);
  const photos = [...captured, ...getPhotos(project?.id)];

  return (
    <div className="relative pb-4">
      <MobileHeader title="Photos" eyebrow="Site archive" large right={<ProfileButton />} />
      <div className="border-b border-border bg-card">
        <Chips options={names} value={sel} onChange={setSel} />
      </div>
      {photos.length ? (
        <MobileGallery photos={photos} />
      ) : (
        <StateBlock kind="empty" title="No photos for this project" body="Captured site photos will appear here, grouped by visit." />
      )}
      <div className="pointer-events-none sticky bottom-0 px-4 pb-2">
        <Link to="/m/capture" search={{ project: project?.id }} className="btn btn-primary pointer-events-auto h-12 w-full text-[15px]">
          <Camera className="size-[18px]" /> Take photo
        </Link>
      </div>
    </div>
  );
}
