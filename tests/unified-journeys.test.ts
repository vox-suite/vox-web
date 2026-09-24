import assert from "node:assert/strict";
import test from "node:test";
import { VoxCoreHostClient } from "../src/lib/consumer-auth/core-host-client";

const privateKey =
  "MC4CAQAwBQYDK2VwBCIEIBERERERERERERERERERERERERERERERERERERERERER";

const testConfig = {
  baseUrl: "https://core.vox.test",
  hostCredential: {
    credentialId: "11111111-2222-4333-8444-555555555555",
    audience: "vox-host:test:vox-web",
    secret: "host-secret-fixture",
  },
  identityCredential: {
    issuer: "https://app.vox.test",
    audience: "vox-core:test",
    privateKeyPkcs8Base64: privateKey,
  },
  identityAdapterKey: "vox-web-primary",
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

  assert.equal(capturedUrl, "https://core.vox.test/v1/connected-reads/uber");
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

test("searchLodging, bookLodging, and cancelLodgingBooking execute verified consequential write lifecycle", async () => {
  let capturedSearchUrl = "";
  let capturedBookUrl = "";
  let capturedCancelUrl = "";
  let capturedBookBody: Record<string, unknown> = {};

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      const url = String(input);
      const body = JSON.parse(String(init?.body || "{}"));
      if (url.endsWith("/v1/lodging/search")) {
        capturedSearchUrl = url;
        return Response.json({
          properties: [
            {
              property_id: "prop_seattle_1",
              name: "Grand Hyatt Seattle",
              location: "Seattle, WA",
              star_rating: 4.5,
              price_amount_minor: 85000,
              currency: "USD",
              available_rate_plans: [
                {
                  rate_plan_id: "rate_deluxe_king",
                  room_name: "Deluxe King",
                  refundable: true,
                  cancellation_deadline: "2026-09-29T15:00:00Z",
                },
              ],
            },
          ],
          total_results: 1,
        });
      }
      if (url.endsWith("/v1/lodging/bookings")) {
        capturedBookUrl = url;
        capturedBookBody = body;
        return Response.json(
          {
            booking_id: "bkg_998877",
            expedia_booking_ref: "EXP-99214",
            property_id: "prop_seattle_1",
            status: "confirmed",
            check_in: "2026-10-01",
            check_out: "2026-10-05",
            total_amount_minor: 85000,
            currency: "USD",
            cancellation_policy: "Full refund if cancelled before deadline",
            created_at: "2026-09-23T18:00:00Z",
          },
          { status: 201 },
        );
      }
      if (url.includes("/cancel")) {
        capturedCancelUrl = url;
        return Response.json({
          booking_id: "bkg_998877",
          expedia_booking_ref: "EXP-99214",
          property_id: "prop_seattle_1",
          status: "cancelled",
          refund_amount_minor: 85000,
          currency: "USD",
          cancelled_at: "2026-09-23T18:30:00Z",
        });
      }
      return new Response("Not found", { status: 404 });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-lodging",
  });

  // 1. Search
  const searchResults = await client.searchLodging("user-1", {
    connection_id: "conn-exp-1",
    destination: "Seattle, WA",
    check_in: "2026-10-01",
    check_out: "2026-10-05",
    occupancy: 2,
  });
  assert.equal(capturedSearchUrl, "https://core.vox.test/v1/lodging/search");
  assert.equal(searchResults.properties.length, 1);
  assert.equal(searchResults.properties[0].name, "Grand Hyatt Seattle");

  // 2. Book
  const booking = await client.bookLodging("user-1", {
    connection_id: "conn-exp-1",
    booking_request: {
      property_id: "prop_seattle_1",
      rate_plan_id: "rate_deluxe_king",
      guest_name: "Vox User",
      check_in: "2026-10-01",
      check_out: "2026-10-05",
      total_amount_minor: 85000,
      currency: "USD",
    },
  });
  assert.equal(capturedBookUrl, "https://core.vox.test/v1/lodging/bookings");
  assert.equal(booking.expedia_booking_ref, "EXP-99214");
  assert.equal(booking.status, "confirmed");
  assert.equal(booking.total_amount_minor, 85000);
  assert.equal(
    (capturedBookBody.booking_request as Record<string, unknown>).property_id,
    "prop_seattle_1",
  );

  // 3. Cancel
  const cancellation = await client.cancelLodgingBooking(
    "user-1",
    "bkg_998877",
    "conn-exp-1",
    "Trip cancelled",
  );
  assert.equal(
    capturedCancelUrl,
    "https://core.vox.test/v1/lodging/bookings/bkg_998877/cancel",
  );
  assert.equal(cancellation.status, "cancelled");
  assert.equal(cancellation.refund_amount_minor, 85000);
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
