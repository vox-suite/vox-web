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
  {
    slug: "redis",
    title: "Redis explorer",
    description: "Browse cached context, inspect entries, and check expiry.",
    icon: "database",
  },
];
export function adminHref(slug: string, basePath = "/admin") {
  if (basePath === "") {
    return slug ? `/${slug}` : "/";
  }
  return slug ? `${basePath}/${slug}` : basePath;
}
