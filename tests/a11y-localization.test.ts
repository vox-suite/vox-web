import test from "node:test";
import assert from "node:assert/strict";
import {
  formatAuthoritativeCurrency,
  formatAuthoritativeDateTime,
  formatAuthoritativeDistance,
  getAccessibleStatusIndicator,
} from "../src/lib/global-formatting";

test("authoritative currency formatting preserves provider currency and amount without conversion", () => {
  // Test case 1: Major units
  const quote1 = formatAuthoritativeCurrency(189.99, "USD", false, "en-US");
  assert.equal(quote1.currencyCode, "USD");
  assert.equal(quote1.isAuthoritative, true);
  assert.equal(quote1.formattedAmount, "189.99 USD");
  assert.ok(quote1.label.includes("authoritative provider quote"));
  assert.ok(quote1.ariaLabel.includes("189.99 USD, authoritative provider quote"));

  // Test case 2: Minor units (cents/paise)
  const quote2 = formatAuthoritativeCurrency(18999, "EUR", true, "en-US");
  assert.equal(quote2.currencyCode, "EUR");
  assert.equal(quote2.formattedAmount, "189.99 EUR");

  // Invariant test: German locale formatting must NOT convert or alter currency code
  const quoteDe = formatAuthoritativeCurrency(5000, "JPY", false, "de-DE");
  assert.equal(quoteDe.currencyCode, "JPY");
  assert.ok(quoteDe.formattedAmount.includes("JPY"));

  // Invariant test: Indian locale formatting must NOT change USD provider quote to INR
  const quoteIn = formatAuthoritativeCurrency(42.5, "USD", false, "en-IN");
  assert.equal(quoteIn.currencyCode, "USD");
  assert.ok(quoteIn.formattedAmount.includes("USD"));
});

test("authoritative datetime formatting preserves provider timezone and prevents silent shifting", () => {
  const isoTime = "2026-10-01T14:30:00.000Z";

  // Formatted in America/New_York (EDT)
  const nyTime = formatAuthoritativeDateTime(isoTime, "America/New_York", "en-US");
  assert.equal(nyTime.authoritativeTimezone, "America/New_York");
  assert.ok(nyTime.formattedDateTime.includes("10:30")); // 14:30 UTC = 10:30 EDT
  assert.ok(nyTime.ariaLabel.includes("America/New_York"));

  // Formatted in Asia/Kolkata (IST)
  const istTime = formatAuthoritativeDateTime(isoTime, "Asia/Kolkata", "en-US");
  assert.equal(istTime.authoritativeTimezone, "Asia/Kolkata");
  assert.ok(istTime.formattedDateTime.includes("08:00")); // 14:30 UTC = 20:00 (8:00 PM) IST
  assert.ok(istTime.ariaLabel.includes("Asia/Kolkata"));

  // Formatted in UTC
  const utcTime = formatAuthoritativeDateTime(isoTime, "UTC", "en-US");
  assert.equal(utcTime.authoritativeTimezone, "UTC");
  assert.ok(utcTime.formattedDateTime.includes("02:30"));
  assert.ok(utcTime.ariaLabel.includes("UTC"));
});

test("authoritative distance preserves provider unit and marks converted preferences advisory", () => {
  // Same units: authoritative only
  const d1 = formatAuthoritativeDistance(12.5, "mi", "mi");
  assert.equal(d1.authoritativeValue, "12.50 mi");
  assert.equal(d1.authoritativeUnit, "mi");
  assert.equal(d1.advisoryConvertedValue, undefined);
  assert.ok(d1.label.includes("authoritative"));

  // Different units: provider is authoritative, user preference is advisory
  const d2 = formatAuthoritativeDistance(10.0, "km", "mi");
  assert.equal(d2.authoritativeValue, "10.00 km");
  assert.equal(d2.authoritativeUnit, "km");
  assert.ok(d2.advisoryConvertedValue?.includes("mi"));
  assert.ok(d2.label.includes("10.00 km (authoritative) · ~"));
  assert.ok(d2.ariaLabel.includes("10.00 km authoritative, approximately"));
});

test("WCAG 2.2 AA non-color reliance: status indicators provide distinct symbols, text badges, and aria-labels", () => {
  // 1. Approved / Confirmed
  const approved = getAccessibleStatusIndicator("approved");
  assert.equal(approved.symbol, "✓");
  assert.ok(approved.text.includes("APPROVED"));
  assert.equal(approved.badgeTone, "positive");
  assert.ok(approved.ariaLabel.includes("Approved and confirmed"));

  // 2. Truthful delivery to channel
  const delivered = getAccessibleStatusIndicator("delivered_to_channel");
  assert.equal(delivered.symbol, "📨");
  assert.ok(delivered.text.includes("NOT CONFIRMED SEEN"));
  assert.ok(delivered.ariaLabel.includes("not confirmed seen by human"));

  // 3. Awaiting decision / Pending
  const pending = getAccessibleStatusIndicator("pending");
  assert.equal(pending.symbol, "⏳");
  assert.ok(pending.text.includes("AWAITING DECISION"));
  assert.ok(pending.ariaLabel.includes("Pending decision or action"));

  // 4. Expired
  const expired = getAccessibleStatusIndicator("expired");
  assert.equal(expired.symbol, "⚠️");
  assert.equal(expired.text, "EXPIRED");
  assert.equal(expired.badgeTone, "warning");

  // 5. Superseded (Details Changed)
  const superseded = getAccessibleStatusIndicator("superseded");
  assert.equal(superseded.symbol, "⊘");
  assert.ok(superseded.text.includes("SUPERSEDED"));
  assert.ok(superseded.ariaLabel.includes("details changed and existing approval voided"));

  // 6. Failed / Rejected
  const failed = getAccessibleStatusIndicator("failed");
  assert.equal(failed.symbol, "✕");
  assert.ok(failed.text.includes("FAILED / REJECTED"));
  assert.equal(failed.badgeTone, "error");

  // 7. Missed reminder
  const missed = getAccessibleStatusIndicator("missed");
  assert.equal(missed.symbol, "⏰");
  assert.ok(missed.text.includes("MISSED"));
  assert.ok(missed.ariaLabel.includes("delivery window expired"));

  // 8. Outcome unknown
  const unknown = getAccessibleStatusIndicator("unknown");
  assert.equal(unknown.symbol, "❓");
  assert.ok(unknown.text.includes("UNKNOWN"));
  assert.ok(unknown.ariaLabel.includes("manual verification required"));
});

test("truthful delivery invariant: delivered_to_channel is never represented as seen or confirmed read", () => {
  const indicator = getAccessibleStatusIndicator("delivered to channel (not confirmed seen)");
  assert.equal(indicator.symbol, "📨");
  assert.ok(!indicator.text.toLowerCase().includes("delivered and seen"));
  assert.ok(!indicator.ariaLabel.toLowerCase().includes("confirmed read"));
  assert.ok(indicator.text.includes("NOT CONFIRMED SEEN"));
});
