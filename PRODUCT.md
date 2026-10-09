# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Individual professionals — founders, executives, consultants — with high decision volume. Primary job: untangle a busy day, make decisions durable, and keep commitments moving without opening another app. They reach for Vox in moments between meetings, during commutes, or any time typing is impractical.

## Product Purpose

Vox is a voice-first assistant reachable by phone call or WhatsApp. Users call to organize their day, delegate follow-ups, and put decisions into motion. Vox keeps work moving after the conversation ends: creating tasks, updating calendars, scheduling reminders, and placing outbound follow-ups when a commitment changes or a deadline arrives.

## Positioning

You call Vox on a real phone number. It completes and tracks work after the call ends — tasks, calendar changes, scheduled follow-ups — and reaches back out when something needs attention. No competing AI assistant can truthfully claim both the phone-native interface and the durable follow-through that outlasts the conversation.

## Operating Context

Users call from a mobile phone or send WhatsApp messages. Sessions are short and interruptible; the user may pause, correct themselves, or hand the phone to someone else. Conversations span days and weeks — Vox carries projects, preferences, and prior decisions across calls and channels. Voice biometrics help keep personal context attached to the right speaker when handoffs occur.

## Capabilities and Constraints

- **Phone calls** via real phone number with fast openings and streaming speech
- **WhatsApp** as a secondary channel for the same continuous context
- **Tasks** created and updated through conversation
- **Calendar** plans and changes through conversation
- **Reminders and follow-ups** scheduled during or after a call
- **Outbound calls** placed by Vox when a deadline arrives or a commitment changes
- **Speaker recognition** via voice biometrics to maintain per-identity context
- **Audit trail** for consequential actions with durable status updates
- Stack: Next.js 16 (App Router), React 19, Tailwind CSS v4, Supabase Auth, TypeScript, thinking-orbs

## Brand Commitments

- **Name:** Vox — fixed.
- **No fabricated social proof:** no invented testimonials, fake customer logos, or unverified benchmarks anywhere on the site; copy must be provably true.

## Evidence on Hand

- Changelog entries in `src/components/changelog/changelog-data.ts` are the authoritative shipped-feature record.
- Marketing sections (`src/components/marketing/sections.tsx`) contain current positioning copy.
- No external press, case studies, or testimonials on file.

## Product Principles

1. **Conversation is the interface.** The product is a phone call — no new app, no dashboard required, no learning curve.
2. **Follow-through is the promise.** A useful assistant keeps work moving after the conversation ends; passive recall is not enough.
3. **Trust is earned by explicitness.** Consequential actions are confirmed, scoped, and leave a durable record. Status is a prompt to verify, not a guarantee.
4. **Identity protects context.** Speaker recognition keeps personal work attached to the right person, including during handoffs.
5. **No invented claims.** Copy reflects only what the product demonstrably does.
