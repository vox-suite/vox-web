"use client";

import { useState, type FormEvent } from "react";
import { Button, Field } from "@/components/ui";
import {
  Callout,
  EmptyMessage,
  ItemCard,
  Labelled,
  ListSkeleton,
  MetaList,
  Panel,
  StatusBadge,
  Tag,
} from "@/components/app";
import { useAccount } from "@/components/app-shell/account-context";
import { errorMessage } from "@/lib/api/http";
import type { LodgingProperty } from "@/lib/consumer-auth/core-host-client";
import { formatAuthoritativeCurrency } from "@/lib/global-formatting";
import type { LodgingSearch } from "../api";
import { useBookLodging, useCancelLodging, useLodgingSearch } from "../queries";

function Money({ minor, currency }: { minor: number; currency: string }) {
  const amount = formatAuthoritativeCurrency(minor, currency, true);
  return (
    <strong>
      <Labelled label={amount.ariaLabel}>{amount.formattedAmount}</Labelled>
    </strong>
  );
}

function getUpcomingDates() {
  const now = new Date();
  const inDate = new Date(now.getTime() + 86400000 * 7);
  const outDate = new Date(now.getTime() + 86400000 * 11);
  return {
    checkIn: inDate.toISOString().slice(0, 10),
    checkOut: outDate.toISOString().slice(0, 10),
  };
}

