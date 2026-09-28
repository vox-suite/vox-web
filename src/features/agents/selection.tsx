"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useAgents } from "./queries";
import { resolveAgentKey } from "./components/agent-picker";
const Selection = createContext<{
  picked: string | null;
  select: (key: string) => void;
} | null>(null);
export function AgentSelectionProvider({ children }: { children: ReactNode }) {
  const [picked, select] = useState<string | null>(null);
  return (
    <Selection.Provider value={{ picked, select }}>
      {children}
    </Selection.Provider>
  );
}
export function useSelectedAgent() {
  const selection = useContext(Selection);
  const agents = useAgents();
  // Standalone embedded panels can use a local selection too.
  const [local, setLocal] = useState<string | null>(null);
  return {
    agentKey: resolveAgentKey(selection?.picked ?? local, agents.data),
    selectAgent: selection?.select ?? setLocal,
  };
}
