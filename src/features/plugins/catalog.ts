/**
 * Apps Vox can connect to. Every entry is the provider's own official remote
 * MCP server; connecting signs the user in on the provider's site (OAuth) and
 * Vox only sees what the user approves there.
 *
 * `registration` says how Vox gets an OAuth client for the provider:
 * - "dynamic": the provider lets Vox register itself, so the app works with
 *   no setup.
 * - "configured": the provider needs an OAuth client created in its developer
 *   console. The app is listed only once Core has that client configured.
 *
 * - "allowlisted": the provider only returns sign-ins to callback URLs it has
 *   approved, so the app is listed only once it is in APPROVED_APPS (after
 *   the provider whitelists https://app.voxagent.in/apps/oauth/callback).
 *
 * `highlights` describe what the provider's MCP server offers. The exact tools
 * are shown after connecting, as reported by the server itself.
 */
export type PluginCategory =
  "Popular" | "Food & Groceries" | "Productivity" | "Media & Design";

export const PLUGIN_CATEGORIES: PluginCategory[] = [
  "Popular",
  "Food & Groceries",
  "Productivity",
  "Media & Design",
];

export type PluginRegistration = "dynamic" | "configured" | "allowlisted";

/**
 * Allowlisted apps whose provider has approved Vox's OAuth callback. Add an
 * id here once its provider confirms, then deploy.
 */
export const APPROVED_APPS: readonly string[] = [];

export type CatalogPluginOperator = {
  operatorId: string;
  operatorName: string;
};

export type CatalogPlugin = {
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
  registration: PluginRegistration;
  highlights: string[];
  protocol: "mcp";
};

export const PLUGIN_CATALOG: CatalogPlugin[] = [
  {
    id: "zomato",
    displayName: "Zomato",
    tagline: "Find restaurants, order food, and track deliveries",
    description:
      "Connect your Zomato account so Vox can look up restaurants and menus, build a cart, place food orders, and track them for you.",
    category: "Food & Groceries",
    isPopular: true,
    logoFile: "zomato.svg",
    backgroundColor: "#E23744",
    endpointUrl: "https://mcp-server.zomato.com/mcp",
    publisher: "Zomato Ltd.",
    operator: { operatorId: "zomato", operatorName: "Zomato Ltd." },
    registration: "allowlisted",
    highlights: [
      "Search restaurants and browse menus with prices",
      "Build a cart and place an order",
      "Track an order after it is placed",
    ],
    protocol: "mcp",
  },
  {
    id: "swiggy-food",
    displayName: "Swiggy Food",
    tagline: "Order food from restaurants near you",
    description:
      "Connect your Swiggy account so Vox can find restaurants and dishes, manage your cart, and place food delivery orders.",
    category: "Food & Groceries",
    isPopular: true,
    logoFile: "swiggy.svg",
    backgroundColor: "#FC8019",
    endpointUrl: "https://mcp.swiggy.com/food",
    publisher: "Swiggy Ltd.",
    operator: { operatorId: "swiggy", operatorName: "Swiggy Ltd." },
    registration: "allowlisted",
    highlights: [
      "Find restaurants and dishes",
      "Manage your cart",
      "Place and follow delivery orders",
    ],
    protocol: "mcp",
  },
  {
    id: "swiggy-instamart",
    displayName: "Swiggy Instamart",
    tagline: "Groceries and essentials delivered in minutes",
    description:
      "Connect Swiggy Instamart so Vox can search groceries and household essentials, fill your cart, and check out quick-commerce orders.",
    category: "Food & Groceries",
    isPopular: true,
    logoFile: "swiggy.svg",
    backgroundColor: "#6E2C8C",
    endpointUrl: "https://mcp.swiggy.com/im",
    publisher: "Swiggy Ltd.",
    operator: { operatorId: "swiggy", operatorName: "Swiggy Ltd." },
    registration: "allowlisted",
    highlights: [
      "Search groceries and essentials",
      "Add items to your cart",
      "Place quick-delivery orders",
    ],
    protocol: "mcp",
  },
  {
    id: "swiggy-dineout",
    displayName: "Swiggy Dineout",
    tagline: "Discover restaurants and book tables",
    description:
      "Connect Swiggy Dineout so Vox can find places to eat out, check availability, and book a table for you.",
    category: "Food & Groceries",
    isPopular: false,
    logoFile: "swiggy.svg",
    backgroundColor: "#E4463B",
    endpointUrl: "https://mcp.swiggy.com/dineout",
    publisher: "Swiggy Ltd.",
    operator: { operatorId: "swiggy", operatorName: "Swiggy Ltd." },
    registration: "allowlisted",
    highlights: [
      "Find restaurants for dining out",
      "Check table availability",
      "Book a table",
    ],
    protocol: "mcp",
  },
  {
    id: "bigbasket",
    displayName: "BigBasket",
    tagline: "Shop groceries and household supplies",
    description:
      "Connect your BigBasket account so Vox can search products, manage your basket, and help you order groceries.",
    category: "Food & Groceries",
    isPopular: false,
    logoFile: "bigbasket.svg",
    backgroundColor: "#84C225",
    endpointUrl: "https://mcp.bigbasket.com/mcp",
    publisher: "Supermarket Grocery Supplies Pvt. Ltd.",
    operator: { operatorId: "bigbasket", operatorName: "BigBasket" },
    registration: "allowlisted",
    highlights: [
      "Search products and prices",
      "Manage your basket",
      "Order groceries",
    ],
    protocol: "mcp",
  },
  {
    id: "notion",
    displayName: "Notion",
    tagline: "Search, read, and write your Notion pages",
    description:
      "Connect your Notion workspace so Vox can find and read pages and databases you allow, and create or update pages for you.",
    category: "Productivity",
    isPopular: true,
    logoFile: "notion.svg",
    backgroundColor: "#191919",
    endpointUrl: "https://mcp.notion.com/mcp",
    publisher: "Notion Labs, Inc.",
    operator: { operatorId: "notion", operatorName: "Notion Labs, Inc." },
    registration: "dynamic",
    highlights: [
      "Search your workspace",
      "Read pages and databases",
      "Create and update pages",
    ],
    protocol: "mcp",
  },
  {
    id: "todoist",
    displayName: "Todoist",
    tagline: "Capture and manage your tasks",
    description:
      "Connect Todoist so Vox can add tasks as you talk, review what is due, and update or complete tasks.",
    category: "Productivity",
    isPopular: false,
    logoFile: "todoist.svg",
    backgroundColor: "#E44332",
    endpointUrl: "https://ai.todoist.net/mcp",
    publisher: "Doist",
    operator: { operatorId: "todoist", operatorName: "Doist" },
    registration: "dynamic",
    highlights: [
      "Add tasks and projects",
      "See what is due",
      "Update and complete tasks",
    ],
    protocol: "mcp",
  },
  {
    id: "google-calendar",
    displayName: "Google Calendar",
    tagline: "Check your schedule and manage events",
    description:
      "Connect Google Calendar so Vox can check your availability, list upcoming events, and create or change events.",
    category: "Productivity",
    isPopular: true,
    logoFile: "google-calendar.svg",
    backgroundColor: "#FFFFFF",
    endpointUrl: "https://calendarmcp.googleapis.com/mcp/v1",
    publisher: "Google LLC",
    operator: { operatorId: "google", operatorName: "Google LLC" },
    registration: "configured",
    highlights: [
      "List upcoming events",
      "Check free and busy time",
      "Create and update events",
    ],
    protocol: "mcp",
  },
  {
    id: "gmail",
    displayName: "Gmail",
    tagline: "Search and draft email",
    description:
      "Connect Gmail so Vox can search your mail, summarise threads, and draft replies.",
    category: "Productivity",
    isPopular: false,
    logoFile: "gmail.svg",
    backgroundColor: "#EA4335",
    endpointUrl: "https://gmailmcp.googleapis.com/mcp/v1",
    publisher: "Google LLC",
    operator: { operatorId: "google", operatorName: "Google LLC" },
    registration: "configured",
    highlights: ["Search your mail", "Read threads", "Draft replies"],
    protocol: "mcp",
  },
  {
    id: "spotify",
    displayName: "Spotify",
    tagline: "Play music and manage your library",
    description:
      "Connect Spotify so Vox can search music, control playback on your devices, and manage playlists and saved songs.",
    category: "Media & Design",
    isPopular: true,
    logoFile: "spotify.svg",
    backgroundColor: "#121212",
    endpointUrl: "https://mcp-gateway-external-pilot.spotify.net/mcp",
    publisher: "Spotify AB",
    operator: { operatorId: "spotify", operatorName: "Spotify AB" },
    registration: "configured",
    highlights: [
      "Search songs, albums, and artists",
      "Control playback on your devices",
      "Manage playlists and saved songs",
    ],
    protocol: "mcp",
  },
  {
    id: "canva",
    displayName: "Canva",
    tagline: "Find, create, and edit designs",
    description:
      "Connect Canva so Vox can find your designs, create new ones from a description, and export them.",
    category: "Media & Design",
    isPopular: false,
    logoFile: "canva.svg",
    backgroundColor: "#00C4CC",
    endpointUrl: "https://mcp.canva.com/mcp",
    publisher: "Canva Pty Ltd",
    operator: { operatorId: "canva", operatorName: "Canva Pty Ltd" },
    registration: "allowlisted",
    highlights: ["Find your designs", "Create designs", "Export designs"],
    protocol: "mcp",
  },
];

