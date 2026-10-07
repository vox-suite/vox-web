"use client";

// Adapted from Aceternity UI's Container Scroll Animation, distributed on 21st.dev.
// Source: https://cdn.21st.dev/user_aceternity/container-scroll-animation.tsx
// Vox adaptation: Motion's current import, semantic styling, bounded scroll range,
// and a static presentation for reduced motion and narrow screens.
import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

export function ContainerScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [12, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  return (
    <div ref={ref} className="vox-scroll-container">
      <motion.div
        className="vox-scroll-card"
        style={{
          rotateX: reducedMotion ? 0 : rotate,
          scale: reducedMotion ? 1 : scale,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
