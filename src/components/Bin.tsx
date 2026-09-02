"use client";

import { useId, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

interface BinProps {
  label: string;
  children: ReactNode;
  /** Free Resources ships open on every viewport. */
  defaultOpen?: boolean;
  /** Position in the stack — drives the page-load stagger. */
  index?: number;
  /** Skip the default dark panel chrome; the child renders its own containers. */
  bare?: boolean;
}

/**
 * An "interactive bin": a uniform 52px liquid-glass pill that expands a
 * panel beneath it. Every open bin takes the same aperol tint, so the
 * open/closed state reads consistently down the stack.
 */
export function Bin({
  label,
  children,
  defaultOpen = false,
  index = 0,
  bare = false,
}: BinProps) {
  const [open, setOpen] = useState(defaultOpen);
  // While the height animation runs we clip; once settled we let card hover
  // shadows and lifts escape the panel bounds.
  const [settled, setSettled] = useState(defaultOpen);
  const reduceMotion = useReducedMotion();
  const panelId = useId();

  return (
    <motion.div
      className="bin"
      data-open={open}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.35 + index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <button
        type="button"
        className="bin-header"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpen((o) => !o);
          setSettled(false);
        }}
      >
        <span className="bin-label">{label}</span>
        <motion.span
          className="bin-chevron"
          aria-hidden="true"
          animate={{ rotate: open ? -90 : 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="panel"
            id={panelId}
            role="region"
            aria-label={label}
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{
              height: { type: "spring", duration: 0.55, bounce: 0.12 },
              opacity: { duration: 0.22, ease: "easeOut" },
            }}
            style={{ overflow: settled ? "visible" : "hidden" }}
            onAnimationComplete={() => setSettled(true)}
          >
            {bare ? (
              <div className="bin-panel-bare">{children}</div>
            ) : (
              <div className="bin-panel">{children}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