export function getCatalogPlugin(id: string): CatalogPlugin | undefined {
  const normalized = id.trim().toLowerCase();
  return PLUGIN_CATALOG.find(
    (plugin) => plugin.id.toLowerCase() === normalized,
  );
}

export function endpointHost(plugin: CatalogPlugin): string {
  return new URL(plugin.endpointUrl).hostname.toLowerCase();
}

/**
 * Apps that can actually be connected: every dynamic-registration app,
 * configured-client apps whose endpoint host has a client in Core, and
 * allowlisted apps whose provider has approved Vox.
 */
export function connectablePlugins(
  configuredHosts: readonly string[],
  catalog: readonly CatalogPlugin[] = PLUGIN_CATALOG,
  approved: readonly string[] = APPROVED_APPS,
): CatalogPlugin[] {
  const hosts = new Set(configuredHosts.map((h) => h.toLowerCase()));
  return catalog.filter((plugin) => {
    switch (plugin.registration) {
      case "dynamic":
        return true;
      case "configured":
        return hosts.has(endpointHost(plugin));
      case "allowlisted":
        return approved.includes(plugin.id);
    }
  });
}

export function getPluginsByCategory(
  catalog: readonly CatalogPlugin[] = PLUGIN_CATALOG,
): Record<PluginCategory, CatalogPlugin[]> {
  const result: Record<PluginCategory, CatalogPlugin[]> = {
    Popular: [],
    "Food & Groceries": [],
    Productivity: [],
    "Media & Design": [],
  };
  for (const plugin of catalog) {
    if (plugin.isPopular) result.Popular.push(plugin);
    result[plugin.category].push(plugin);
  }
  return result;
}
