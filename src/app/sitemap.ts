import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://voxagent.in", lastModified: new Date(), priority: 1 }];
}
