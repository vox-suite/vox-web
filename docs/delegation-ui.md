# Personal Assistant and specialist permission interface

Ordinary home conversation uses the owned default Personal Assistant. It does not
inherit the Library's agent selection. Library still supports testing/configuring
an individual specialist without redefining normal chat.

When ordinary chat needs specialist access, Core creates a durable root task before
requesting consent and returns its public projection in the conversation response's
optional `task` field. Chat shows that task's named specialist request and requested
account/tool references. Once consent binds to the returned run; remembered consent
remains explicitly separate. Saving consent sends an authenticated clarification
reply to resume the same saved task. Chat refreshes authoritative status by that task
ID and removes stale consent after continuation. Reload recovery uses Saved tasks,
without searching task titles or inferring authority from model text.

Tasks presents authenticated Core state and a specialist permission form. The user
chooses the requesting assistant, specialist, exact connected accounts/tools and
optional nonsensitive saved-preference keys. Discovery exposes no preference values.

- **Once for this task:** binds permission to the selected current root run; Core
  allows one specialist handoff and reports whether the permission was used.
- **Remember for future tasks:** remains within the selected account/tool/preference
  scope and can be revoked. It does not grant the requester direct account access.
- **Revocation:** invalidates further use of the permission. It does not claim undo.
- **Stop all tasks:** stops future work across the authenticated user context,
  including specialist descendants. It does not undo already dispatched changes.

The UI uses named assistants, integration/account labels and tool names. It sends
capability references to Core, never declaration or preference digests as authority.
Core resolves current permissions, snapshots and limits. Changed grants,
declarations or selected preferences can invalidate prior consent; exact consequential
calls still require their own proposal-bound approval. Private memories and whole
transcripts are not shared by this form.

Public tasks include `parent_task_id` and `root_task_id`; task cards show the parent
title when present in loaded pages and disclose when the parent is an earlier saved
task. Activity counts explicitly cover loaded pages; Stop all applies to all current
tasks in the account. Active specialist waits refresh from Core. No browser-only
started-task index is used.

## Contracts and verification

This feature requires the Core signed-host endpoints:

- `/v1/conversations/respond` with the optional public `task` projection
- `/v1/delegation-scopes`
- `/v1/delegation-permissions`, `/query`, `/{id}/revoke`
- `/v1/durable-tasks/stop-all`
- durable-task query with lineage fields and `specialist` wait reason

All mutations independently authenticate the session and reject foreign or missing
origins. Discovery and permission listing use authenticated private, uncached reads.
Core remains the ownership and capability authority.

Run unit, lint, build and consumer browser suites. Browser fixtures exercise the
actual Web routes, Supabase SDK and signed-host client; they simulate Core worker
state transitions and do not certify deployed routing or provider availability.
The held Web stack additionally requires its configured Supabase identity-pin hook
and live signed-in Web → Core verification before release.
