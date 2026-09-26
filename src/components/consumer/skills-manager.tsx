"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Field, Notice, Row, Stack, Text, TextArea } from "@/components/ui";
import type { SkillListing, SkillVersion } from "@/lib/consumer-auth/core-host-client";

export function SkillsManager() {
  const [skills, setSkills] = useState<SkillListing[]>([]);
  const [agentKey, setAgentKey] = useState("");
  const [agents, setAgents] = useState<Array<{ external_key: string; purpose: string }>>([]);
  const [agentSkillIds, setAgentSkillIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [review, setReview] = useState<{
    skill: SkillListing;
    current: SkillVersion | null;
    next: SkillVersion;
  } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [key, setKey] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [instructions, setInstructions] = useState("");
  const [capabilities, setCapabilities] = useState("");

  async function refresh() {
    const response = await fetch("/api/account/skills", { cache: "no-store" });
    if (!response.ok) throw new Error("Skills are unavailable right now");
    const body = (await response.json()) as { skills: SkillListing[] };
    setSkills(body.skills);
  }

  async function refreshAgent(key: string) {
    const response = await fetch(`/api/account/skills/agents/${encodeURIComponent(key)}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Unable to load skills for ${key}`);
    const body = (await response.json()) as { skills: Array<{ id: string }> };
    setAgentSkillIds(body.skills.map((skill) => skill.id));
  }

  useEffect(() => {
    void Promise.resolve().then(refresh).catch((cause) => {
      setError(cause instanceof Error ? cause.message : "Unable to load skills");
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void fetch("/api/account/agents", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load agents");
        return response.json() as Promise<{ agents: Array<{ definition: { external_key: string; purpose: string } }> }>;
      })
      .then((body) => {
        const selected = body.agents.map((agent) => agent.definition);
        setAgents(selected);
        setAgentKey((current) => current || selected[0]?.external_key || "");
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load agents"));
  }, []);

  useEffect(() => {
    if (!agentKey) return;
    void Promise.resolve().then(() => refreshAgent(agentKey)).catch((cause) => {
      setError(cause instanceof Error ? cause.message : "Unable to load agent skills");
    });
  }, [agentKey]);

  async function changeAgentSkill(skill: SkillListing, enabled: boolean) {
    setBusyId(skill.id);
    setError(null);
    try {
      const response = await fetch(`/api/account/skills/agents/${encodeURIComponent(agentKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill_id: skill.id, enabled }),
      });
      if (!response.ok) throw new Error(`Could not update ${agentKey}'s access to this skill`);
      if (agentKey) await refreshAgent(agentKey);
      setMessage(enabled ? `${skill.title} is available to ${agentKey}.` : `${agentKey} can no longer load ${skill.title}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update agent skill");
    } finally {
      setBusyId(null);
    }
  }

  async function change(skill: SkillListing, action: "install" | "disable", version?: number) {
    setBusyId(skill.id);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/account/skills/${encodeURIComponent(skill.id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, version }),
      });
      if (response.status === 409) throw new Error("This skill changed since you reviewed it. Review the new version before installing.");
      if (!response.ok) throw new Error("Could not update this skill");
      await refresh();
      if (agentKey) await refreshAgent(agentKey);
      setReview(null);
      setMessage(action === "disable" ? `${skill.title} is disabled.` : `${skill.title} is installed.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update this skill");
    } finally {
      setBusyId(null);
    }
  }

  async function reviewInstall(skill: SkillListing) {
    setBusyId(skill.id);
    setError(null);
    try {
      const versions = [skill.installed_version, skill.latest_version]
        .filter((version): version is number => version !== null)
        .map((version) => fetch(`/api/account/skills/${encodeURIComponent(skill.id)}/versions/${version}`));
      const responses = await Promise.all(versions);
      if (responses.some((response) => !response.ok)) throw new Error("Unable to load skill details");
      const payloads = await Promise.all(responses.map((response) => response.json() as Promise<{ skill: SkillVersion }>));
      setReview({
        skill,
        current: skill.installed_version ? payloads[0].skill : null,
        next: payloads[payloads.length - 1].skill,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to review skill");
    } finally {
      setBusyId(null);
    }
  }

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setBusyId("new");
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/account/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          external_key: key.trim(),
          title: title.trim(),
          summary: summary.trim(),
          instructions: instructions.trim(),
          requested_capabilities: capabilities.split(",").map((part) => part.trim()).filter(Boolean),
          resources: {},
        }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Could not save skill");
      }
      await refresh();
      setShowForm(false);
      setKey(""); setTitle(""); setSummary(""); setInstructions(""); setCapabilities("");
      setMessage("Private skill saved. It has no account access until you grant an agent a capability.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save skill");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card title="Skills" description="Reusable guidance you can install and enable for selected agents. Skills never connect an account or approve an action." tone="soft">
      <Stack gap="normal">
        <Row>
          <Text muted>Choose an agent:</Text>
          {agents.map((agent) => (
            <Button key={agent.external_key} variant={agentKey === agent.external_key ? "primary" : "secondary"} onClick={() => setAgentKey(agent.external_key)} aria-pressed={agentKey === agent.external_key} title={agent.purpose}>{agent.external_key}</Button>
          ))}
          {agents.length === 0 && <Text muted>No agents selected for this deployment.</Text>}
        </Row>
        <Row spread>
          <Text muted>{skills.length} available in this Vox context</Text>
          <Button variant={showForm ? "secondary" : "primary"} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Close" : "Create private skill"}
          </Button>
        </Row>
        {error && <Notice title="Skill error" tone="error"><span role="alert">{error}</span></Notice>}
        {message && <Notice title="Skill updated" tone="success"><span role="status">{message}</span></Notice>}
        {showForm && (
          <form onSubmit={create} className="p-4 bg-ink border border-border-edge rounded-lg space-y-4">
            <Field id="skill-key" label="Skill key" hint="Lowercase letters, numbers and hyphens" value={key} onChange={(event) => setKey(event.target.value)} pattern="[a-z0-9-]+" maxLength={128} required />
            <Field id="skill-title" label="Name" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required />
            <Field id="skill-summary" label="What should this help with?" value={summary} onChange={(event) => setSummary(event.target.value)} maxLength={500} required />
            <TextArea id="skill-instructions" label="Instructions for the agent" hint="Describe the reusable process. Keep credentials out of skill content." value={instructions} onChange={(event) => setInstructions(event.target.value)} maxLength={16384} rows={8} required />
            <Field id="skill-capabilities" label="Tools this skill may need" hint="Optional capability keys, separated by commas. This request does not grant access." value={capabilities} onChange={(event) => setCapabilities(event.target.value)} />
            <Button type="submit" variant="primary" disabled={busyId === "new"}>{busyId === "new" ? "Saving…" : "Save skill"}</Button>
          </form>
        )}
        {loading && <Text muted>Loading skills…</Text>}
        {!loading && skills.length === 0 && <Text muted>No skills yet. Create a private skill or ask your deployment operator to publish a curated one.</Text>}
        {skills.map((skill) => (
          <div key={skill.id} className="p-4 bg-ink border border-border-edge rounded-lg space-y-3">
            <Row spread>
              <div>
                <strong className="text-pure-white">{skill.title}</strong>
                <p className="text-sm text-ash">{skill.summary}</p>
              </div>
              <Badge tone={skill.enabled ? "positive" : "neutral"}>{skill.enabled ? "Enabled" : skill.installed_version ? "Disabled" : "Available"}</Badge>
            </Row>
            {skill.enabled && agentKey && (
              <Row spread>
                <Text muted>{agentSkillIds.includes(skill.id) ? `${agentKey} can load this skill` : `${agentKey} cannot load this skill`}</Text>
                <Button variant="secondary" disabled={busyId === skill.id} onClick={() => changeAgentSkill(skill, !agentSkillIds.includes(skill.id))}>
                  {agentSkillIds.includes(skill.id) ? `Remove from ${agentKey}` : `Enable for ${agentKey}`}
                </Button>
              </Row>
            )}
            <Row spread>
              <Text muted>{skill.curated ? "Curated" : "Private"} · v{skill.installed_version ?? skill.latest_version}{skill.update_available ? ` · v${skill.latest_version} available` : ""}</Text>
              {skill.enabled && !skill.update_available ? (
                <Button variant="secondary" disabled={busyId === skill.id} onClick={() => change(skill, "disable")}>Disable</Button>
              ) : skill.installed_version && !skill.update_available ? (
                <Button variant="primary" disabled={busyId === skill.id} onClick={() => change(skill, "install", skill.installed_version ?? undefined)}>Enable</Button>
              ) : (
                <Button variant="primary" disabled={busyId === skill.id} onClick={() => reviewInstall(skill)}>{skill.update_available ? "Review update" : "Review and install"}</Button>
              )}
            </Row>
          </div>
        ))}
        {review && (
          <section aria-label={`Review ${review.skill.title}`} className="p-4 bg-obsidian border border-border-edge rounded-lg space-y-4">
            <div>
              <h3 className="text-pure-white font-semibold">Review {review.skill.title} v{review.next.version}</h3>
              <p className="text-sm text-ash">Requested tools are requirements, not permission. Only tools you grant to an agent can be used.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {review.current && (
                <div>
                  <h4 className="text-sm text-mist">Installed v{review.current.version}</h4>
                  <pre className="text-xs whitespace-pre-wrap break-words text-ash">{review.current.instructions}</pre>
                  <pre className="text-xs whitespace-pre-wrap break-words text-ash">{JSON.stringify(review.current.resources, null, 2)}</pre>
                </div>
              )}
              <div>
                <h4 className="text-sm text-mist">New v{review.next.version}</h4>
                <pre className="text-xs whitespace-pre-wrap break-words text-ash">{review.next.instructions}</pre>
                <pre className="text-xs whitespace-pre-wrap break-words text-ash">{JSON.stringify(review.next.resources, null, 2)}</pre>
              </div>
            </div>
            <Text muted>Requested tools: {review.next.requested_capabilities.join(", ") || "None"}{review.current ? ` (previous: ${review.current.requested_capabilities.join(", ") || "none"})` : ""}</Text>
            <Row>
              <Button variant="primary" disabled={busyId === review.skill.id} onClick={() => change(review.skill, "install", review.next.version)}>Install v{review.next.version}</Button>
              <Button variant="ghost" onClick={() => setReview(null)}>Cancel</Button>
            </Row>
          </section>
        )}
      </Stack>
    </Card>
  );
}
