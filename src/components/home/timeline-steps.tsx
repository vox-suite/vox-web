"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function TimelineSteps({
  steps,
  shots,
}: {
  steps: { title: string; text: string }[];
  shots: ReactNode[];
}) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.i));
        }
      },
      { rootMargin: "-49% 0px -49% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="h-steps">
      <div className="h-steps-stage">
        <div className="h-steps-pin">
          {shots.map((shot, i) => (
            <div key={steps[i].title} className="h-steps-shot" data-active={active === i}>
              {shot}
            </div>
          ))}
        </div>
      </div>
      <ol className="h-steps-list">
        {steps.map((step, i) => (
          <li
            key={step.title}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-i={i}
            data-active={active === i}
            className="h-step"
          >
            <span className="h-step-no">0{i + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
