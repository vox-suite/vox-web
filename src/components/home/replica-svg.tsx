"use client";

import { useEffect, useRef, useState } from "react";

const cache = new Map<string, Promise<string>>();

function load(name: string) {
  let pending = cache.get(name);
  if (!pending) {
    pending = fetch(`/replicas/${name}.svg`).then((res) => {
      if (!res.ok) throw new Error(`Missing replica ${name}`);
      return res.text();
    });
    cache.set(name, pending);
  }
  return pending;
}

export function ReplicaSvg({
  name,
  box,
  label,
}: {
  name: string;
  box: [number, number, number, number];
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [markup, setMarkup] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        load(name)
          .then((text) => {
            if (!cancelled) setMarkup(text);
          })
          .catch(() => {});
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [name]);

  const html = markup.replace(
    /^<svg [^>]*>/,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.join(" ")}" width="100%" height="100%" preserveAspectRatio="xMinYMin slice" aria-hidden="true" focusable="false">`,
  );

  return (
    <div
      ref={ref}
      className="h-replica"
      role="img"
      aria-label={label}
      style={{ aspectRatio: `${box[2]} / ${box[3]}` }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
