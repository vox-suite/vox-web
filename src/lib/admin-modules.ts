export type AdminModule = {
  slug: string;
  title: string;
  description: string;
  icon: "overview" | "database" | "design" | "module" | "health" | "pipeline";
};
export const adminModules: AdminModule[] = [
  {
    slug: "",
    title: "Overview",
    description: "Your Vox management workspace.",
    icon: "overview",
  },
  {
    slug: "pipeline",
    title: "Pipeline Flow",
    description:
      "Interactive visual pipeline architecture of Bridge & Core with Excalidraw flow builder.",
    icon: "pipeline",
  },
  {
    slug: "health",
    title: "System health",
    description: "Inspect host metrics, RAM usage, and container resources.",
    icon: "health",
  },
];
export function adminHref(slug: string, basePath = "/admin") {
  if (basePath === "") {
    return slug ? `/${slug}` : "/";
  }
  return slug ? `${basePath}/${slug}` : basePath;
}
