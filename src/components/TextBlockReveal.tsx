"use client";

import { useRef, useEffect, useMemo, type CSSProperties } from "react";
import { useInView } from "framer-motion";
import { useMultiLineTextScramble } from "@/hooks/useTextScramble";
import "./text-block-reveal.css";

interface TextBlockRevealProps {
  children: string | string[];
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  triggerOnView?: boolean;
  delay?: number;
  stagger?: number;
}

export function TextBlockReveal({
  children,
  as: Tag = "h1",
  className,
  triggerOnView = false,
  delay = 0,
  stagger = 0.15,
}: TextBlockRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10%" });

  const text = Array.isArray(children) ? children.join("") : children;
  const lines = useMemo(() => text.split("\n").filter(Boolean), [text]);

  const { displayLines, resolvedCounts, trigger } = useMultiLineTextScramble(
    lines,
    { duration: 1100, stagger, baseDelay: delay }
  );

  const shouldAnimate = triggerOnView ? isInView : true;

  useEffect(() => {
    if (!shouldAnimate) return;
    const frame = requestAnimationFrame(() => trigger());
    return () => cancelAnimationFrame(frame);
  }, [shouldAnimate, trigger]);

  return (
    <div ref={containerRef} className={shouldAnimate ? "tbr-animate" : undefined}>
      <Tag className={className}>
        {lines.map((line, i) => {
          const lineDelay = delay + i * stagger;
          return (
            <span key={i}>
              {i > 0 && <br />}
              <span
                className="tbr-line relative inline-block"
                style={{ "--tbr-delay": `${lineDelay}s` } as CSSProperties}
                aria-label={line}
              >
                <span className="tbr-line-inner block whitespace-nowrap">
                  <span className="text-[var(--fg-primary)]">
                    {displayLines[i].slice(0, resolvedCounts[i])}
                  </span>
                  <span className="text-[var(--bg-brand-solid)]">
                    {displayLines[i].slice(resolvedCounts[i])}
                  </span>
                </span>
                <span
                  className="tbr-rect tbr-brand absolute inset-x-[-0.1em] inset-y-[-0.05em] bg-[var(--bg-brand-solid)]"
                  aria-hidden="true"
                />
                <span
                  className="tbr-rect tbr-fg absolute inset-x-[-0.1em] inset-y-[-0.05em] bg-[var(--fg-primary)]"
                  aria-hidden="true"
                />
              </span>
            </span>
          );
        })}
      </Tag>
    </div>
  );
}
