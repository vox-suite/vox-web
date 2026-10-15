import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Omit lastModified until per-page content dates are maintained accurately.
  return ["/", "/timeline", "/projects", "/download", "/speech-time-calculator", "/privacy-policy", "/terms-of-service"].map(path => ({ url: `${SITE_URL}${path}` }));
}
