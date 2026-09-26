import type { MultiServiceJourneyItem } from "@/lib/consumer-auth/core-host-client";
import type { HandoffInput } from "./api";

/**
 * Illustrative journey fixtures. The composite journey has no Core endpoint
 * yet; the lodging dates and handoff targets are fixed example inputs for the
 * Platform V1 contract demonstrations.
 */
export const DEFAULT_CONNECTION_ID = "conn-provider-sample";
export const SAMPLE_STAY = {
  checkIn: "2026-10-01",
  checkOut: "2026-10-05",
  occupancy: 2,
};
export const SAMPLE_GUEST_NAME = "Vox Account Holder";

export const SAMPLE_COMPOSITE_JOURNEY: MultiServiceJourneyItem[] = [
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
    handoff_url:
      "https://m.uber.com/ul/?action=setPickup&pickup[latitude]=47.4502&pickup[longitude]=-122.3088&dropoff[latitude]=47.6128&dropoff[longitude]=-122.3331",
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
];

export type HandoffSample = HandoffInput & {
  providerName: string;
  title: string;
  subject: string;
  detail: string;
};

export const HANDOFF_SAMPLES: HandoffSample[] = [
  {
    provider: "amazon",
    providerName: "Amazon",
    title: "Amazon Product & Cart Handoff (L0)",
    subject: "Apple MacBook Air M3 (16GB, 512GB)",
    detail: "ASIN: B08N5WRWNW · Locale: US",
    handoff: {
      asin: "B08N5WRWNW",
      locale: "US",
      quantity: 1,
      partner_tag: "vox-20",
    },
  },
  {
    provider: "zomato",
    providerName: "Zomato",
    title: "Zomato Restaurant & Cart Handoff (L0)",
    subject: "The Bombay Canteen (Lower Parel, Mumbai)",
    detail: "Restaurant ID: 18204 · Region: IN",
    handoff: {
      res_id: "18204",
      order_id: null,
      handoff_type: "ViewRestaurant",
    },
  },
  {
    provider: "uber",
    providerName: "Uber",
    title: "Uber Consumer Ride Request Handoff (L0)",
    subject: "Market St to Mission St (San Francisco)",
    detail: "UberX · Fare Quote: $18.50 USD (Expiring in 5m)",
    handoff: {
      pickup_latitude: 37.7749,
      pickup_longitude: -122.4194,
      dropoff_latitude: 37.7833,
      dropoff_longitude: -122.4167,
      product_id: "uberx",
      fare_id: "fare_demo_456",
    },
  },
];
