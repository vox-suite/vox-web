export type PluginCategory =
  "Popular" | "Food & Groceries" | "Rides & Travel" | "Lifestyle & Essentials";

export const PLUGIN_CATEGORIES: PluginCategory[] = [
  "Popular",
  "Food & Groceries",
  "Rides & Travel",
  "Lifestyle & Essentials",
];

export type CapabilityCategory = "read" | "write" | "search";

export type CatalogCapability = {
  name: string;
  description: string;
  category: CapabilityCategory;
  effectKind?: "read" | "consequential_write";
  displayName?: string;
};

export type PluginAuthType = "oauth2" | "api_key" | "none";

export type CatalogPluginOperator = {
  operatorId: string;
  operatorName: string;
};

export type CatalogPlugin = {
  id: string;
  displayName: string;
  tagline: string;
  description: string;
  category: PluginCategory;
  isPopular: boolean;
  logoFile: string;
  backgroundColor: string;
  capabilities: CatalogCapability[];
  endpointUrl: string;
  authType: PluginAuthType;
  publisher: string;
  rating: number;
  installsCount: number;
  brandKey?: string;
  accentColor?: string;
  protocol?: "mcp";
  operator?: CatalogPluginOperator;
};

export const PLUGIN_CATALOG: CatalogPlugin[] = [
  {
    id: "uber",
    displayName: "Uber",
    tagline: "Request rides, check fares, and track active drivers",
    description:
      "Connect your Uber account to compare fares, book rides, view trip history, and track driver arrival status in real-time.",
    category: "Rides & Travel",
    isPopular: true,
    logoFile: "uber.svg",
    backgroundColor: "#000000",
    accentColor: "#000000",
    brandKey: "uber",
    protocol: "mcp",
    operator: {
      operatorId: "uber",
      operatorName: "Uber Technologies, Inc.",
    },
    endpointUrl: "https://mcp.uber.com/v1",
    authType: "oauth2",
    publisher: "Uber Technologies, Inc.",
    rating: 4.9,
    installsCount: 1250000,
    capabilities: [
      {
        name: "estimate_fare",
        description:
          "Estimate ride fares and trip durations between pickup and dropoff",
        category: "read",
        effectKind: "read",
      },
      {
        name: "get_ride_status",
        description:
          "Track active ride status, driver location, and arrival ETA",
        category: "read",
        effectKind: "read",
      },
      {
        name: "request_ride",
        description:
          "Request an Uber ride with pickup, destination, and vehicle type",
        category: "write",
        effectKind: "consequential_write",
      },
      {
        name: "view_trip_history",
        description: "View recent rides, receipts, and driver feedback",
        category: "search",
        effectKind: "read",
      },
    ],
  },
  {
    id: "doordash",
    displayName: "DoorDash",
    tagline: "Order food delivery and find nearby restaurants",
    description:
      "Browse menus, discover local restaurant deals, verify store hours, and initiate food orders with seamless checkout.",
    category: "Food & Groceries",
    isPopular: true,
    logoFile: "doordash.svg",
    backgroundColor: "#FF3008",
    accentColor: "#FF3008",
    brandKey: "doordash",
    protocol: "mcp",
    operator: {
      operatorId: "doordash",
      operatorName: "DoorDash, Inc.",
    },
    endpointUrl: "https://mcp.doordash.com/v1",
    authType: "oauth2",
    publisher: "DoorDash, Inc.",
    rating: 4.8,
    installsCount: 980000,
    capabilities: [
      {
        name: "search_restaurants",
        description:
          "Search nearby restaurants by cuisine, dietary options, and delivery time",
        category: "search",
        effectKind: "read",
      },
      {
        name: "inspect_menu",
        description:
          "Inspect restaurant menu items, pricing, options, and item descriptions",
        category: "read",
        effectKind: "read",
      },
      {
        name: "check_delivery_time",
        description:
          "Check estimated delivery and preparation times for selected merchants",
        category: "read",
        effectKind: "read",
      },
      {
        name: "create_order_handoff",
        description:
          "Prepare food order cart and create handoff session for checkout confirmation",
        category: "write",
        effectKind: "consequential_write",
      },
    ],
  },
  {
    id: "zomato",
    displayName: "Zomato",
    tagline: "Explore dining, check menus, and reserve tables",
    description:
      "Discover top-rated dining spots, browse curated restaurant menus, check foodie reviews, and reserve tables effortlessly.",
    category: "Food & Groceries",
    isPopular: true,
    logoFile: "zomato.svg",
    backgroundColor: "#E23744",
    accentColor: "#E23744",
    brandKey: "zomato",
    protocol: "mcp",
    operator: {
      operatorId: "zomato",
      operatorName: "Zomato Ltd.",
    },
    endpointUrl: "https://mcp.zomato.com/v1",
    authType: "oauth2",
    publisher: "Zomato Ltd.",
    rating: 4.7,
    installsCount: 840000,
    capabilities: [
      {
        name: "search_dining",
        description:
          "Discover top cafes, restaurants, and nightlife spots with ratings",
        category: "search",
        effectKind: "read",
      },
      {
        name: "view_menu",
        description:
          "View itemized food menus, price lists, and customer photos",
        category: "read",
        effectKind: "read",
      },
      {
        name: "check_ratings",
        description:
          "Check verified diner reviews, hygiene scores, and popular dishes",
        category: "read",
        effectKind: "read",
      },
      {
        name: "reserve_table",
        description:
          "Book table reservations with party size and guest preferences",
        category: "write",
        effectKind: "consequential_write",
      },
    ],
  },
  {
    id: "instacart",
    displayName: "Instacart",
    tagline: "Same-day grocery shopping and pantry essentials",
    description:
      "Shop fresh produce, groceries, and home essentials from local supermarkets with same-day doorstep delivery.",
    category: "Food & Groceries",
    isPopular: false,
    logoFile: "instacart.svg",
    backgroundColor: "#003D29",
    accentColor: "#43B02A",
    brandKey: "instacart",
    protocol: "mcp",
    operator: {
      operatorId: "instacart",
      operatorName: "Maplebear Inc.",
    },
    endpointUrl: "https://mcp.instacart.com/v1",
    authType: "oauth2",
    publisher: "Maplebear Inc. (Instacart)",
    rating: 4.8,
    installsCount: 650000,
    capabilities: [
      {
        name: "search_groceries",
        description:
          "Search pantry items, dairy, fresh produce, and household brands",
        category: "search",
        effectKind: "read",
      },
      {
        name: "check_store_inventory",
        description:
          "Check real-time in-store stock availability and price discounts",
        category: "read",
        effectKind: "read",
      },
      {
        name: "prepare_cart",
        description:
          "Build grocery carts and assemble substitution rules for delivery",
        category: "write",
        effectKind: "consequential_write",
      },
    ],
  },
  {
    id: "amazon",
    displayName: "Amazon",
    tagline: "Search products, compare prices, and track packages",
    description:
      "Browse millions of products, compare customer reviews and merchant prices, and track package deliveries in real-time.",
    category: "Lifestyle & Essentials",
    isPopular: true,
    logoFile: "amazon.svg",
    backgroundColor: "#131921",
    accentColor: "#FF9900",
    brandKey: "amazon",
    protocol: "mcp",
    operator: {
      operatorId: "amazon",
      operatorName: "Amazon.com, Inc.",
    },
    endpointUrl: "https://mcp.amazon.com/v1",
    authType: "oauth2",
    publisher: "Amazon.com, Inc.",
    rating: 4.9,
    installsCount: 2100000,
    capabilities: [
      {
        name: "search_catalog",
        description:
          "Search products across electronics, home, apparel, and daily essentials",
        category: "search",
        effectKind: "read",
      },
      {
        name: "compare_deals",
        description:
          "Compare Prime deals, seller discounts, and buyer price trends",
        category: "read",
        effectKind: "read",
      },
      {
        name: "track_package_shipments",
        description:
          "Check tracking numbers, carrier milestones, and estimated package arrival",
        category: "read",
        effectKind: "read",
      },
    ],
  },
  {
    id: "spotify",
    displayName: "Spotify",
    tagline: "Find playlists, artists, and control music playback",
    description:
      "Control music streaming, find songs, artists, playlists, and podcasts, and queue tracks for ambient listening.",
    category: "Lifestyle & Essentials",
    isPopular: true,
    logoFile: "spotify.svg",
    backgroundColor: "#121212",
    accentColor: "#1ED760",
    brandKey: "spotify",
    protocol: "mcp",
    operator: {
      operatorId: "spotify",
      operatorName: "Spotify AB",
    },
    endpointUrl: "https://mcp.spotify.com/v1",
    authType: "oauth2",
    publisher: "Spotify AB",
    rating: 4.9,
    installsCount: 1850000,
    capabilities: [
      {
        name: "search_audio",
        description: "Search tracks, albums, curated playlists, and podcasts",
        category: "search",
        effectKind: "read",
      },
      {
        name: "get_current_track",
        description:
          "Retrieve currently playing audio, progress, and device state",
        category: "read",
        effectKind: "read",
      },
      {
        name: "add_to_queue",
        description:
          "Add songs or podcast episodes to your active playback queue",
        category: "write",
        effectKind: "read",
      },
    ],
  },
  {
    id: "airbnb",
    displayName: "Airbnb",
    tagline: "Find unique stays, experiences, and local hosts",
    description:
      "Explore unique vacation rentals, apartments, cabins, and local experiences with authentic host reviews.",
    category: "Rides & Travel",
    isPopular: true,
    logoFile: "airbnb.svg",
    backgroundColor: "#FF5A5F",
    accentColor: "#FF5A5F",
    brandKey: "airbnb",
    protocol: "mcp",
    operator: {
      operatorId: "airbnb",
      operatorName: "Airbnb, Inc.",
    },
    endpointUrl: "https://mcp.airbnb.com/v1",
    authType: "oauth2",
    publisher: "Airbnb, Inc.",
    rating: 4.8,
    installsCount: 920000,
    capabilities: [
      {
        name: "search_listings",
        description:
          "Find stays and lodging filtered by dates, location, and guest count",
        category: "search",
        effectKind: "read",
      },
      {
        name: "inspect_amenities",
        description:
          "View detailed property amenities, house rules, and host ratings",
        category: "read",
        effectKind: "read",
      },
      {
        name: "check_dates",
        description:
          "Check availability dates, minimum stay requirements, and total pricing",
        category: "read",
        effectKind: "read",
      },
    ],
  },
  {
    id: "expedia",
    displayName: "Expedia",
    tagline: "Search flights, hotel rate plans, and booking confirmations",
    description:
      "Search and compare flights, hotel packages, and car rentals with flexible cancellation policies.",
    category: "Rides & Travel",
    isPopular: false,
    logoFile: "expedia.svg",
    backgroundColor: "#00253A",
    accentColor: "#FFCC00",
    brandKey: "expedia",
    protocol: "mcp",
    operator: {
      operatorId: "expedia",
      operatorName: "Expedia Group",
    },
    endpointUrl: "https://mcp.expedia.com/v1",
    authType: "oauth2",
    publisher: "Expedia Group",
    rating: 4.6,
    installsCount: 540000,
    capabilities: [
      {
        name: "search_lodging",
        description:
          "Search hotels, resorts, and vacation packages with member discounts",
        category: "search",
        effectKind: "read",
      },
      {
        name: "compare_rates",
        description:
          "Compare flight fares, seat classes, and hotel room tier rates",
        category: "read",
        effectKind: "read",
      },
      {
        name: "get_itinerary",
        description:
          "Retrieve confirmed travel itineraries and reservation details",
        category: "read",
        effectKind: "read",
      },
    ],
  },
  {
    id: "google-calendar",
    displayName: "Google Calendar",
    tagline: "Check free/busy slots and manage your daily schedule",
    description:
      "Keep track of upcoming meetings, check schedule availability, schedule new events, and avoid scheduling conflicts.",
    category: "Lifestyle & Essentials",
    isPopular: true,
    logoFile: "google-calendar.svg",
    backgroundColor: "#FFFFFF",
    accentColor: "#4285F4",
    brandKey: "google-calendar",
    protocol: "mcp",
    operator: {
      operatorId: "google",
      operatorName: "Google LLC",
    },
    endpointUrl: "https://mcp.calendar.google.com/v1",
    authType: "oauth2",
    publisher: "Google LLC",
    rating: 4.9,
    installsCount: 3400000,
    capabilities: [
      {
        name: "get_upcoming_events",
        description:
          "List upcoming calendar events, meeting links, and attendee lists",
        category: "read",
        effectKind: "read",
      },
      {
        name: "find_open_slots",
        description:
          "Find available free time slots across multiple days and time zones",
        category: "read",
        effectKind: "read",
      },
      {
        name: "draft_event",
        description:
          "Draft a new calendar invitation with summary, time, and participants",
        category: "write",
        effectKind: "consequential_write",
      },
    ],
  },
];

export function getCatalogPlugin(id: string): CatalogPlugin | undefined {
  const normalized = id.trim().toLowerCase();
  return PLUGIN_CATALOG.find(
    (plugin) => plugin.id.toLowerCase() === normalized,
  );
}

export function getPluginsByCategory(): Record<
  PluginCategory,
  CatalogPlugin[]
> {
  const result: Record<PluginCategory, CatalogPlugin[]> = {
    Popular: [],
    "Food & Groceries": [],
    "Rides & Travel": [],
    "Lifestyle & Essentials": [],
  };

  for (const plugin of PLUGIN_CATALOG) {
    if (plugin.isPopular || plugin.category === "Popular") {
      result["Popular"].push(plugin);
    }
    if (plugin.category !== "Popular") {
      result[plugin.category].push(plugin);
    }
  }

  return result;
}
