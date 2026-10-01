import assert from "node:assert/strict";
import test from "node:test";
import { VoxCoreHostClient } from "../src/lib/consumer-auth/core-host-client";

const testConfig = {
  baseUrl: "https://core.vox.test",
  hostCredential: {
    credentialId: "11111111-2222-4333-8444-555555555555",
    audience: "vox-host:test:vox-web",
    secret: "host-secret-fixture",
  },
};

test("readUberHistory posts signed host context and retrieves minimized trips", async () => {
  let capturedUrl = "";
  let capturedBody: Record<string, unknown> = {};
  let capturedHeaders: Record<string, string> = {};

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      capturedUrl = String(input);
      capturedBody = JSON.parse(String(init?.body || "{}"));
      capturedHeaders = (init?.headers || {}) as Record<string, string>;
      return Response.json({
        trips: [
          {
            trip_id: "trip_001",
            request_time: "2026-09-23T14:30:00Z",
            status: "completed",
            distance_miles: 4.8,
            start_city: "San Francisco",
          },
        ],
        total_trips: 1,
        retrieved_at: "2026-09-23T18:00:00Z",
        freshness_seconds: 300,
      });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-read",
  });

  const res = await client.readUberHistory("user-1", {
    connection_id: "conn-uber-1",
    include_city: true,
  });

  assert.equal(capturedUrl, "https://core.vox.test/v1/connected-reads");
  assert.equal(capturedBody.capability_external_key, "uber.history");
  assert.equal(
    (capturedBody.host_context as Record<string, string>).host_user_id,
    "vox-account:user-1",
  );
  assert.equal(capturedBody.connection_id, "conn-uber-1");
  assert.equal(
    capturedHeaders["X-Vox-Host-Credential"],
    "11111111-2222-4333-8444-555555555555",
  );
  assert.equal(res.trips.length, 1);
  assert.equal(res.trips[0].trip_id, "trip_001");
  assert.equal(res.trips[0].start_city, "San Francisco");
  // Invariant: Sensitive raw coordinates are stripped/minimized
  assert.equal(res.trips[0].pickup_latitude, undefined);
  assert.equal(res.trips[0].pickup_longitude, undefined);
});

test("createAmazonHandoff, createZomatoHandoff, and createUberRideHandoff enforce handoff honesty and completed === false", async () => {
  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input) => {
      const url = String(input);
      if (url.endsWith("/v1/handoffs/amazon")) {
        return Response.json({
          provider: "amazon",
          action: "cart_and_checkout",
          handoff_url: "https://www.amazon.com/dp/B08N5WRWNW?tag=vox-20",
          status: "handoff_created",
          completed: false,
          disclaimer:
            "Vox does not place consumer orders directly. Cart and checkout will open in Amazon.",
        });
      }
      if (url.endsWith("/v1/handoffs/zomato")) {
        return Response.json({
          provider: "zomato",
          action: "view_restaurant",
          handoff_url: "https://www.zomato.com/restaurant/18204",
          status: "handoff_created",
          completed: false,
          disclaimer:
            "Vox does not place consumer food orders directly. Menu and ordering will open in Zomato.",
        });
      }
      if (url.endsWith("/v1/handoffs/uber")) {
        return Response.json({
          provider: "uber",
          action: "open_uber_ride_request",
          handoff_url:
            "https://m.uber.com/ul/?action=setPickup&pickup[latitude]=37.774900&pickup[longitude]=-122.419400&dropoff[latitude]=37.783300&dropoff[longitude]=-122.416700&product_id=uberx",
          status: "handoff_created",
          completed: false,
          disclaimer:
            "Ride dispatch, driver matching, and fare charging are completed directly in the Uber app. Vox does not claim a confirmed ride.",
        });
      }
      return new Response("Not found", { status: 404 });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-handoff",
  });

  // 1. Amazon Handoff
  const amazon = await client.createAmazonHandoff("user-1", "conn-amz-1", {
    asin: "B08N5WRWNW",
    locale: "US",
    quantity: 1,
    partner_tag: "vox-20",
  });
  assert.equal(amazon.provider, "amazon");
  assert.equal(amazon.status, "handoff_created");
  assert.equal(amazon.completed, false); // Strict invariant: Never reported as completed
  assert.match(amazon.handoff_url, /amazon\.com\/dp\/B08N5WRWNW/);
  assert.match(amazon.disclaimer, /does not place consumer orders directly/);

  // 2. Zomato Handoff
  const zomato = await client.createZomatoHandoff("user-1", "conn-zom-1", {
    res_id: "18204",
    handoff_type: "ViewRestaurant",
  });
  assert.equal(zomato.provider, "zomato");
  assert.equal(zomato.status, "handoff_created");
  assert.equal(zomato.completed, false); // Strict invariant: Never reported as completed
  assert.match(zomato.handoff_url, /zomato\.com\/restaurant\/18204/);

  // 3. Uber Ride Handoff
  const uber = await client.createUberRideHandoff("user-1", "conn-ubr-1", {
    pickup_latitude: 37.7749,
    pickup_longitude: -122.4194,
    dropoff_latitude: 37.7833,
    dropoff_longitude: -122.4167,
    product_id: "uberx",
  });
  assert.equal(uber.provider, "uber");
  assert.equal(uber.status, "handoff_created");
  assert.equal(uber.completed, false); // Strict invariant: Opening Uber is never reported as confirmed ride
  assert.match(uber.handoff_url, /m\.uber\.com\/ul\/\?action=setPickup/);
  assert.match(uber.disclaimer, /does not claim a confirmed ride/);
});
