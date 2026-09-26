import { ApiError, apiRequest } from "@/lib/api/http";
import type {
  EffectiveSkill,
  PublishSkillRequest,
  SkillListing,
  SkillVersion,
} from "@/lib/consumer-auth/core-host-client";

export async function listSkills(signal?: AbortSignal) {
  const { skills } = await apiRequest<{ skills: SkillListing[] }>(
    "/api/account/skills",
    { signal, fallbackError: "Skills are unavailable right now" },
  );
  return skills;
}

export async function getSkillVersion(
  skillId: string,
  version: number,
  signal?: AbortSignal,
) {
  const { skill } = await apiRequest<{ skill: SkillVersion }>(
    `/api/account/skills/${encodeURIComponent(skillId)}/versions/${version}`,
    { signal, fallbackError: "Unable to load skill details" },
  );
  return skill;
}

export async function listAgentSkillIds(
  agentKey: string,
  signal?: AbortSignal,
) {
  const { skills } = await apiRequest<{ skills: EffectiveSkill[] }>(
    `/api/account/skills/agents/${encodeURIComponent(agentKey)}`,
    { signal, fallbackError: `Unable to load skills for ${agentKey}` },
  );
  return skills.map((skill) => skill.id);
}

export async function setAgentSkill(input: {
  agentKey: string;
  skillId: string;
  enabled: boolean;
}) {
  await apiRequest<null>(
    `/api/account/skills/agents/${encodeURIComponent(input.agentKey)}`,
    {
      method: "POST",
      body: { skill_id: input.skillId, enabled: input.enabled },
      fallbackError: `Could not update ${input.agentKey}'s access to this skill`,
    },
  );
}

export type SkillAction = "install" | "disable";

export async function changeSkill(input: {
  skillId: string;
  action: SkillAction;
  version?: number;
}) {
  try {
    await apiRequest<null>(
      `/api/account/skills/${encodeURIComponent(input.skillId)}`,
      {
        method: "POST",
        body: { action: input.action, version: input.version },
        fallbackError: "Could not update this skill",
      },
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      throw new ApiError(
        "This skill changed since you reviewed it. Review the new version before installing.",
        409,
        error.body,
      );
    }
    throw error;
  }
}

export async function publishSkill(input: PublishSkillRequest) {
  const { skill } = await apiRequest<{ skill: SkillListing }>(
    "/api/account/skills",
    { method: "POST", body: input, fallbackError: "Could not save skill" },
  );
  return skill;
}
