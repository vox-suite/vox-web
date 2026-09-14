export type AdminModule = {
  slug: string;
  title: string;
  description: string;
  icon: "overview" | "database" | "design" | "module";
};
export const adminModules: AdminModule[] = [
  {
    slug: "",
    title: "Overview",
    description: "Your Vox management workspace.",
    icon: "overview",
  },
  {
    slug: "redis",
    title: "Redis explorer",
    description: "Browse cached context, inspect entries, and check expiry.",
    icon: "database",
  },
  {
    slug: "design-system",
    title: "Design system",
    description: "The shared language behind every Vox page.",
    icon: "design",
  },
];
export function adminHref(slug: string) {
  return slug ? `/admin/${slug}` : "/admin";
}
