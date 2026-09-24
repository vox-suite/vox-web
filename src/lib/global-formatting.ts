/**
 * Authoritative global value presentation, accessibility, and localization utilities.
 *
 * Implements acceptance criteria for E48 (vox-web#11) and PRD Section 11:
 * - WCAG 2.2 AA non-color reliance and assistive technology semantics.
 * - Authoritative provider currency, timezone, and unit preservation:
 *   Locale formatting NEVER converts currencies or substitutes regions silently.
 *   If user preferences differ from provider facts, the provider value remains strictly authoritative.
 */

export type AuthoritativeCurrencyDisplay = {
  formattedAmount: string;
  currencyCode: string;
  isAuthoritative: true;
  label: string;
  ariaLabel: string;
};

export type AuthoritativeDateTimeDisplay = {
  formattedDateTime: string;
  authoritativeTimezone: string;
  utcOffset: string;
  iso: string;
  ariaLabel: string;
};

export type AuthoritativeDistanceDisplay = {
  authoritativeValue: string;
  authoritativeUnit: string;
  advisoryConvertedValue?: string;
  label: string;
  ariaLabel: string;
};

/**
 * Formats a provider currency quote without any currency conversion.
 * Strictly preserves provider currency code and exact amount.
 */
export function formatAuthoritativeCurrency(
  amountMinorOrMajor: number,
  currencyCode: string,
  isMinor = false,
  locale = "en-US",
): AuthoritativeCurrencyDisplay {
  const code = (currencyCode || "USD").toUpperCase();
  const majorAmount = isMinor ? amountMinorOrMajor / 100 : amountMinorOrMajor;

  // Use Intl.NumberFormat to format with exact currency code
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(majorAmount);

  const formattedAmount = `${formattedNumber} ${code}`;
  const label = `${formattedAmount} (authoritative provider quote)`;
  const ariaLabel = `${formattedNumber} ${code}, authoritative provider quote`;

  return {
    formattedAmount,
    currencyCode: code,
    isAuthoritative: true,
    label,
    ariaLabel,
  };
}

/**
 * Formats an authoritative date/time in the provider-specified timezone,
 * ensuring the timezone is explicitly displayed and not silently shifted to the user's local timezone.
 */
export function formatAuthoritativeDateTime(
  isoDateString: string,
  timezone: string,
  locale = "en-US",
): AuthoritativeDateTimeDisplay {
  const date = new Date(isoDateString);
  const tz = timezone || "UTC";

  let formattedDateTime = date.toISOString();
  let timeZoneName = tz;

  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      timeZone: tz,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
      hour12: true,
    });
    formattedDateTime = formatter.format(date);

    // Extract timezone name string
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    if (tzPart) {
      timeZoneName = `${tz} (${tzPart.value})`;
    }
  } catch {
    formattedDateTime = date.toUTCString();
    timeZoneName = "UTC";
  }

  const ariaLabel = `Scheduled for ${formattedDateTime} in authoritative timezone ${timeZoneName}`;

  return {
    formattedDateTime,
    authoritativeTimezone: tz,
    utcOffset: timeZoneName,
    iso: isoDateString,
    ariaLabel,
  };
}

/**
 * Formats distance (e.g. Uber trip distance).
 * If user prefers miles but provider operates in kilometers,
 * the provider unit is always presented as authoritative.
 */
export function formatAuthoritativeDistance(
  distance: number,
  providerUnit: "km" | "mi",
  userPreferredUnit?: "km" | "mi",
): AuthoritativeDistanceDisplay {
  const provUnit = providerUnit.toLowerCase() as "km" | "mi";
  const userUnit = userPreferredUnit
    ? userPreferredUnit.toLowerCase()
    : provUnit;

  const authFormatted = `${distance.toFixed(2)} ${provUnit}`;

  if (userUnit !== provUnit) {
    const converted =
      provUnit === "km" ? distance * 0.621371 : distance * 1.60934;
    const convFormatted = `${converted.toFixed(2)} ${userUnit}`;
    return {
      authoritativeValue: authFormatted,
      authoritativeUnit: provUnit,
      advisoryConvertedValue: convFormatted,
      label: `${authFormatted} (authoritative) · ~${convFormatted}`,
      ariaLabel: `${authFormatted} authoritative, approximately ${convFormatted} advisory`,
    };
  }

  return {
    authoritativeValue: authFormatted,
    authoritativeUnit: provUnit,
    label: `${authFormatted} (authoritative)`,
    ariaLabel: `${authFormatted} authoritative`,
  };
}

/**
 * Status indicator descriptor ensuring that every status has both:
 * 1. An accessible symbol / text badge (does NOT rely on color alone)
 * 2. An explicit aria-label and status announcement
 */
export function getAccessibleStatusIndicator(state: string): {
  symbol: string;
  text: string;
  badgeTone: "positive" | "warning" | "error" | "accent" | "neutral";
  ariaLabel: string;
} {
  const normalized = state.toLowerCase().replace(/_/g, " ");

  switch (normalized) {
    case "approved":
    case "confirmed":
    case "completed":
    case "passed":
      return {
        symbol: "✓",
        text: "APPROVED / CONFIRMED",
        badgeTone: "positive",
        ariaLabel: "Status: Approved and confirmed",
      };
    case "delivered to channel":
    case "delivered to channel (not confirmed seen)":
      return {
        symbol: "📨",
        text: "DELIVERED TO CHANNEL (NOT CONFIRMED SEEN)",
        badgeTone: "accent",
        ariaLabel: "Status: Delivered to channel, not confirmed seen by human",
      };
    case "pending":
    case "awaiting decision":
    case "queued":
      return {
        symbol: "⏳",
        text: "AWAITING DECISION / PENDING",
        badgeTone: "accent",
        ariaLabel: "Status: Pending decision or action",
      };
    case "expired":
      return {
        symbol: "⚠️",
        text: "EXPIRED",
        badgeTone: "warning",
        ariaLabel: "Status: Expired proposal or session",
      };
    case "superseded":
    case "details changed":
      return {
        symbol: "⊘",
        text: "SUPERSEDED (DETAILS CHANGED)",
        badgeTone: "warning",
        ariaLabel:
          "Status: Superseded, details changed and existing approval voided",
      };
    case "failed":
    case "rejection":
      return {
        symbol: "✕",
        text: "FAILED / REJECTED",
        badgeTone: "error",
        ariaLabel: "Status: Failed or rejected",
      };
    case "unknown":
      return {
        symbol: "❓",
        text: "OUTCOME UNKNOWN",
        badgeTone: "warning",
        ariaLabel: "Status: Outcome unknown, manual verification required",
      };
    case "missed":
      return {
        symbol: "⏰",
        text: "MISSED (WINDOW EXPIRED)",
        badgeTone: "warning",
        ariaLabel: "Status: Reminder missed, delivery window expired",
      };
    default:
      return {
        symbol: "•",
        text: state.toUpperCase(),
        badgeTone: "neutral",
        ariaLabel: `Status: ${state}`,
      };
  }
}
