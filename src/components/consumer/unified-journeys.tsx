"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Field,
  Notice,
  Row,
  Select,
  Stack,
  Text,
} from "@/components/ui";
import type {
  HandoffResponse,
  LodgingBooking,
  LodgingCancelResponse,
  LodgingProperty,
  MultiServiceJourneyItem,
  UberTrip,
} from "@/lib/consumer-auth/core-host-client";

type JourneyTab = "read" | "write" | "handoffs" | "composite";

export function UnifiedJourneys({
  defaultConnectionId = "conn-provider-sample",
}: {
  defaultConnectionId?: string;
}) {
  const [activeTab, setActiveTab] = useState<JourneyTab>("composite");
  const [connectionId, setConnectionId] = useState(defaultConnectionId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1. Connected Read state (Uber)
  const [trips, setTrips] = useState<UberTrip[]>([]);
  const [readMetadata, setReadMetadata] = useState<{
    total: number;
    freshnessSeconds: number;
    retrievedAt: string;
  } | null>(null);

  // 2. Consequential Write state (Expedia)
  const [destination, setDestination] = useState("Seattle, WA");
  const [properties, setProperties] = useState<LodgingProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<LodgingProperty | null>(null);
  const [paymentAuthorized, setPaymentAuthorized] = useState(false);
  const [booking, setBooking] = useState<LodgingBooking | null>(null);
  const [cancellation, setCancellation] = useState<LodgingCancelResponse | null>(null);

  // 3. Labelled Handoff state (Amazon, Zomato, Uber)
  const [amazonHandoff, setAmazonHandoff] = useState<HandoffResponse | null>(null);
  const [zomatoHandoff, setZomatoHandoff] = useState<HandoffResponse | null>(null);
  const [uberHandoff, setUberHandoff] = useState<HandoffResponse | null>(null);

  // 4. Multi-Service Composite Journey state
  const [compositeItems, setCompositeItems] = useState<MultiServiceJourneyItem[]>([
    {
      service: "Lodging Booking",
      service_type: "consequential_write",
      provider: "expedia",
      action: "book_lodging",
      status: "confirmed",
      authoritative_reference: "EXP-99214",
      payment_status: "settled",
      summary: "Grand Hyatt Seattle · 4 nights · Deluxe King",
      completed: true,
    },
    {
      service: "Airport Transfer",
      service_type: "labelled_handoff",
      provider: "uber",
      action: "open_uber_ride_request",
      status: "handoff_created",
      authoritative_reference: null,
      payment_status: "not_applicable",
      handoff_url: "https://m.uber.com/ul/?action=setPickup&pickup[latitude]=47.4502&pickup[longitude]=-122.3088&dropoff[latitude]=47.6128&dropoff[longitude]=-122.3331",
      summary: "UberX estimate $42.50 USD · Handed off to Uber app",
      completed: false,
    },
    {
      service: "Welcome Dinner",
      service_type: "labelled_handoff",
      provider: "zomato",
      action: "view_restaurant",
      status: "handoff_created",
      authoritative_reference: null,
      payment_status: "not_applicable",
      handoff_url: "https://www.zomato.com/restaurant/18204",
      summary: "The Bombay Canteen · Menu inspection & table reservation",
      completed: false,
    },
  ]);

  // Handlers for Connected Read
  async function handleFetchTrips() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/account/journeys/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection_id: connectionId,
          include_city: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to read connected trip history");
      }
      const data = await res.json();
      setTrips(data.trips || []);
      setReadMetadata({
        total: data.total_trips || (data.trips ? data.trips.length : 0),
        freshnessSeconds: data.freshness_seconds || 300,
        retrievedAt: data.retrieved_at || new Date().toISOString(),
      });
      setSuccess("Authoritative trip history retrieved with location minimization.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Read failed");
    } finally {
      setLoading(false);
    }
  }

  // Handlers for Consequential Write (Lodging)
  async function handleSearchLodging() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const params = new URLSearchParams({
        connectionId,
        destination,
        checkIn: "2026-10-01",
        checkOut: "2026-10-05",
        occupancy: "2",
      });
      const res = await fetch(`/api/account/journeys/lodging?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Lodging search failed");
      }
      const data = await res.json();
      setProperties(data.properties || []);
      setSuccess(`Found ${data.properties?.length || 0} lodging properties in ${destination}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  function handleAuthorizePayment(property: LodgingProperty) {
    setSelectedProperty(property);
    setPaymentAuthorized(true);
    setBooking(null);
    setCancellation(null);
    setSuccess("Payment hold authorized in escrow. Final booking requires authoritative confirmation.");
  }

  async function handleConfirmBooking() {
    if (!selectedProperty) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/journeys/lodging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection_id: connectionId,
          booking_request: {
            property_id: selectedProperty.property_id,
            rate_plan_id: selectedProperty.available_rate_plans[0]?.rate_plan_id || "rate_standard",
            guest_name: "Vox Account Holder",
            check_in: "2026-10-01",
            check_out: "2026-10-05",
            total_amount_minor: selectedProperty.price_amount_minor,
            currency: selectedProperty.currency,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Booking failed");
      }
      const data: LodgingBooking = await res.json();
      setBooking(data);
      setSuccess(`Booking confirmed by Expedia! Reference: ${data.expedia_booking_ref}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking confirmation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelBooking() {
    if (!booking) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/account/journeys/lodging/${encodeURIComponent(booking.booking_id)}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            connection_id: connectionId,
            reason: "User requested itinerary change",
          }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Cancellation failed");
      }
      const data: LodgingCancelResponse = await res.json();
      setCancellation(data);
      setBooking((prev) => (prev ? { ...prev, status: "cancelled" } : null));
      setSuccess(`Booking ${data.expedia_booking_ref} cancelled. Full refund settled.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancellation failed");
    } finally {
      setLoading(false);
    }
  }

  // Handlers for Handoffs
  async function handleGenerateHandoff(provider: "amazon" | "zomato" | "uber") {
    setLoading(true);
    setError(null);
    try {
      let handoffPayload: Record<string, unknown> = {};
      if (provider === "amazon") {
        handoffPayload = {
          asin: "B08N5WRWNW",
          locale: "US",
          quantity: 1,
          partner_tag: "vox-20",
        };
      } else if (provider === "zomato") {
        handoffPayload = {
          res_id: "18204",
          order_id: null,
          handoff_type: "ViewRestaurant",
        };
      } else if (provider === "uber") {
        handoffPayload = {
          pickup_latitude: 37.7749,
          pickup_longitude: -122.4194,
          dropoff_latitude: 37.7833,
          dropoff_longitude: -122.4167,
          product_id: "uberx",
          fare_id: "fare_demo_456",
        };
      }

      const res = await fetch("/api/account/journeys/handoffs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          connection_id: connectionId,
          handoff: handoffPayload,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Handoff generation failed");
      }

      const data: HandoffResponse = await res.json();
      if (provider === "amazon") setAmazonHandoff(data);
      if (provider === "zomato") setZomatoHandoff(data);
      if (provider === "uber") setUberHandoff(data);

      setSuccess(`Labelled handoff generated for ${data.provider}. Transferred continuation without claiming completion.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Handoff failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      title="Unified Product Journeys"
      description="One coherent interface for connected reads, approved writes, provider authentication, honest outcomes, and labelled handoffs."
      tone="soft"
    >
      <Stack gap="normal">
        <Row spread>
          <Row>
            <Button
              variant={activeTab === "composite" ? "primary" : "ghost"}
              onClick={() => setActiveTab("composite")}
            >
              Composite Journey
            </Button>
            <Button
              variant={activeTab === "read" ? "primary" : "ghost"}
              onClick={() => setActiveTab("read")}
            >
              Connected Read (Uber)
            </Button>
            <Button
              variant={activeTab === "write" ? "primary" : "ghost"}
              onClick={() => setActiveTab("write")}
            >
              Consequential Write (Expedia)
            </Button>
            <Button
              variant={activeTab === "handoffs" ? "primary" : "ghost"}
              onClick={() => setActiveTab("handoffs")}
            >
              Labelled Handoffs
            </Button>
          </Row>
          <Badge tone="accent">Platform V1 Contract</Badge>
        </Row>

        {error && <Notice title="Journey Notice" tone="error">{error}</Notice>}
        {success && <Notice title="Authoritative State Updated" tone="success">{success}</Notice>}

        <Field
          id="journey-conn-id"
          label="Active Provider Connection ID"
          hint="Authority is tied strictly to user-authorized connections stored in Core."
          value={connectionId}
          onChange={(e) => setConnectionId(e.target.value)}
        />

        {/* 1. COMPOSITE JOURNEY TAB */}
        {activeTab === "composite" && (
          <Stack gap="normal">
            <Card
              title="Multi-Service Travel Journey: Seattle Summit"
              description="Partial multi-service outcomes remain individually understandable. A successful booking never masks pending, handoff, or failed partner services."
              tone="plain"
            >
              <Stack gap="normal">
                <Notice title="Authority Invariant" tone="info">
                  <strong>FR-EXE-008:</strong> Payment authorization and handoff transitions are visibly distinct from completion. Each provider item maintains independent authoritative evidence.
                </Notice>

                <div className="space-y-4">
                  {compositeItems.map((item, idx) => (
                    <Card key={idx} tone="contrast">
                      <Stack gap="small">
                        <Row spread>
                          <Row>
                            <strong>{item.service}</strong>
                            <Badge tone={item.status === "confirmed" ? "positive" : "warning"}>
                              {item.status.toUpperCase()}
                            </Badge>
                            <Badge tone="neutral">
                              {item.service_type === "consequential_write"
                                ? "L3 Consequential Write"
                                : item.service_type === "connected_read"
                                ? "L2 Connected Read"
                                : "L0 Labelled Handoff"}
                            </Badge>
                          </Row>
                          {item.completed ? (
                            <Badge tone="positive">Completed</Badge>
                          ) : (
                            <Badge tone="warning">Pending External / Handoff</Badge>
                          )}
                        </Row>

                        <Text>{item.summary}</Text>

                        <Row spread>
                          <Row>
                            <Text small muted>
                              Provider: <strong>{item.provider.toUpperCase()}</strong>
                            </Text>
                            {item.authoritative_reference && (
                              <Text small muted>
                                Reference: <strong>{item.authoritative_reference}</strong>
                              </Text>
                            )}
                            <Text small muted>
                              Payment: <strong>{item.payment_status?.toUpperCase()}</strong>
                            </Text>
                          </Row>

                          {item.handoff_url && (
                            <a
                              href={item.handoff_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ui-button"
                              data-variant="secondary"
                            >
                              Continue in {item.provider === "uber" ? "Uber" : "Zomato"} ↗
                            </a>
                          )}
                        </Row>
                      </Stack>
                    </Card>
                  ))}
                </div>
              </Stack>
            </Card>
          </Stack>
        )}

        {/* 2. CONNECTED READ TAB (UBER) */}
        {activeTab === "read" && (
          <Stack gap="normal">
            <Card
              title="Selected Connected Read: Uber Trip History (L2)"
              description="Demonstrates context minimization: rider credentials and precise latitude/longitude coordinates are stripped at the Core boundary."
              tone="plain"
            >
              <Stack gap="normal">
                <Row spread>
                  <Button onClick={handleFetchTrips} disabled={loading}>
                    {loading ? "Reading Authoritative Trips..." : "Retrieve Trip History (L2)"}
                  </Button>
                  {readMetadata && (
                    <Row>
                      <Badge tone="positive">Total: {readMetadata.total}</Badge>
                      <Badge tone="neutral">Freshness: {readMetadata.freshnessSeconds}s</Badge>
                    </Row>
                  )}
                </Row>

                <Notice title="Data Minimization Guarantee" tone="info">
                  Location coordinates (lat/long) and internal rider tokens are strictly redacted. Vox only displays start city, timestamp, distance, and status.
                </Notice>

                {trips.length > 0 ? (
                  <div className="space-y-2">
                    {trips.map((trip) => (
                      <Card key={trip.trip_id} tone="contrast">
                        <Row spread>
                          <Stack gap="small">
                            <strong>Trip #{trip.trip_id}</strong>
                            <Text small muted>
                              Date: {new Date(trip.request_time).toLocaleDateString()} · City: {trip.start_city || "Minimised"}
                            </Text>
                          </Stack>
                          <Row>
                            <Badge tone="neutral">{trip.distance_miles} miles</Badge>
                            <Badge tone="positive">{trip.status.toUpperCase()}</Badge>
                          </Row>
                        </Row>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Text muted>Click &quot;Retrieve Trip History&quot; to inspect authoritative read data.</Text>
                )}
              </Stack>
            </Card>
          </Stack>
        )}

        {/* 3. CONSEQUENTIAL WRITE TAB (EXPEDIA) */}
        {activeTab === "write" && (
          <Stack gap="normal">
            <Card
              title="Selected Consequential Write: Expedia Rapid Lodging (L3)"
              description="Demonstrates end-to-end consequential execution: rate quote binding, payment authorization distinct from completion, and verified cancellation."
              tone="plain"
            >
              <Stack gap="normal">
                <Row>
                  <Field
                    id="dest-search"
                    label="Destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                  <Button onClick={handleSearchLodging} disabled={loading}>
                    {loading ? "Searching..." : "Search Properties (L1)"}
                  </Button>
                </Row>

                {properties.length > 0 && !booking && (
                  <div className="space-y-4">
                    <h3>Available Verified Properties</h3>
                    {properties.map((prop) => (
                      <Card key={prop.property_id} tone="contrast">
                        <Row spread>
                          <Stack gap="small">
                            <strong>{prop.name}</strong>
                            <Text small muted>{prop.location} · {prop.star_rating} Stars</Text>
                            <Text small>
                              Rate: <strong>${(prop.price_amount_minor / 100).toFixed(2)} {prop.currency}</strong>
                            </Text>
                          </Stack>
                          <Button
                            variant="secondary"
                            onClick={() => handleAuthorizePayment(prop)}
                          >
                            Authorize Booking Proposal
                          </Button>
                        </Row>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Proposal & Payment Hold View */}
                {paymentAuthorized && selectedProperty && !booking && (
                  <Card tone="soft" title="Step 2: Payment Escrow & Proposal Approval">
                    <Stack gap="normal">
                      <Notice title="Payment Authentication != Completion" tone="info">
                        <strong>AS-013:</strong> Authorizing a payment hold reserves funds but does NOT guarantee room inventory until the provider returns a confirmed booking reference.
                      </Notice>
                      <Row spread>
                        <Stack gap="small">
                          <strong>{selectedProperty.name}</strong>
                          <Text small>Amount: ${(selectedProperty.price_amount_minor / 100).toFixed(2)} {selectedProperty.currency}</Text>
                          <Text small muted>Policy: Full refund if cancelled 48h prior to check-in.</Text>
                        </Stack>
                        <Badge tone="accent">Payment Held in Escrow</Badge>
                      </Row>
                      <Button onClick={handleConfirmBooking} disabled={loading}>
                        {loading ? "Submitting to Expedia..." : "Confirm Consequential Booking (L3)"}
                      </Button>
                    </Stack>
                  </Card>
                )}

                {/* Confirmed Booking View */}
                {booking && (
                  <Card tone="contrast" title="Authoritative Booking State">
                    <Stack gap="normal">
                      <Row spread>
                        <Stack gap="small">
                          <Row>
                            <strong>Expedia Confirmation: {booking.expedia_booking_ref}</strong>
                            <Badge tone={booking.status === "confirmed" ? "positive" : "warning"}>
                              {booking.status.toUpperCase()}
                            </Badge>
                          </Row>
                          <Text small muted>
                            Dates: {booking.check_in} to {booking.check_out}
                          </Text>
                          <Text small muted>
                            Settled Total: ${(booking.total_amount_minor / 100).toFixed(2)} {booking.currency}
                          </Text>
                        </Stack>
                        {booking.status === "confirmed" && (
                          <Button variant="danger" onClick={handleCancelBooking} disabled={loading}>
                            {loading ? "Processing Cancellation..." : "Cancel Booking & Refund"}
                          </Button>
                        )}
                      </Row>

                      {cancellation && (
                        <Notice title="Cancellation Verified" tone="success">
                          Booking {cancellation.expedia_booking_ref} cancelled by Expedia.
                          Refund of ${(cancellation.refund_amount_minor / 100).toFixed(2)} {cancellation.currency} confirmed.
                        </Notice>
                      )}
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Card>
          </Stack>
        )}

        {/* 4. LABELLED HANDOFFS TAB */}
        {activeTab === "handoffs" && (
          <Stack gap="normal">
            <Card
              title="Labelled Handoffs: Honest Provider Boundaries (L0)"
              description="Direct execution is restricted to verified partner APIs. When consumer ordering is unavailable, Vox generates explicit labelled handoffs without claiming completion."
              tone="plain"
            >
              <Stack gap="normal">
                <Notice title="Handoff Honesty Invariant (FR-HND-004)" tone="info">
                  <strong>Strict Rule:</strong> Vox NEVER marks an action complete because a handoff was opened or generated. Copy explicitly says &quot;Continue in [Provider]&quot;.
                </Notice>

                {/* Amazon Handoff */}
                <Card tone="contrast" title="Amazon Product & Cart Handoff (L0)">
                  <Stack gap="small">
                    <Row spread>
                      <div>
                        <strong>Apple MacBook Air M3 (16GB, 512GB)</strong>
                        <Text small muted>ASIN: B08N5WRWNW · Locale: US</Text>
                      </div>
                      <Button onClick={() => handleGenerateHandoff("amazon")} disabled={loading}>
                        Generate Amazon Handoff
                      </Button>
                    </Row>
                    {amazonHandoff && (
                      <Stack gap="small">
                        <Row spread>
                          <Row>
                            <Badge tone="warning">Status: {amazonHandoff.status}</Badge>
                            <Badge tone="neutral">Completed: {String(amazonHandoff.completed)}</Badge>
                          </Row>
                          <a
                            href={amazonHandoff.handoff_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ui-button"
                            data-variant="secondary"
                          >
                            Continue in Amazon ↗
                          </a>
                        </Row>
                        <Text small muted>{amazonHandoff.disclaimer}</Text>
                      </Stack>
                    )}
                  </Stack>
                </Card>

                {/* Zomato Handoff */}
                <Card tone="contrast" title="Zomato Restaurant & Cart Handoff (L0)">
                  <Stack gap="small">
                    <Row spread>
                      <div>
                        <strong>The Bombay Canteen (Lower Parel, Mumbai)</strong>
                        <Text small muted>Restaurant ID: 18204 · Region: IN</Text>
                      </div>
                      <Button onClick={() => handleGenerateHandoff("zomato")} disabled={loading}>
                        Generate Zomato Handoff
                      </Button>
                    </Row>
                    {zomatoHandoff && (
                      <Stack gap="small">
                        <Row spread>
                          <Row>
                            <Badge tone="warning">Status: {zomatoHandoff.status}</Badge>
                            <Badge tone="neutral">Completed: {String(zomatoHandoff.completed)}</Badge>
                          </Row>
                          <a
                            href={zomatoHandoff.handoff_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ui-button"
                            data-variant="secondary"
                          >
                            Continue in Zomato ↗
                          </a>
                        </Row>
                        <Text small muted>{zomatoHandoff.disclaimer}</Text>
                      </Stack>
                    )}
                  </Stack>
                </Card>

                {/* Uber Ride Handoff */}
                <Card tone="contrast" title="Uber Consumer Ride Request Handoff (L0)">
                  <Stack gap="small">
                    <Row spread>
                      <div>
                        <strong>Market St to Mission St (San Francisco)</strong>
                        <Text small muted>UberX · Fare Quote: $18.50 USD (Expiring in 5m)</Text>
                      </div>
                      <Button onClick={() => handleGenerateHandoff("uber")} disabled={loading}>
                        Generate Uber Ride Handoff
                      </Button>
                    </Row>
                    {uberHandoff && (
                      <Stack gap="small">
                        <Row spread>
                          <Row>
                            <Badge tone="warning">Status: {uberHandoff.status}</Badge>
                            <Badge tone="neutral">Completed: {String(uberHandoff.completed)}</Badge>
                          </Row>
                          <a
                            href={uberHandoff.handoff_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ui-button"
                            data-variant="secondary"
                          >
                            Continue in Uber ↗
                          </a>
                        </Row>
                        <Text small muted>{uberHandoff.disclaimer}</Text>
                      </Stack>
                    )}
                  </Stack>
                </Card>
              </Stack>
            </Card>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
