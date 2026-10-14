# Website navigation and Timeline page draft

Draft for review, 14 October 2026. No website implementation is included.

## Navigation plan

Vox logo links home. Desktop header: Timeline, Insights, Projects, Downloads, followed by Join the waitlist. Mobile uses the same labels and order in a menu with a visible waitlist action. Each feature item navigates to its own page; homepage section anchors leave the global header. Use aria-current on the active route.

Proposed routes: /timeline, /insights, /projects, /downloads. The user confirmed public-download builds for Windows, Mac and Android. Downloads will offer a separate action for each platform. Actual download URLs, supported OS versions and installer formats still need verification before implementation. Keep development disclosures accurate and retain the waitlist as a secondary action for updates.

Homepage job: explain Vox overall and link into feature detail. Timeline job: show how connected information becomes an inspectable day-by-day record. Insights owns charts, totals and comparisons. Projects owns its source-backed project context and workflows. The Timeline page links to Insights instead of explaining analytics at length.

## Timeline page copy

### Hero

**Your days, brought together.**

Receipts, meetings, music and places become a day-by-day record from the accounts and files you connect. Browse what happened, open the details, and see where each entry came from.

Primary action: **Download Vox** (links to /downloads)

Secondary action: **See a day in Timeline**

Microcopy: Vox is in development. These previews use illustrative data.

Visual: one readable Day view with a meeting, a confirmed purchase and a music play. Show their times and source names. Use an imported visit only if its import origin is visible.

### The details arrive from your connected sources

**A receipt becomes a purchase. A meeting keeps its time.**

Vox turns information from supported accounts into dated entries. Receipts and bills come from Gmail. Appointments come from Google Calendar. Music, gaming and imported history add context to the same day.

Start with the accounts you want to connect. Add older information through supported imports when you need it.

Visual: a source email and the resulting purchase entry, visibly connected. Keep the source text readable.

### Browse at the scale you need

**Look back at an hour, a week or a month.**

**Day:** Follow events through the hours. Entries show a duration when the source provides one.

**Week:** Review the days together and open the details that matter.

**Month:** See which days have events and which categories appear. Select a day to explore it.

Choose a date range or filter Finance, Activity, Entertainment, Work and Personal to narrow the view.

Visual: user-controlled Day, Week and Month previews. Explain each view beside its image; avoid timer-driven changes.

### Sources and precision

**Open an entry. Check the facts.**

Each entry shows its details and the sources behind it. A purchase can show its amount and merchant; a visit can show its place and duration.

When a source provides only a date, Timeline says so. PlayStation activity is labeled as an observation because the provider does not give exact session times.

Matching bank transactions found in an email and a statement can be merged into one entry with their evidence kept together.

Visual: an entry detail with visible source evidence and a separate date-precision example.

### Voice

**Say what you want to see.**

“Show my spending last week.”

Ask Vox to open Timeline filtered to spending and the dates you named. Narrow the request to a merchant when you need a closer look.

For charts, totals and comparisons, continue to Insights.

Link: **Explore Insights** (publish when the destination exists).

Visual: the request followed by the matching spending-filter bar and entries. Label the example as illustrative.

### Supported sources

**Connect what you use. Know what it adds.**

| Source | What appears in Timeline |
|---|---|
| Gmail | Supported receipts, bills, bank alerts, orders and appointments; transactions from supported PDF attachments |
| Google Calendar | Meetings and appointments |
| Spotify | Recent plays available from the provider |
| PlayStation | Observed increases in game activity, with timing limits shown |
| YouTube | Likes and playlist additions from the API; watched videos from an uploaded Takeout export |
| Google Maps Timeline | Visits and travel from an uploaded history export |
| Swiggy | Supported order and delivery updates with provider timestamps |

Coverage depends on the source. Recent activity and uploaded exports may cover only part of your history.

### Privacy and account controls

**Choose what enters Timeline. Choose what Vox can read.**

Each connected account has separate controls for adding information to Timeline and allowing assistant access. Pause either whenever you need to.

Disconnecting removes the stored credentials. Entries already added to Timeline remain there.

Visual: the two independent account switches. Show pause and disconnect as distinct actions.

### FAQ

**Does Timeline contain my complete history?**
It contains what supported sources provide. Spotify has a recent-play window, PlayStation reports cumulative activity, and imported exports reflect the data in that file.

**Can I bring in older information?**
You can review and import older Gmail messages from a chosen date range. Supported Google Takeout uploads add YouTube watch history and Google Maps Timeline history.

**Will the same purchase appear twice?**
Matching financial records can be merged so an email and a statement do not count the same purchase separately. Their source evidence stays attached.

**Does disconnecting an account erase its entries?**
Disconnecting deletes its stored credentials. Existing Timeline entries are retained.

**Where can I view Timeline?**
You can view Timeline in Vox on Windows, Mac and Android. Visit Downloads to choose your platform.

### Closing invitation

**Bring your days into view.**

Get Vox for Windows, Mac or Android and connect the accounts you want in your Timeline.

Action: **Download Vox** (links to /downloads)

Secondary action: Join the waitlist for updates. Final wording must match the actual email-signup behavior.

## Search metadata

Title: Timeline | Your days, brought together | Vox

Description: Explore Vox Timeline: a day-by-day record from connected accounts and imported history, with day, week and month views, source evidence and account controls.

Alternative hero: **A record of your day, with the sources behind it.** Stronger provenance emphasis; less concise than the recommended headline.

## Evidence and open decisions

Primary source: ../../vox-core/docs/timeline.md, especially sections 1–5 and 10–12. Reviewed against desktop timeline-header.tsx, timeline/filters.ts, desktop-control/execute.ts and Core agents/tools/timeline.rs. This is source review, not a new live-provider validation.

The user confirmed Insights as the navigation label and vox-core/docs/timeline.md as the requested reference document.

Windows, Mac and Android download availability is confirmed by the user. Verify download destinations and OS requirements before wiring buttons. Confirm whether the hero should emphasize everyday recall, spending, or provenance. Keep published promises bounded by provider coverage. Do not promise complete history, live GPS, SMS capture, health data, full Spotify history or API-based YouTube watch history.
