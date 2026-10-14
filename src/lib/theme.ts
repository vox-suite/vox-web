import type { VoxColor } from "./vox-tokens";

export type { VoxColor };

/** CSS reference to a design-system token: `token("coral")` → `var(--vox-coral)`. */
export const token = (name: VoxColor) => `var(--vox-${name})`;
