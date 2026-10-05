import office from "@/assets/project-office.jpg";
import residency from "@/assets/project-residency.jpg";
import retail from "@/assets/project-retail.jpg";
import warehouse from "@/assets/project-warehouse.jpg";
import { getProject } from "@/lib/api";

const images: Record<string, string> = {
  "aaditya-residency": residency,
  "commercial-office-interior": office,
  "shirdi-plaza": retail,
  "nashik-warehouse": warehouse,
};

/** Neutral placeholder for projects without a cover photo. */
const placeholder =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><rect width="160" height="100" fill="#E3E6EA"/><path d="M0 80H160M40 0V100M120 0V100" stroke="#C9CED6" stroke-width="0.75"/><path d="M62 66V44l18-12 18 12v22Z" fill="none" stroke="#6B7280" stroke-width="1.5"/></svg>',
  );

export function projectImage(projectId: string): string {
  return getProject(projectId)?.coverImage ?? images[projectId] ?? placeholder;
}
