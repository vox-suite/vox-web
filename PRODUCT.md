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
- **Connected accounts** (Google Calendar, Spotify, YouTube history import, PlayStation, Swiggy, SMS, Philips WiZ lights) feeding a personal timeline
- **Timeline** of spans across desktop and Android, with a per-entry side panel
- **One account per person** across desktop, Android and phone, unified by verified email
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

## Recent Changes (28 Sep – 6 Oct 2026)

### Identity and accounts
- Phone verification via WhatsApp code (Twilio), E.164 numbers with country code, mandatory with "Verify later" restored; guest data merges only after OTP.
- One Vox user per verified email: desktop (Supabase) and Android sign in to the same user; `merge_user_accounts` runs at sign-in. The existing duplicate account was merged in production.
- Android signs in through Supabase; API caches Google JWKS and skips signup transactions for known users.
- Scoped short-lived web tokens and WebSocket subprotocol auth.

### Connections
- Native Connections replace the MCP runtime; vox-connections is a standalone HMAC-authenticated service with encrypted credentials.
- Spotify: timeline-only listening history (last 50 tracks; no playlists, no podcasts), brand colour and icon, cover art on hover.
- YouTube: Takeout watch-history import (chunked, progress, up to 20,000 records per import), button reads "Sync".
- PlayStation: NPSSO connect, first sync on connect, 30-minute sync; sessions are estimates from totals spread evenly (flagged `estimated`), cover art, no title prefix.
- Swiggy enabled by default per the signed agreement (Swiggy and Zomato split into separate modules; Swiggy MCP allowlisting pending). Zomato still present.
- Philips WiZ: link-based setup, remote relay, colour and colour-temperature control as an agent tool.
- SMS: first sync takes the latest 256 messages; one-off "last 3 months" sync; 256-day retention.
- Branded OAuth callback page; refresh runs in a detached task so dropped requests cannot orphan the sync lease; failed refreshes are logged and a running sync returns a clear message.

### Timeline and spans (desktop and Android)
- Quarter-hour grid (96 slots, taller rows) with icon-only entries in flex rows; chips get their own lane beside overlapping blocks.
- Brand colours and icons per source; hover cards with cover, subtitle and time for Spotify, YouTube and PlayStation; estimated sessions shown dashed.
- Entry side panel with glow, cover wash, editable title, calendar date/time picker, provider-managed info tooltip, close on outside click.
- Desktop window: rounded sidebar, whole left panel drags the window, error boundary fixes the blank window after connecting.
- Android ports the desktop look natively, drops the "+" button, and shows all connectors.
- Categories and colours from the shared 24-slot OKLCH schema tokens; Pulse board view, Spaces canvas with live updates.

### Voice, channels and agents
- Local Whisper removed; PCM streams to the server. ElevenLabs Eleven v4 Turbo for TTS, Sarvam and Cartesia removed, AssemblyAI for STT, speculation endpoint removed.
- Governed specialist delegation, assigned tasks with durable recovery, event agent decisions, verified-email notifier with caps.

### Platform and deploy
- Railway deploys for core-api, core-worker and bridge; edge routing checks; secret sync fails closed; worker and jobs sweepers run independently; OpenAPI contract generated for spans.
- Database advisor findings cleared; bulk upserts for personal activity.

### Website
- Cinematic landing page redesign, dark-only calm theme, Connectors page, privacy policy and terms pages, admin console removed.

