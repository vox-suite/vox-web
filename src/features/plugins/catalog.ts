import type { InstallExtensionRequest } from "@/lib/consumer-auth/core-host-client";

/** Presentation only. Package availability, endpoint, operator and tools come from Core. */
export type PluginCategory =
  "Popular" | "Food & Groceries" | "Productivity" | "Media & Design";

export const PLUGIN_CATEGORIES: PluginCategory[] = [
  "Popular",
  "Food & Groceries",
  "Productivity",
  "Media & Design",
];

export type CatalogPluginOperator = {
  operatorId: string;
  operatorName: string;
};

export type CatalogPlugin = {
  packageVersion?: number;
  packageDigest?: string;
  id: string;
  displayName: string;
  tagline: string;
  description: string;
  category: Exclude<PluginCategory, "Popular">;
  isPopular: boolean;
  logoFile: string;
  backgroundColor: string;
  endpointUrl: string;
  publisher: string;
  operator: CatalogPluginOperator;
  highlights: string[];
  protocol: "mcp";
};

type PluginBrand = Pick<
  CatalogPlugin,
  | "id"
  | "displayName"
  | "category"
  | "isPopular"
  | "logoFile"
  | "backgroundColor"
>;
export const PLUGIN_BRANDS: readonly PluginBrand[] = [
  {
    id: "zomato",
    displayName: "Zomato",
    category: "Food & Groceries",
    isPopular: true,
    logoFile: "zomato.svg",
    backgroundColor: "#E23744",
  },
  {
    id: "swiggy-food",
    displayName: "Swiggy Food",
    category: "Food & Groceries",
    isPopular: true,
    logoFile: "swiggy.svg",
    backgroundColor: "#FC8019",
  },
  {
    id: "swiggy-instamart",
    displayName: "Swiggy Instamart",
    category: "Food & Groceries",
    isPopular: true,
    logoFile: "swiggy.svg",
    backgroundColor: "#6E2C8C",
  },
  {
    id: "swiggy-dineout",
    displayName: "Swiggy Dineout",
    category: "Food & Groceries",
    isPopular: false,
    logoFile: "swiggy.svg",
    backgroundColor: "#E4463B",
  },
  {
    id: "bigbasket",
    displayName: "BigBasket",
    category: "Food & Groceries",
    isPopular: false,
    logoFile: "bigbasket.svg",
    backgroundColor: "#84C225",
  },
  {
    id: "notion",
    displayName: "Notion",
    category: "Productivity",
    isPopular: true,
    logoFile: "notion.svg",
    backgroundColor: "#191919",
  },
  {
    id: "todoist",
    displayName: "Todoist",
    category: "Productivity",
    isPopular: false,
    logoFile: "todoist.svg",
    backgroundColor: "#E44332",
  },
  {
    id: "google-calendar",
    displayName: "Google Calendar",
    category: "Productivity",
    isPopular: true,
    logoFile: "google-calendar.svg",
    backgroundColor: "#FFFFFF",
  },
  {
    id: "gmail",
    displayName: "Gmail",
    category: "Productivity",
    isPopular: false,
    logoFile: "gmail.svg",
    backgroundColor: "#EA4335",
  },
  {
    id: "spotify",
    displayName: "Spotify",
    category: "Media & Design",
    isPopular: true,
    logoFile: "spotify.svg",
    backgroundColor: "#121212",
  },
  {
    id: "canva",
    displayName: "Canva",
    category: "Media & Design",
    isPopular: false,
    logoFile: "canva.svg",
    backgroundColor: "#00C4CC",
  },
];

export function getPluginBrand(id: string): PluginBrand | undefined {
  return PLUGIN_BRANDS.find((b) => b.id === id.trim().toLowerCase());
}

/** Unknown connectors need no Web code: use their reviewed declaration and initials. */
export function presentConnector(
  manifest: InstallExtensionRequest,
  version?: number,
  digest?: string,
): CatalogPlugin {
  const brand = getPluginBrand(manifest.external_key);
  return {
    id: manifest.external_key,
    displayName: manifest.display_name,
    tagline: manifest.capabilities.map((c) => c.display_name).join(", "),
    description: `Data recipients: ${[...new Set(manifest.capabilities.flatMap((c) => c.data_recipients ?? []))].join(", ")}.`,
    category: brand?.category ?? "Productivity",
    isPopular: brand?.isPopular ?? false,
    logoFile: brand?.logoFile ?? "",
    backgroundColor: brand?.backgroundColor ?? "#191919",
    endpointUrl: manifest.endpoint_url,
    publisher: manifest.operator.operator_name,
    operator: {
      operatorId: manifest.operator.operator_id,
      operatorName: manifest.operator.operator_name,
    },
    highlights: manifest.capabilities.map(
      (c) => `${c.display_name} (${c.effect})`,
    ),
    protocol: "mcp",
    packageVersion: version,
    packageDigest: digest,
  };
}
