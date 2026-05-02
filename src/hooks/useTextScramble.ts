"use client";

import { useState, useCallback, useRef, useEffect } from "react";

const SCRAMBLE_CHARS = "█▓▒░▮▯▰▱▣▤▥▦▧▨@#$%^&*()_+[]{}|;:,.<>?~";

interface UseMultiLineTextScrambleOptions {
  duration?: number;
  stagger?: number;
  baseDelay?: number;
}

interface UseMultiLineTextScrambleReturn {
  displayLines: string[];
  resolvedCounts: number[];
  trigger: () => void;
}

export function useMultiLineTextScramble(
  lines: string[],
  options: UseMultiLineTextScrambleOptions = {}
): UseMultiLineTextScrambleReturn {
  const { duration = 1000, stagger = 0.15, baseDelay = 0 } = options;
  const [displayLines, setDisplayLines] = useState<string[]>(lines);
  const [resolvedCounts, setResolvedCounts] = useState<number[]>(
    () => lines.map((l) => l.length)
  );
  const animationRef = useRef<number | null>(null);
  const triggeredRef = useRef(false);

  const trigger = useCallback(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;

    const startTime = performance.now();
    const lineCount = lines.length;
    const TICK_INTERVAL = 80;
    let lastTickTime = 0;
    const scrambleCache: string[] = lines.map(() => "");

    const easeInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const shouldRetick = now - lastTickTime >= TICK_INTERVAL;
      if (shouldRetick) lastTickTime = now;

      let allDone = true;
      const next: string[] = [];
      const nextCounts: number[] = [];

      for (let li = 0; li < lineCount; li++) {
        const lineDelayMs = (baseDelay + li * stagger) * 1000;
        const lineElapsed = elapsed - lineDelayMs;

        if (lineElapsed < 0) {
          next.push(lines[li]);
          nextCounts.push(lines[li].length);
          allDone = false;
        } else {
          const linear = Math.min(lineElapsed / duration, 1);
          const progress = easeInOut(linear);
          if (linear >= 1) {
            next.push(lines[li]);
            nextCounts.push(lines[li].length);
          } else {
            allDone = false;
            const text = lines[li];
            const targetRevealed = Math.floor(progress * text.length);
            nextCounts.push(targetRevealed);

            if (shouldRetick || !scrambleCache[li]) {
              let result = "";
              for (let i = 0; i < text.length; i++) {
                if (i < targetRevealed) {
                  result += text[i];
                } else if (text[i] === " ") {
                  result += " ";
                } else {
                  result +=
                    SCRAMBLE_CHARS[
                      Math.floor(Math.random() * SCRAMBLE_CHARS.length)
                    ];
                }
              }
              scrambleCache[li] = result;
            } else {
              const cached = scrambleCache[li];
              scrambleCache[li] =
                text.slice(0, targetRevealed) + cached.slice(targetRevealed);
            }
            next.push(scrambleCache[li]);
          }
        }
      }

      setDisplayLines(next);
      setResolvedCounts(nextCounts);

      if (!allDone) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [lines, duration, stagger, baseDelay]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return { displayLines, resolvedCounts, trigger };
}
