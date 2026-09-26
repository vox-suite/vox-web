import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  changeSkill,
  getSkillVersion,
  listAgentSkillIds,
  listSkills,
  publishSkill,
  setAgentSkill,
} from "./api";

export const skillKeys = {
  all: ["skills"] as const,
  list: () => [...skillKeys.all, "list"] as const,
  versions: () => [...skillKeys.all, "version"] as const,
  version: (skillId: string, version: number) =>
    [...skillKeys.versions(), skillId, version] as const,
  agents: () => [...skillKeys.all, "agent"] as const,
  agent: (agentKey: string) => [...skillKeys.agents(), agentKey] as const,
};

export const skillQueries = {
  list: () =>
    queryOptions({
      queryKey: skillKeys.list(),
      queryFn: ({ signal }) => listSkills(signal),
    }),
  /** Published skill versions are immutable, so they never go stale. */
  version: (skillId: string, version: number) =>
    queryOptions({
      queryKey: skillKeys.version(skillId, version),
      queryFn: ({ signal }) => getSkillVersion(skillId, version, signal),
      staleTime: Infinity,
    }),
  agent: (agentKey: string) =>
    queryOptions({
      queryKey: skillKeys.agent(agentKey),
      queryFn: ({ signal }) => listAgentSkillIds(agentKey, signal),
      enabled: Boolean(agentKey),
    }),
};

export function useSkills() {
  return useQuery(skillQueries.list());
}

export function useAgentSkillIds(agentKey: string) {
  return useQuery(skillQueries.agent(agentKey));
}

export function useSetAgentSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setAgentSkill,
    onMutate: async ({ agentKey, skillId, enabled }) => {
      const key = skillKeys.agent(agentKey);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<string[]>(key);
      if (previous) {
        queryClient.setQueryData(
          key,
          enabled
            ? [...new Set([...previous, skillId])]
            : previous.filter((id) => id !== skillId),
        );
      }
      return { previous };
    },
    onError: (_error, { agentKey }, context) => {
      if (context?.previous)
        queryClient.setQueryData(skillKeys.agent(agentKey), context.previous);
    },
    onSettled: (_data, _error, { agentKey }) =>
      queryClient.invalidateQueries({ queryKey: skillKeys.agent(agentKey) }),
  });
}

/** Installing or disabling changes the listing and every agent's effective skills. */
export function useChangeSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changeSkill,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: skillKeys.list() }),
        queryClient.invalidateQueries({ queryKey: skillKeys.agents() }),
      ]),
  });
}

export function usePublishSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishSkill,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: skillKeys.list() }),
  });
}
