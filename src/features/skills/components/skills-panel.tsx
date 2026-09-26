"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import {
  Callout,
  EmptyMessage,
  ItemCard,
  Panel,
  QueryContent,
  Tag,
} from "@/components/app";
import {
  AgentPicker,
  resolveAgentKey,
} from "@/features/agents/components/agent-picker";
import { useAgents } from "@/features/agents/queries";
import { errorMessage } from "@/lib/api/http";
import type { SkillListing } from "@/lib/consumer-auth/core-host-client";
import {
  skillQueries,
  useAgentSkillIds,
  useChangeSkill,
  useSetAgentSkill,
  useSkills,
} from "../queries";
import { CreateSkillForm } from "./create-skill-form";
import { SkillReview, type SkillReviewState } from "./skill-review";

function skillStateLabel(skill: SkillListing) {
  if (skill.enabled) return "Enabled";
  return skill.installed_version ? "Disabled" : "Available";
}

export function SkillsPanel({ id }: { id?: string }) {
  const queryClient = useQueryClient();
  const [picked, setPicked] = useState<string | null>(null);
  const agents = useAgents();
  const agentKey = resolveAgentKey(picked, agents.data);
  const skills = useSkills();
  const agentSkillIds = useAgentSkillIds(agentKey);
  const setAgentSkill = useSetAgentSkill();
  const changeSkill = useChangeSkill();
  const [showForm, setShowForm] = useState(false);
  const [review, setReview] = useState<SkillReviewState | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<unknown>(null);
  const [message, setMessage] = useState<string | null>(null);

  const busyId =
    reviewingId ??
    (changeSkill.isPending ? changeSkill.variables?.skillId : undefined) ??
    (setAgentSkill.isPending ? setAgentSkill.variables?.skillId : undefined);
  const failure = changeSkill.error ?? setAgentSkill.error ?? reviewError;

  function clearFeedback() {
    setMessage(null);
    setReviewError(null);
    changeSkill.reset();
    setAgentSkill.reset();
  }

  async function startReview(skill: SkillListing) {
    clearFeedback();
    setReviewingId(skill.id);
    try {
      const versions = [
        ...new Set(
          [skill.installed_version, skill.latest_version].filter(
            (version): version is number => version !== null,
          ),
        ),
      ];
      const loaded = await Promise.all(
        versions.map((version) =>
          queryClient.fetchQuery(skillQueries.version(skill.id, version)),
        ),
      );
      const byVersion = new Map(loaded.map((v) => [v.version, v]));
      setReview({
        skill,
        current: skill.installed_version
          ? (byVersion.get(skill.installed_version) ?? null)
          : null,
        next: byVersion.get(skill.latest_version) ?? loaded[loaded.length - 1],
      });
    } catch (error) {
      setReviewError(error);
    } finally {
      setReviewingId(null);
    }
  }

  function change(
    skill: SkillListing,
    action: "install" | "disable",
    version?: number,
  ) {
    clearFeedback();
    changeSkill.mutate(
      { skillId: skill.id, action, version },
      {
        onSuccess: () => {
          setReview(null);
          setMessage(
            action === "disable"
              ? `${skill.title} is disabled.`
              : `${skill.title} is installed.`,
          );
        },
      },
    );
  }

  function toggleForAgent(skill: SkillListing, enabled: boolean) {
    clearFeedback();
    setAgentSkill.mutate(
      { agentKey, skillId: skill.id, enabled },
      {
        onSuccess: () =>
          setMessage(
            enabled
              ? `${skill.title} is available to ${agentKey}.`
              : `${agentKey} can no longer load ${skill.title}.`,
          ),
      },
    );
  }

  return (
    <Panel
      id={id}
      title="Skills"
      description="Reusable guidance you can install and enable for selected agents. Skills never connect an account or approve an action."
      actions={
        <Button
          size="sm"
          variant={showForm ? "secondary" : "primary"}
          aria-expanded={showForm}
          onClick={() => setShowForm((open) => !open)}
        >
          {showForm ? "Close" : "Create private skill"}
        </Button>
      }
    >
      <AgentPicker value={agentKey} onChange={setPicked} />
      {failure ? (
        <Callout tone="danger" title="Skill error" live="assertive">
          <p>{errorMessage(failure, "Could not update this skill")}</p>
        </Callout>
      ) : message ? (
        <Callout tone="success" title="Skill updated" live="polite">
          <p>{message}</p>
        </Callout>
      ) : null}
      {showForm ? (
        <CreateSkillForm
          onSaved={() => {
            setShowForm(false);
            setMessage(
              "Private skill saved. It has no account access until you grant an agent a capability.",
            );
          }}
        />
      ) : null}
      {review ? (
        <SkillReview
          review={review}
          pending={changeSkill.isPending}
          onInstall={() => change(review.skill, "install", review.next.version)}
          onCancel={() => setReview(null)}
        />
      ) : null}
      <QueryContent
        query={skills}
        loadingLabel="Loading skills"
        errorTitle="Skills could not be loaded"
        isEmpty={(data) => data.length === 0}
        empty={
          <EmptyMessage title="No skills yet">
            Create a private skill or ask your deployment operator to publish a
            curated one.
          </EmptyMessage>
        }
      >
        {(data) => (
          <div className="space-y-3">
            <p className="text-[13px] text-smoke">
              {data.length} available in this Vox context
            </p>
            <div className="grid gap-3 2xl:grid-cols-2">
              {data.map((skill) => {
                const enabledForAgent =
                  agentSkillIds.data?.includes(skill.id) ?? false;
                const busy = busyId === skill.id;
                return (
                  <ItemCard
                    key={skill.id}
                    title={skill.title}
                    subtitle={skill.summary}
                    badges={
                      <Tag tone={skill.enabled ? "positive" : "neutral"}>
                        {skillStateLabel(skill)}
                      </Tag>
                    }
                    actions={
                      skill.enabled && !skill.update_available ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={busy}
                          onClick={() => change(skill, "disable")}
                        >
                          Disable
                        </Button>
                      ) : skill.installed_version && !skill.update_available ? (
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            change(
                              skill,
                              "install",
                              skill.installed_version ?? undefined,
                            )
                          }
                        >
                          Enable
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={() => void startReview(skill)}
                        >
                          {reviewingId === skill.id
                            ? "Loading…"
                            : skill.update_available
                              ? "Review update"
                              : "Review and install"}
                        </Button>
                      )
                    }
                    footer={
                      <>
                        <span>
                          {skill.curated ? "Curated" : "Private"} · v
                          {skill.installed_version ?? skill.latest_version}
                          {skill.update_available
                            ? ` · v${skill.latest_version} available`
                            : ""}
                        </span>
                        {skill.enabled && agentKey ? (
                          <span className="flex items-center gap-2">
                            <span>
                              {enabledForAgent
                                ? `${agentKey} can load this skill`
                                : `${agentKey} cannot load this skill`}
                            </span>
                            <Button
                              variant="secondary"
                              size="xs"
                              disabled={busy || !agentSkillIds.data}
                              onClick={() =>
                                toggleForAgent(skill, !enabledForAgent)
                              }
                            >
                              {enabledForAgent
                                ? `Remove from ${agentKey}`
                                : `Enable for ${agentKey}`}
                            </Button>
                          </span>
                        ) : null}
                      </>
                    }
                  />
                );
              })}
            </div>
          </div>
        )}
      </QueryContent>
    </Panel>
  );
}