export function LodgingWrite({ connectionId }: { connectionId: string }) {
  const account = useAccount();
  const upcoming = getUpcomingDates();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState(upcoming.checkIn);
  const [checkOut, setCheckOut] = useState(upcoming.checkOut);
  const [occupancy, setOccupancy] = useState(2);
  const [guestName, setGuestName] = useState(account.name || "");
  const [search, setSearch] = useState<LodgingSearch | null>(null);
  const [selected, setSelected] = useState<LodgingProperty | null>(null);
  const results = useLodgingSearch(search);
  const book = useBookLodging();
  const cancel = useCancelLodging();
  const booking = book.data
    ? {
        ...book.data,
        status: cancel.isSuccess ? ("cancelled" as const) : book.data.status,
      }
    : null;

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setSelected(null);
    book.reset();
    cancel.reset();
    setSearch({ connectionId, destination, checkIn, checkOut, occupancy });
  }

  function confirmBooking(property: LodgingProperty) {
    book.mutate({
      connection_id: connectionId,
      booking_request: {
        property_id: property.property_id,
        rate_plan_id:
          property.available_rate_plans[0]?.rate_plan_id || "rate_standard",
        guest_name: guestName.trim() || account.name || "Guest",
        check_in: checkIn,
        check_out: checkOut,
        total_amount_minor: property.price_amount_minor,
        currency: property.currency,
      },
    });
  }

  const failure = results.error ?? book.error ?? cancel.error;

  return (
    <Panel
      title="Selected consequential write: Expedia Rapid lodging (L3)"
      description="End-to-end consequential execution: rate quote binding, payment authorization distinct from completion, and verified cancellation."
    >
      <form
        onSubmit={submitSearch}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:items-end"
      >
        <Field
          id="lodging-destination"
          label="Destination"
          placeholder="e.g. Seattle, WA"
          className="min-w-0"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          required
        />
        <Field
          id="lodging-check-in"
          label="Check-in date"
          type="date"
          value={checkIn}
          onChange={(event) => setCheckIn(event.target.value)}
          required
        />
        <Field
          id="lodging-check-out"
          label="Check-out date"
          type="date"
          value={checkOut}
          onChange={(event) => setCheckOut(event.target.value)}
          required
        />
        <div className="flex items-end gap-2">
          <Field
            id="lodging-occupancy"
            label="Guests"
            type="number"
            min={1}
            max={8}
            className="w-20"
            value={occupancy}
            onChange={(event) => setOccupancy(Number(event.target.value) || 1)}
            required
          />
          <Button
            type="submit"
            disabled={results.isFetching}
            className="flex-1"
          >
            {results.isFetching ? "Searching…" : "Search"}
          </Button>
        </div>
      </form>
      {failure ? (
        <Callout tone="danger" title="Journey notice" live="assertive">
          <p>{errorMessage(failure)}</p>
        </Callout>
      ) : null}

      {booking ? (
        <ItemCard
          title={`Expedia confirmation: ${booking.expedia_booking_ref}`}
          badges={<StatusBadge status={booking.status} />}
          actions={
            booking.status === "confirmed" ? (
              <Button
                variant="danger"
                size="sm"
                disabled={cancel.isPending}
                aria-label={`Cancel Expedia booking: ${booking.expedia_booking_ref}`}
                onClick={() =>
                  cancel.mutate({
                    bookingId: booking.booking_id,
                    connectionId,
                    reason: "User requested itinerary change",
                  })
                }
              >
                {cancel.isPending
                  ? "Processing cancellation…"
                  : "Cancel booking & refund"}
              </Button>
            ) : null
          }
        >
          <MetaList
            items={[
              {
                label: "Dates",
                value: `${booking.check_in} to ${booking.check_out}`,
              },
              {
                label: "Settled total",
                value: (
                  <Money
                    minor={booking.total_amount_minor}
                    currency={booking.currency}
                  />
                ),
              },
            ]}
          />
          {cancel.isSuccess ? (
            <Callout tone="success" title="Cancellation verified" live="polite">
              <p>
                Booking {cancel.data.expedia_booking_ref} cancelled by Expedia.
                Refund of{" "}
                <Money
                  minor={cancel.data.refund_amount_minor}
                  currency={cancel.data.currency}
                />{" "}
                confirmed.
              </p>
            </Callout>
          ) : (
            <Callout tone="success" live="polite">
              <p>
                Booking confirmed by Expedia. Reference:{" "}
                {booking.expedia_booking_ref}
              </p>
            </Callout>
          )}
        </ItemCard>
      ) : selected ? (
        <ItemCard
          title={`Step 2: payment escrow & proposal approval · ${selected.name}`}
          badges={<Tag tone="info">🔒 Payment held in escrow</Tag>}
          actions={
            <Button
              size="sm"
              disabled={book.isPending}
              aria-label={`Confirm consequential booking for ${selected.name}`}
              onClick={() => confirmBooking(selected)}
            >
              {book.isPending
                ? "Submitting to Expedia…"
                : "Confirm consequential booking (L3)"}
            </Button>
          }
        >
          <Callout
            tone="warning"
            title="Payment authorization is not completion"
          >
            <p>
              Authorizing a payment hold reserves funds but does not guarantee
              room inventory until the provider returns a confirmed booking
              reference.
            </p>
          </Callout>
          <div className="my-4 max-w-sm">
            <Field
              id="lodging-guest-name"
              label="Guest name"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              placeholder="Account holder name"
            />
          </div>
          <MetaList
            items={[
              {
                label: "Amount",
                value: (
                  <Money
                    minor={selected.price_amount_minor}
                    currency={selected.currency}
                  />
                ),
              },
              {
                label: "Policy",
                value: "Full refund if cancelled 48h prior to check-in.",
              },
            ]}
          />
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
            Choose a different property
          </Button>
        </ItemCard>
      ) : search === null ? (
        <EmptyMessage title="Search to begin">
          Search a destination to see verified properties and authoritative
          provider quotes.
        </EmptyMessage>
      ) : results.isPending ? (
        <ListSkeleton label="Searching properties" />
      ) : results.data ? (
        <div className="space-y-3">
          <p role="status" className="text-[13px] text-smoke">
            Found {results.data.properties.length} lodging properties in{" "}
            {search.destination}.
          </p>
          <div className="grid gap-3 xl:grid-cols-2">
            {results.data.properties.map((property) => (
              <ItemCard
                key={property.property_id}
                title={property.name}
                subtitle={`${property.location} · ${property.star_rating} stars`}
                actions={
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label={`Authorize booking proposal for ${property.name}`}
                    onClick={() => {
                      book.reset();
                      setSelected(property);
                    }}
                  >
                    Authorize booking proposal
                  </Button>
                }
                footer={
                  <span>
                    Rate:{" "}
                    <Money
                      minor={property.price_amount_minor}
                      currency={property.currency}
                    />{" "}
                    (authoritative provider quote)
                  </span>
                }
              />
            ))}
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
